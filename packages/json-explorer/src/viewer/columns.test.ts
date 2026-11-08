import { describe, expect, it } from 'vitest';
import type { InspectionModel } from '../model/inspection.ts';
import { createRootNode } from '../model/navigation.ts';
import { getBranchColumns } from './columns.ts';

const model: InspectionModel = {
  root: { name: 'Example', typeId: 'root' },
  source: { file: 'example.ts', exportName: 'Example', path: [] },
  diagnostics: [],
  definitions: {
    root: {
      id: 'root',
      kind: 'object',
      label: 'Example',
      properties: ['a', 'b', 'c'].map((key) => ({
        key,
        optional: false,
        typeId: key === 'b' ? 'nested' : 'string'
      }))
    },
    nested: {
      id: 'nested',
      kind: 'object',
      label: 'Nested',
      properties: [{ key: 'value', optional: true, typeId: 'string' }]
    },
    string: { id: 'string', kind: 'primitive', label: 'string' }
  }
};

describe('column branch projection', () => {
  it('moves a selected property first while keeping sibling order', () => {
    const columns = getBranchColumns(model, createRootNode(model), [
      { kind: 'property', key: 'b' }
    ]);
    expect(columns[1].nodes.map((node) => node.label)).toEqual(['b', 'a', 'c']);
    expect(columns[2].nodes.map((node) => node.label)).toEqual(['value']);
  });
  it('discards descendant columns when selecting another ancestor and does not add leaf levels', () => {
    const root = createRootNode(model);
    const deeper = getBranchColumns(model, root, [
      { kind: 'property', key: 'b' },
      { kind: 'property', key: 'value' }
    ]);
    expect(deeper).toHaveLength(3);
    const next = getBranchColumns(model, root, [{ kind: 'property', key: 'a' }]);
    expect(next).toHaveLength(2);
    expect(next[1].selectedId).toBe(next[1].nodes[0].id);
  });
});
