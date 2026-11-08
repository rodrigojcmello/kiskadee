import path from 'node:path';
import ts from 'typescript';
import type { Documentation, InspectionModel, TypeDefinition } from '../src/model/inspection.ts';

export interface InspectionTarget {
  file: string;
  exportName: string;
  path?: string[];
  tsconfig: string;
}

// Resolution/heritage failures can omit entire inherited branches without leaving an `any` node.
// Assignment and implementation diagnostics are intentionally not a substitute for project checks.
const structuralDiagnosticCodes = new Set([
  2304, 2305, 2306, 2307, 2310, 2312, 2313, 2314, 2315, 2318, 2456, 2459, 2503, 2506, 2507, 2509,
  2510, 2589, 2590, 2688, 2694, 2707, 2724, 2792, 2840, 7016
]);

/** Read the selected type and its documentation without executing the inspected module. */
export function extractInspectionModel(target: InspectionTarget): InspectionModel {
  const configPath = path.resolve(target.tsconfig);
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) throw new Error(formatDiagnostic(config.error));
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    path.dirname(configPath),
    undefined,
    configPath
  );
  if (parsed.errors.length) throw new Error(parsed.errors.map(formatDiagnostic).join('\n'));
  const entry = path.resolve(target.file);
  const program = ts.createProgram([entry], { ...parsed.options, noEmit: true });
  const syntaxErrors = program.getSyntacticDiagnostics();
  if (syntaxErrors.length) throw new Error(syntaxErrors.map(formatDiagnostic).join('\n'));
  const resolutionErrors = [
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...program.getSemanticDiagnostics()
  ].filter((diagnostic) => structuralDiagnosticCodes.has(diagnostic.code));
  if (resolutionErrors.length) {
    throw new Error(
      `Type resolution failed:\n${resolutionErrors.map(formatDiagnostic).join('\n')}`
    );
  }
  const source = program.getSourceFile(entry);
  if (!source) throw new Error(`Inspection source could not be loaded: ${entry}`);
  const checker = program.getTypeChecker();
  const sourceSymbol = checker.getSymbolAtLocation(source);
  const exported =
    sourceSymbol &&
    checker.getExportsOfModule(sourceSymbol).find((symbol) => symbol.name === target.exportName);
  if (!exported) throw new Error(`Export "${target.exportName}" was not found in ${entry}`);
  const symbol =
    exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0] ?? source;
  let type =
    symbol.flags & ts.SymbolFlags.TypeAlias || symbol.flags & ts.SymbolFlags.Interface
      ? checker.getDeclaredTypeOfSymbol(symbol)
      : checker.getTypeOfSymbolAtLocation(symbol, declaration);
  let rootSymbol = symbol;
  for (const key of target.path ?? []) {
    type = checker.getNonNullableType(type);
    const property = checker.getPropertyOfType(type, key);
    if (!property)
      throw new Error(
        `Inspection property "${key}" was not found in ${checker.typeToString(type)}`
      );
    rootSymbol = property;
    type = checker.getTypeOfSymbolAtLocation(
      property,
      property.valueDeclaration ?? property.declarations?.[0] ?? declaration
    );
  }
  // Selecting an optional property omits its absence marker, but explicit null remains a type.
  let rootAlternatives: ts.Type[] | undefined;
  if (rootSymbol.flags & ts.SymbolFlags.Optional && type.isUnion()) {
    const suppliedTypes = type.types.filter((member) => !(member.flags & ts.TypeFlags.Undefined));
    if (suppliedTypes.length === 1) type = suppliedTypes[0];
    else rootAlternatives = suppliedTypes;
  }
  if (type.flags & ts.TypeFlags.Any)
    throw new Error('The inspection target resolved to any; its structure is unavailable.');

  const definitions: Record<string, TypeDefinition> = {};
  const ids = new Map<ts.Type, string>();
  const diagnostics: InspectionModel['diagnostics'] = [];
  const baseDirectory = path.dirname(configPath);

  function documentationOf(
    symbolToRead: ts.Symbol | undefined,
    kind: 'property' | 'type'
  ): Documentation | undefined {
    if (!symbolToRead) return undefined;
    const at = symbolToRead.declarations?.[0];
    // Utility comments describe Partial/Pick/Array, not the inspected domain property.
    if (kind === 'type' && at && program.isSourceFileDefaultLibrary(at.getSourceFile()))
      return undefined;
    const description = ts
      .displayPartsToString(symbolToRead.getDocumentationComment(checker))
      .trim();
    const tag = symbolToRead.getJsDocTags(checker).find((item) => item.name === 'summary');
    const summary = tag && ts.displayPartsToString(tag.text).trim();
    if (!description && !summary) return undefined;
    return {
      ...(description ? { description } : {}),
      ...(summary ? { summary } : {}),
      ...(at
        ? {
            source: {
              file: path
                .relative(baseDirectory, at.getSourceFile().fileName)
                .split(path.sep)
                .join('/'),
              line: at.getSourceFile().getLineAndCharacterOfPosition(at.getStart()).line + 1,
              kind
            }
          }
        : {})
    };
  }

  function typeDocumentation(
    value: ts.Type,
    visited = new Set<ts.Type>()
  ): Documentation | undefined {
    if (visited.has(value)) return undefined;
    visited.add(value);
    const own =
      documentationOf(value.aliasSymbol, 'type') ?? documentationOf(value.getSymbol(), 'type');
    if (own) return own;
    if (value.isUnionOrIntersection()) {
      const concrete = value.types.filter((member) => !(member.flags & ts.TypeFlags.Undefined));
      if (concrete.length === 1) return typeDocumentation(concrete[0], visited);
    }
    return undefined;
  }

  function unsupported(definition: TypeDefinition, message: string) {
    definition.kind = 'unsupported';
    diagnostics.push({ typeId: definition.id, message });
  }

  function indexKeyPattern(key: ts.Type, definition: TypeDefinition): string | undefined {
    if (key.flags & (ts.TypeFlags.String | ts.TypeFlags.Number)) return undefined;
    if (key.flags & ts.TypeFlags.TemplateLiteral) {
      const template = key as ts.TemplateLiteralType;
      if (template.types.every((part) => part.flags & ts.TypeFlags.String)) {
        const escapePattern = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return `^${template.texts.map(escapePattern).join('[\\s\\S]*')}$`;
      }
    }
    diagnostics.push({
      typeId: definition.id,
      message: `Observed JSON keys are not matched for index key type ${checker.typeToString(key)}.`
    });
    return undefined;
  }

  function visit(value: ts.Type): string {
    const previous = ids.get(value);
    if (previous) return previous;
    const id = `t${ids.size + 1}`;
    ids.set(value, id);
    const definition: TypeDefinition = {
      id,
      kind: 'primitive',
      label: checker.typeToString(value, undefined, ts.TypeFormatFlags.NoTruncation),
      documentation: typeDocumentation(value)
    };
    definitions[id] = definition;

    if (value.flags & ts.TypeFlags.Boolean) {
      definition.label = 'boolean';
      return id;
    }
    if (value.flags & ts.TypeFlags.StringLiteral) {
      definition.kind = 'literal';
      definition.literal = (value as ts.StringLiteralType).value;
      return id;
    }
    if (value.flags & ts.TypeFlags.NumberLiteral) {
      definition.kind = 'literal';
      definition.literal = (value as ts.NumberLiteralType).value;
      return id;
    }
    if (value.flags & ts.TypeFlags.BooleanLiteral) {
      definition.kind = 'literal';
      definition.literal = definition.label === 'true';
      return id;
    }
    if (value.flags & ts.TypeFlags.Null) {
      definition.kind = 'literal';
      definition.literal = null;
      return id;
    }
    if (value.isUnion()) {
      definition.kind = 'union';
      definition.alternatives = value.types.map(visit);
      return id;
    }
    if (checker.isTupleType(value)) {
      definition.kind = 'tuple';
      const reference = value as ts.TypeReference;
      const flags = (reference.target as ts.TupleType).elementFlags;
      if (flags.some((flag) => flag & (ts.ElementFlags.Rest | ts.ElementFlags.Variadic))) {
        unsupported(
          definition,
          `Variadic tuple ${definition.label} is not expanded as a finite list.`
        );
        return id;
      }
      definition.tupleItems = checker.getTypeArguments(reference).map((item, index) => ({
        typeId: visit(item),
        optional: Boolean(flags[index] & ts.ElementFlags.Optional)
      }));
      return id;
    }
    if (checker.isArrayType(value)) {
      definition.kind = 'array';
      const element = checker.getIndexTypeOfType(value, ts.IndexKind.Number);
      if (element) definition.elementTypeId = visit(element);
      else unsupported(definition, `Array item type is unavailable for ${definition.label}.`);
      return id;
    }
    if (
      checker.getSignaturesOfType(value, ts.SignatureKind.Call).length ||
      checker.getSignaturesOfType(value, ts.SignatureKind.Construct).length
    ) {
      unsupported(definition, `Callable type ${definition.label} has no JSON property structure.`);
      return id;
    }
    const unresolved =
      ts.TypeFlags.Any |
      ts.TypeFlags.TypeParameter |
      ts.TypeFlags.Conditional |
      ts.TypeFlags.IndexedAccess |
      ts.TypeFlags.ESSymbol |
      ts.TypeFlags.UniqueESSymbol |
      ts.TypeFlags.BigInt |
      ts.TypeFlags.BigIntLiteral;
    if (value.flags & unresolved) {
      unsupported(definition, `The structure of ${definition.label} is not expanded.`);
      return id;
    }
    const properties = checker.getPropertiesOfType(value);
    const signatures = checker.getIndexInfosOfType(value);
    if (value.flags & ts.TypeFlags.Object || value.isIntersection()) {
      if (value.isIntersection() && properties.length === 0 && signatures.length === 0) {
        definition.kind = 'intersection';
        definition.alternatives = value.types.map(visit);
        return id;
      }
      definition.kind = 'object';
      definition.properties = properties.map((property) => {
        const at = property.valueDeclaration ?? property.declarations?.[0] ?? declaration;
        const propertyType = checker.getTypeOfSymbolAtLocation(property, at);
        return {
          key: property.name,
          typeId: visit(propertyType),
          optional: Boolean(property.flags & ts.SymbolFlags.Optional),
          documentation: documentationOf(property, 'property') ?? typeDocumentation(propertyType)
        };
      });
      if (signatures.length)
        definition.indexSignatures = signatures.map((signature) => ({
          keyType: checker.typeToString(signature.keyType),
          typeId: visit(signature.type),
          keyPattern: indexKeyPattern(signature.keyType, definition)
        }));
    }
    return id;
  }

  let rootTypeId: string;
  if (rootAlternatives) {
    rootTypeId = 'root';
    definitions[rootTypeId] = {
      id: rootTypeId,
      kind: 'union',
      label: rootAlternatives.map((member) => checker.typeToString(member)).join(' | '),
      alternatives: rootAlternatives.map(visit),
      documentation: typeDocumentation(type)
    };
  } else rootTypeId = visit(type);
  return {
    root: {
      name: target.path?.at(-1) ?? target.exportName,
      typeId: rootTypeId,
      documentation:
        documentationOf(rootSymbol, target.path?.length ? 'property' : 'type') ??
        typeDocumentation(type)
    },
    definitions,
    source: {
      file: path.relative(baseDirectory, entry).split(path.sep).join('/'),
      exportName: target.exportName,
      path: [...(target.path ?? [])]
    },
    diagnostics
  };
}

function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  return diagnostic.file && diagnostic.start !== undefined
    ? `${diagnostic.file.fileName}:${diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1}: ${message}`
    : message;
}
