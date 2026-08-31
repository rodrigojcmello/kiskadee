import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { createStrictPresetColorResolver } from '../../utils/presetColor.ts';
import type {
  Fluent2MicrosoftColorLocator,
  Fluent2MicrosoftColorResolver
} from './fluent-2-microsoft.color.ts';
import { fluent2MicrosoftColorEvidence } from './fluent-2-microsoft.color-evidence.ts';
import { schemaColors } from './fluent-2-microsoft.colors.ts';
import { createFluent2MicrosoftSchema } from './fluent-2-microsoft.schema.ts';

const ROOT = dirname(fileURLToPath(import.meta.url));
const EVIDENCE_ROOT = resolve(ROOT, '../../../docs/design-systems/fluent-2-microsoft');
const COLOR_HELPERS_FILE = 'fluent-2-microsoft.color.ts';
const PROMOTED_ASSET_FILES = new Set([
  'colors/b.blue.v1.ts',
  'colors/g.green.v1.ts',
  'colors/n.black.v1.ts',
  'colors/n.black.v2.ts',
  'colors/p.purple.v1.ts',
  'colors/r.red.v1.ts',
  'colors/y.yellow.v1.ts',
  'colors/yr.orange.v1.ts'
]);
const ALLOWED_WITH_ALPHA_FILES = new Set([
  'components/button-brand-projector.ts',
  'components/button-color-formula.ts',
  'components/button-perceptual-alpha.ts'
]);
const ALLOWED_TONE_SHIFT_FILES = new Set(['components/button-brand-projector.ts']);
const FORBIDDEN_IMPORTS = new Set([
  'PresetColorGetter',
  'createPresetColorGetter',
  'color',
  'colorByReference',
  'resolveColor'
]);
const COLOR_LITERAL =
  /^(?:#[0-9a-f]{3,8}|(?:rgb|hsl|hwb|lab|lch|oklab|oklch|color|color-mix|var)a?\s*\(|white$|black$|transparent$)/i;

type ImportedBinding = {
  importedName: string;
  moduleSpecifier: string;
};

type LocatorInvocation = {
  segmentName: 'default';
  theme: 'l' | 'd';
  locator: Fluent2MicrosoftColorLocator;
};

function collectProductionFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const absolute = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        return collectProductionFiles(absolute);
      }
      if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name.endsWith('.test.ts')) {
        return [];
      }
      const file = relative(ROOT, absolute).replaceAll('\\', '/');
      if (PROMOTED_ASSET_FILES.has(file)) return [];
      return [absolute];
    });
}

function literalText(expression: ts.Expression | undefined): string | undefined {
  return expression && ts.isStringLiteralLike(expression) ? expression.text : undefined;
}

function markdownHeadingAnchor(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replaceAll(/[`*_]/g, '')
    .replaceAll(/[^\p{L}\p{N}\s-]/gu, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-');
}

function isAuditedColorModule(moduleSpecifier: string): boolean {
  return (
    moduleSpecifier === '@kiskadee/core' ||
    moduleSpecifier.endsWith('/utils/presetColor.ts') ||
    moduleSpecifier.endsWith('/fluent-2-microsoft.color.ts')
  );
}

function isPrimitiveBlackV1(
  expression: ts.Expression | undefined,
  imports: Map<string, ImportedBinding>
): boolean {
  if (!expression || !ts.isCallExpression(expression) || !ts.isIdentifier(expression.expression)) {
    return false;
  }
  const binding = imports.get(expression.expression.text);
  return (
    binding?.moduleSpecifier === '@kiskadee/core' &&
    binding.importedName === 'primitive' &&
    literalText(expression.arguments[0]) === 'black' &&
    literalText(expression.arguments[1]) === 'v1' &&
    expression.arguments.length === 2
  );
}

function uniqueSorted<T>(entries: readonly T[]): T[] {
  return [...new Map(entries.map((entry) => [JSON.stringify(entry), entry])).values()].sort(
    (left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))
  );
}

describe('Fluent 2 Microsoft Functional Reference First policy', () => {
  it('keeps every authored base color behind a reference, evidenced exact, or physical cap', () => {
    const violations: string[] = [];
    const locatorInvocations: LocatorInvocation[] = [];
    const strictResolver = createStrictPresetColorResolver<
      'default',
      typeof fluent2MicrosoftColorEvidence
    >({
      colors: schemaColors,
      exactEvidence: fluent2MicrosoftColorEvidence
    });
    const recordingResolver: Fluent2MicrosoftColorResolver = {
      resolve(segmentName, theme, locator) {
        locatorInvocations.push({ segmentName, theme, locator });
        return strictResolver.resolve(segmentName, theme, locator);
      }
    };
    createFluent2MicrosoftSchema(recordingResolver);

    for (const absolutePath of collectProductionFiles(ROOT)) {
      const file = relative(ROOT, absolutePath).replaceAll('\\', '/');
      const source = ts.createSourceFile(
        absolutePath,
        readFileSync(absolutePath, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      );
      const importedNames = new Map<string, ImportedBinding>();

      for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
        const clause = statement.importClause;
        const moduleSpecifier = literalText(statement.moduleSpecifier) ?? '';
        if (clause.name && isAuditedColorModule(moduleSpecifier)) {
          violations.push(`${file}: default imports from ${moduleSpecifier} are not auditable`);
        }
        if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
          if (isAuditedColorModule(moduleSpecifier)) {
            violations.push(`${file}: namespace imports from ${moduleSpecifier} are not auditable`);
          }
          continue;
        }
        if (!clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;
        for (const specifier of clause.namedBindings.elements) {
          importedNames.set(specifier.name.text, {
            importedName: specifier.propertyName?.text ?? specifier.name.text,
            moduleSpecifier
          });
        }
      }

      for (const [localName, binding] of importedNames) {
        const { importedName } = binding;
        if (isAuditedColorModule(binding.moduleSpecifier) && FORBIDDEN_IMPORTS.has(importedName)) {
          violations.push(`${file}: forbidden color bypass import ${importedName} as ${localName}`);
        }
        if (importedName === 'withAlpha' && !ALLOWED_WITH_ALPHA_FILES.has(file)) {
          violations.push(`${file}: withAlpha is allowed only in audited derived-color helpers`);
        }
        if (importedName === 'shiftKiskadeeTone' && !ALLOWED_TONE_SHIFT_FILES.has(file)) {
          violations.push(`${file}: shiftKiskadeeTone is allowed only in the Brand terminal`);
        }
      }

      const visit = (node: ts.Node): void => {
        const isPrimitiveFamilyArgument =
          (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
          ts.isCallExpression(node.parent) &&
          node.parent.arguments[0] === node &&
          ts.isIdentifier(node.parent.expression) &&
          importedNames.get(node.parent.expression.text)?.moduleSpecifier === '@kiskadee/core' &&
          importedNames.get(node.parent.expression.text)?.importedName === 'primitive';
        if (
          (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
          COLOR_LITERAL.test(node.text.trim()) &&
          !isPrimitiveFamilyArgument
        ) {
          violations.push(
            `${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}: raw color literal ${node.text}`
          );
        }

        if (ts.isObjectLiteralExpression(node) && file !== COLOR_HELPERS_FILE) {
          for (const property of node.properties) {
            if (!ts.isPropertyAssignment(property)) continue;
            const name = property.name.getText(source).replaceAll(/['"]/g, '');
            const value = literalText(property.initializer);
            if (name === 'mode' && (value === 'exact' || value === 'cap')) {
              violations.push(`${file}: raw ${value} locator must use the Fluent helper`);
            }
          }
        }

        if (ts.isCallExpression(node)) {
          if (ts.isIdentifier(node.expression) && node.expression.text === 'c') {
            violations.push(`${file}: direct c(...) color lookup is forbidden`);
          }
          if (
            ts.isPropertyAccessExpression(node.expression) &&
            ts.isIdentifier(node.expression.expression) &&
            node.expression.expression.text === 'c' &&
            node.expression.name.text === 'ref'
          ) {
            violations.push(`${file}: direct c.ref(...) color lookup is forbidden`);
          }

          if (ts.isIdentifier(node.expression)) {
            const importedName =
              importedNames.get(node.expression.text)?.importedName ?? node.expression.text;
            if (importedName === 'exactColor' || importedName === 'familyExactColor') {
              const isFamily = importedName === 'familyExactColor';
              const toneArgument = node.arguments[isFamily ? 0 : 1];
              const evidenceId = literalText(node.arguments[isFamily ? 1 : 2]);
              if (!evidenceId) {
                violations.push(`${file}: ${importedName} requires a literal evidenceId`);
              }
              if (
                toneArgument &&
                ts.isNumericLiteral(toneArgument) &&
                (toneArgument.text === '0' || toneArgument.text === '100')
              ) {
                violations.push(
                  `${file}: physical endpoint tone ${toneArgument.text} must use absoluteCap`
                );
              }
            }

            if (importedName === 'absoluteCap') {
              if (!isPrimitiveBlackV1(node.arguments[0], importedNames)) {
                violations.push(`${file}: Fluent caps must use primitive.black.v1`);
              }
            }
          }
        }

        ts.forEachChild(node, visit);
      };

      visit(source);
    }

    const exactInventory = uniqueSorted(
      locatorInvocations.flatMap(({ segmentName, theme, locator }) =>
        locator.mode === 'exact'
          ? [
              {
                segmentName,
                theme,
                role: locator.role,
                tone: locator.tone,
                evidenceId: locator.evidenceId,
                alpha: locator.alpha ?? null
              }
            ]
          : []
      )
    );
    const referenceInventory = uniqueSorted(
      locatorInvocations.flatMap(({ segmentName, theme, locator }) =>
        locator.mode === 'reference'
          ? [
              {
                segmentName,
                theme,
                role: locator.role,
                reference: locator.reference,
                offset: locator.offset ?? 0,
                alpha: locator.alpha ?? null
              }
            ]
          : []
      )
    );
    const capInventory = uniqueSorted(
      locatorInvocations.flatMap(({ segmentName, theme, locator }) =>
        locator.mode === 'cap'
          ? [
              {
                segmentName,
                theme,
                primitive: locator.primitive,
                polarity: locator.polarity,
                alpha: locator.alpha ?? null
              }
            ]
          : []
      )
    );

    for (const exact of exactInventory) {
      if (exact.tone === 0 || exact.tone === 100) {
        violations.push(
          `${exact.evidenceId}: physical endpoint tone ${exact.tone} must use a cap locator`
        );
      }
    }

    const registeredEvidence = Object.keys(fluent2MicrosoftColorEvidence).sort();
    const usedEvidence = [...new Set(exactInventory.map(({ evidenceId }) => evidenceId))].sort();

    for (const [evidenceId, evidence] of Object.entries(fluent2MicrosoftColorEvidence)) {
      const [relativePath, anchor, ...extra] = evidence.source.split('#');
      if (!relativePath || !anchor || extra.length > 0) {
        violations.push(`${evidenceId}: evidence source must contain one file path and anchor`);
        continue;
      }

      const evidencePath = resolve(EVIDENCE_ROOT, relativePath);
      if (!existsSync(evidencePath)) {
        violations.push(`${evidenceId}: evidence file does not exist: ${relativePath}`);
        continue;
      }

      const anchors = readFileSync(evidencePath, 'utf8')
        .split(/\r?\n/)
        .flatMap((line) => {
          const match = /^(?:#{1,6})\s+(.+)$/.exec(line);
          return match?.[1] ? [markdownHeadingAnchor(match[1])] : [];
        });
      if (!anchors.includes(anchor)) {
        violations.push(`${evidenceId}: evidence anchor does not exist: ${evidence.source}`);
      }
    }

    expect(violations).toEqual([]);
    expect(usedEvidence).toEqual(registeredEvidence);
    expect({ exactInventory, referenceInventory, capInventory }).toMatchSnapshot();
  });
});
