import type { Documentation, InspectionModel, JsonValue, TypeDefinition } from './inspection.ts';

export type NodeSegment =
  | { kind: 'property'; key: string }
  | { kind: 'index'; index: number }
  | { kind: 'alternative'; index: number }
  | { kind: 'item' }
  | { kind: 'signature'; index: number };

export type NodeReference =
  | {
      kind: 'none';
      applicable?: false;
      scope?: 'contract' | 'alternative' | 'incompatible';
    }
  | { kind: 'missing' }
  | { kind: 'value'; value: JsonValue };

export interface InspectionNode {
  id: string;
  parentId?: string;
  rootName: string;
  path: NodeSegment[];
  label: string;
  typeId: string;
  typeLabel: string;
  documentation?: Documentation;
  optional: boolean;
  reference: NodeReference;
  recursive: boolean;
  ancestorTypeIds: string[];
}

const NO_REFERENCE: NodeReference = { kind: 'none' };
const CONTRACT_REFERENCE: NodeReference = { kind: 'none', applicable: false, scope: 'contract' };
const MISSING_REFERENCE: NodeReference = { kind: 'missing' };

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function definition(model: InspectionModel, id: string): TypeDefinition {
  return model.definitions[id] ?? { id, kind: 'unsupported', label: 'Unresolved type' };
}

function isUndefined(type: TypeDefinition): boolean {
  return type.kind === 'primitive' && type.label === 'undefined';
}

/** Optionality is kept in the contract, while one concrete form can expose its properties directly. */
export function getNavigationDefinition(
  model: InspectionModel,
  node: InspectionNode
): TypeDefinition {
  let type = definition(model, node.typeId);
  const seen = new Set<string>();
  while (node.optional && type.kind === 'union' && !seen.has(type.id)) {
    seen.add(type.id);
    const forms = (type.alternatives ?? [])
      .map((id) => definition(model, id))
      .filter((t) => !isUndefined(t));
    if (forms.length !== 1) break;
    type = forms[0];
  }
  return type;
}

function nodeId(rootName: string, path: NodeSegment[]): string {
  return JSON.stringify([rootName, ...path]);
}

export function createRootNode(
  model: InspectionModel,
  reference?: JsonValue,
  enabled = true
): InspectionNode {
  const type = definition(model, model.root.typeId);
  return {
    id: nodeId(model.root.name, []),
    rootName: model.root.name,
    path: [],
    label: model.root.name,
    typeId: type.id,
    typeLabel: type.label,
    documentation: model.root.documentation ?? type.documentation,
    optional: false,
    reference:
      enabled && reference !== undefined ? { kind: 'value', value: reference } : NO_REFERENCE,
    recursive: false,
    ancestorTypeIds: []
  };
}

function childNode(
  model: InspectionModel,
  parent: InspectionNode,
  segment: NodeSegment,
  label: string,
  typeId: string,
  reference: NodeReference,
  optional = false,
  documentation?: Documentation
): InspectionNode {
  const type = definition(model, typeId);
  const path = [...parent.path, segment];
  const structuralParent = getNavigationDefinition(model, parent);
  const ancestorTypeIds = [
    ...new Set([...parent.ancestorTypeIds, parent.typeId, structuralParent.id])
  ];
  const child: InspectionNode = {
    id: nodeId(parent.rootName, path),
    parentId: parent.id,
    rootName: parent.rootName,
    path,
    label,
    typeId,
    typeLabel: type.label,
    documentation: documentation ?? type.documentation,
    optional,
    reference,
    recursive: ancestorTypeIds.includes(typeId),
    ancestorTypeIds
  };
  const structuralChild = getNavigationDefinition(model, child);
  child.recursive ||= ancestorTypeIds.includes(structuralChild.id);
  child.documentation ??= structuralChild.documentation;
  return child;
}

function propertyReference(parent: NodeReference, key: string): NodeReference {
  if (parent.kind !== 'value') return parent;
  if (!isObject(parent.value)) return { kind: 'none', applicable: false, scope: 'incompatible' };
  return Object.hasOwn(parent.value, key)
    ? { kind: 'value', value: parent.value[key] }
    : MISSING_REFERENCE;
}

function indexReference(parent: NodeReference, index: number): NodeReference {
  if (parent.kind !== 'value') return parent;
  if (!Array.isArray(parent.value))
    return { kind: 'none', applicable: false, scope: 'incompatible' };
  return Object.hasOwn(parent.value, index)
    ? { kind: 'value', value: parent.value[index] }
    : MISSING_REFERENCE;
}

function allowsJsonValue(model: InspectionModel, id: string, seen = new Set<string>()): boolean {
  if (seen.has(id)) return true;
  const nextSeen = new Set(seen).add(id);
  const type = definition(model, id);
  if (type.kind === 'primitive' && ['never', 'undefined', 'void'].includes(type.label))
    return false;
  if (type.kind === 'union')
    return (type.alternatives ?? []).some((t) => allowsJsonValue(model, t, nextSeen));
  if (type.kind === 'intersection')
    return (type.alternatives ?? []).every((t) => allowsJsonValue(model, t, nextSeen));
  return true;
}

/** This selects an overlay using outer keys and value shape, not full TypeScript assignability. */
function matchesShape(
  model: InspectionModel,
  id: string,
  value: JsonValue,
  seen = new Set<string>()
): boolean {
  if (seen.has(id)) return true;
  const nextSeen = new Set(seen).add(id);
  const type = definition(model, id);
  if (type.kind === 'literal') return type.literal === value;
  if (type.kind === 'array' || type.kind === 'tuple') return Array.isArray(value);
  if (type.kind === 'object' || type.properties?.length || type.indexSignatures?.length) {
    if (!isObject(value)) return false;
    const properties = new Map((type.properties ?? []).map((p) => [p.key, p]));
    if ((type.properties ?? []).some((p) => !p.optional && !Object.hasOwn(value, p.key)))
      return false;
    for (const key of Object.keys(value)) {
      const property = properties.get(key);
      if (property) {
        if (!allowsJsonValue(model, property.typeId)) return false;
      } else {
        const signature = type.indexSignatures?.find((s) => matchesIndexKey(s, key));
        if (!signature || !allowsJsonValue(model, signature.typeId)) return false;
      }
    }
    return true;
  }
  if (type.kind === 'union')
    return (type.alternatives ?? []).some((t) => matchesShape(model, t, value, nextSeen));
  if (type.kind === 'intersection')
    return (type.alternatives ?? []).every((t) => matchesShape(model, t, value, nextSeen));
  if (type.kind === 'unsupported') return false;
  switch (type.label) {
    case 'null':
      return value === null;
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'undefined':
    case 'never':
    case 'void':
      return false;
    case 'unknown':
    case 'any':
      return true;
    default:
      return false;
  }
}

function matchesIndexKey(
  signature: NonNullable<TypeDefinition['indexSignatures']>[number],
  key: string
): boolean {
  if (signature.keyPattern) return new RegExp(signature.keyPattern).test(key);
  if (signature.keyType === 'string') return true;
  if (signature.keyType === 'number')
    return Number.isFinite(Number(key)) && String(Number(key)) === key;
  return false;
}

export function getNodeChildren(model: InspectionModel, node: InspectionNode): InspectionNode[] {
  if (node.recursive) return [];
  const type = getNavigationDefinition(model, node);
  if (type.properties?.length || type.indexSignatures?.length || type.kind === 'object') {
    const children = (type.properties ?? []).map((p) =>
      childNode(
        model,
        node,
        { kind: 'property', key: p.key },
        p.key,
        p.typeId,
        propertyReference(node.reference, p.key),
        p.optional,
        p.documentation
      )
    );
    for (const [index, signature] of (type.indexSignatures ?? []).entries()) {
      children.push(
        childNode(
          model,
          node,
          { kind: 'signature', index },
          `[key: ${signature.keyType}]`,
          signature.typeId,
          CONTRACT_REFERENCE
        )
      );
    }
    if (node.reference.kind === 'value' && isObject(node.reference.value)) {
      const known = new Set((type.properties ?? []).map((p) => p.key));
      for (const key of Object.keys(node.reference.value)) {
        if (known.has(key)) continue;
        const signature = type.indexSignatures?.find((s) => matchesIndexKey(s, key));
        if (signature)
          children.push(
            childNode(
              model,
              node,
              { kind: 'property', key },
              key,
              signature.typeId,
              propertyReference(node.reference, key)
            )
          );
      }
    }
    return children;
  }
  if (type.kind === 'array' && type.elementTypeId) {
    const children = [
      childNode(model, node, { kind: 'item' }, '[item]', type.elementTypeId, CONTRACT_REFERENCE)
    ];
    if (node.reference.kind === 'value' && Array.isArray(node.reference.value)) {
      for (const index of node.reference.value.keys())
        children.push(
          childNode(
            model,
            node,
            { kind: 'index', index },
            `[${index}]`,
            type.elementTypeId,
            indexReference(node.reference, index)
          )
        );
    }
    return children;
  }
  if (type.kind === 'tuple') {
    return (type.tupleItems ?? []).map((item, index) =>
      childNode(
        model,
        node,
        { kind: 'index', index },
        `[${index}]`,
        item.typeId,
        indexReference(node.reference, index),
        item.optional
      )
    );
  }
  if (type.kind === 'union' || type.kind === 'intersection') {
    return (type.alternatives ?? []).flatMap((id, index) => {
      const form = definition(model, id);
      if (node.optional && isUndefined(form)) return [];
      let reference = node.reference;
      if (reference.kind === 'value' && !matchesShape(model, id, reference.value)) {
        reference = { kind: 'none', applicable: false, scope: 'alternative' };
      }
      const label =
        form.label.length > 80
          ? `${form.kind[0].toUpperCase()}${form.kind.slice(1)} form ${index + 1}`
          : form.label;
      return [childNode(model, node, { kind: 'alternative', index }, label, id, reference)];
    });
  }
  return [];
}

export function canExpand(model: InspectionModel, node: InspectionNode): boolean {
  if (node.recursive) return false;
  const type = getNavigationDefinition(model, node);
  return Boolean(
    type.properties?.length ||
      type.indexSignatures?.length ||
      type.elementTypeId ||
      type.tupleItems?.length ||
      type.alternatives?.some((id) => !(node.optional && isUndefined(definition(model, id))))
  );
}

export function getSecondaryLabel(node: InspectionNode, field?: string): string | undefined {
  if (node.documentation?.summary?.trim()) return node.documentation.summary;
  if (!field || node.reference.kind !== 'value' || !isObject(node.reference.value))
    return undefined;
  const value = Object.hasOwn(node.reference.value, field)
    ? node.reference.value[field]
    : undefined;
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function getTypeSummary(model: InspectionModel, node: InspectionNode): string {
  if (node.recursive) return 'Recursive type reference';
  const type = getNavigationDefinition(model, node);
  if (type.properties?.length) {
    const total = type.properties.length;
    const dynamic = type.indexSignatures?.length ? '; dynamic keys' : '';
    if (node.reference.kind === 'value' && isObject(node.reference.value)) {
      const value = node.reference.value;
      const supplied = type.properties.filter((p) => Object.hasOwn(value, p.key)).length;
      return `${supplied} / ${total} supplied${dynamic}`;
    }
    return `${total} ${total === 1 ? 'property' : 'properties'}${dynamic}`;
  }
  if (type.indexSignatures?.length) {
    if (node.reference.kind !== 'value' || !isObject(node.reference.value)) return 'Dynamic keys';
    const supplied = Object.keys(node.reference.value).filter((key) =>
      type.indexSignatures?.some((signature) => matchesIndexKey(signature, key))
    ).length;
    return `Dynamic keys (${supplied} supplied)`;
  }
  if (type.kind === 'array')
    return node.reference.kind === 'value' && Array.isArray(node.reference.value)
      ? `${node.reference.value.length} items`
      : 'Array item contract';
  if (type.kind === 'tuple') return `${type.tupleItems?.length ?? 0} tuple positions`;
  if (type.kind === 'union' || type.kind === 'intersection') {
    const count = (type.alternatives ?? []).filter(
      (id) => !(node.optional && isUndefined(definition(model, id)))
    ).length;
    return `${count} allowed forms`;
  }
  if (type.kind === 'unsupported') return 'Structure not expanded';
  return type.kind === 'object' ? '0 properties' : type.label;
}

export function formatReference(reference: NodeReference): string {
  if (reference.kind === 'missing') return 'Not provided';
  if (reference.kind === 'none') {
    if (reference.scope === 'contract') return 'Type contract';
    if (reference.scope === 'alternative') return 'Other union form';
    if (reference.scope === 'incompatible') return 'Different reference shape';
    return 'No reference loaded';
  }
  const value = reference.value;
  if (
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (isObject(value) && Object.keys(value).length === 0)
  )
    return 'Present - empty';
  return 'Provided';
}

export function formatJsonValue(value: JsonValue, maxLength = 80): string {
  const text = JSON.stringify(value, null, maxLength === Infinity ? 2 : undefined);
  return text.length > maxLength ? `${text.slice(0, Math.max(0, maxLength - 3))}...` : text;
}

export function getNodeBreadcrumb(node: InspectionNode): string[] {
  return [
    node.rootName,
    ...node.path.map((segment) => {
      switch (segment.kind) {
        case 'property':
          return segment.key;
        case 'index':
          return `[${segment.index}]`;
        case 'alternative':
          return `form ${segment.index + 1}`;
        case 'signature':
          return `[key contract ${segment.index + 1}]`;
        case 'item':
          return '[item]';
      }
      throw new Error('Unknown node path segment.');
    })
  ];
}

function sameSegment(a: NodeSegment, b: NodeSegment): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function resolveNearestNode(
  model: InspectionModel,
  path: NodeSegment[],
  reference?: JsonValue,
  enabled = true
): InspectionNode {
  let node = createRootNode(model, reference, enabled);
  for (const segment of path) {
    const child = getNodeChildren(model, node).find((candidate) =>
      sameSegment(candidate.path.at(-1) as NodeSegment, segment)
    );
    if (!child) break;
    node = child;
  }
  return node;
}

export function resolveNode(
  model: InspectionModel,
  path: NodeSegment[],
  reference?: JsonValue,
  enabled = true
): InspectionNode | undefined {
  const node = resolveNearestNode(model, path, reference, enabled);
  return node.path.length === path.length ? node : undefined;
}
