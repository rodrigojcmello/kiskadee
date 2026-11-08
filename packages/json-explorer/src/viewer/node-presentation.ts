import type { InspectionModel } from '../model/inspection.ts';
import { getNavigationDefinition, type InspectionNode } from '../model/navigation.ts';

export function nodeType(model: InspectionModel, node: InspectionNode): string {
  if (node.recursive) return 'type reference';
  const type = getNavigationDefinition(model, node);
  if (type.kind === 'literal' && type.literal === null) return 'null';
  if (type.kind === 'literal')
    return typeof type.literal === 'string' ? 'string literal' : `${typeof type.literal} literal`;
  return type.kind === 'primitive' ? type.label : type.kind;
}

export function hasCompactValue(node: InspectionNode): boolean {
  if (node.reference.kind !== 'value') return false;
  const value = node.reference.value;
  return value === null || typeof value !== 'object' || Object.keys(value).length === 0;
}
