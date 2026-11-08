import { describe, expect, it } from 'vitest';
import type { InspectionModel, JsonValue, TypeDefinition } from './inspection.ts';
import {
  canExpand,
  createRootNode,
  formatJsonValue,
  formatReference,
  getNavigationDefinition,
  getNodeBreadcrumb,
  getNodeChildren,
  getSecondaryLabel,
  getTypeSummary,
  resolveNearestNode,
  resolveNode
} from './navigation.ts';

function fixture(definitions: TypeDefinition[], rootId = 'root'): InspectionModel {
  return {
    root: { name: 'Example', typeId: rootId },
    definitions: Object.fromEntries(definitions.map((type) => [type.id, type])),
    source: { file: 'example.ts', exportName: 'Example', path: [] },
    diagnostics: []
  };
}

const STRING: TypeDefinition = { id: 'string', kind: 'primitive', label: 'string' };
const NUMBER: TypeDefinition = { id: 'number', kind: 'primitive', label: 'number' };
const UNDEFINED: TypeDefinition = { id: 'undefined', kind: 'primitive', label: 'undefined' };
const root = (properties: NonNullable<TypeDefinition['properties']>): TypeDefinition => ({
  id: 'root',
  kind: 'object',
  label: 'Example',
  properties
});

describe('reference overlays', () => {
  const model = fixture([
    root([
      { key: 'absent', typeId: 'string', optional: true },
      { key: 'nil', typeId: 'nullable', optional: true },
      { key: 'enabled', typeId: 'boolean', optional: true },
      { key: 'count', typeId: 'number', optional: true },
      { key: 'emptyText', typeId: 'string', optional: true },
      { key: 'emptyArray', typeId: 'array', optional: true },
      { key: 'emptyObject', typeId: 'object', optional: true }
    ]),
    STRING,
    NUMBER,
    { id: 'boolean', kind: 'primitive', label: 'boolean' },
    { id: 'null', kind: 'literal', label: 'null', literal: null },
    { id: 'nullable', kind: 'union', label: 'string | null', alternatives: ['string', 'null'] },
    { id: 'array', kind: 'array', label: 'string[]', elementTypeId: 'string' },
    { id: 'object', kind: 'object', label: 'object', properties: [] }
  ]);
  const reference: JsonValue = {
    nil: null,
    enabled: false,
    count: 0,
    emptyText: '',
    emptyArray: [],
    emptyObject: {}
  };

  it('distinguishes no loaded reference from missing optional properties', () => {
    const typeOnly = getNodeChildren(model, createRootNode(model));
    expect(typeOnly).toHaveLength(7);
    expect(typeOnly.every((n) => n.reference.kind === 'none')).toBe(true);
    const populated = getNodeChildren(model, createRootNode(model, reference));
    expect(populated[0].reference).toEqual({ kind: 'missing' });
    expect(formatReference(populated[0].reference)).toBe('Not provided');
    const disabled = getNodeChildren(model, createRootNode(model, reference, false));
    expect(disabled.every((n) => n.reference.kind === 'none')).toBe(true);
  });

  it('preserves null, false and zero instead of treating them as empty or absent', () => {
    const children = getNodeChildren(model, createRootNode(model, reference));
    expect(children[1].reference).toEqual({ kind: 'value', value: null });
    expect(children[2].reference).toEqual({ kind: 'value', value: false });
    expect(children[3].reference).toEqual({ kind: 'value', value: 0 });
    expect(children.slice(1, 4).map((n) => formatReference(n.reference))).toEqual([
      'Provided',
      'Provided',
      'Provided'
    ]);
  });

  it('distinguishes all present empty values', () => {
    const children = getNodeChildren(model, createRootNode(model, reference));
    expect(children.slice(4).map((n) => formatReference(n.reference))).toEqual([
      'Present - empty',
      'Present - empty',
      'Present - empty'
    ]);
    expect(['', [], {}].map((v) => formatJsonValue(v))).toEqual(['""', '[]', '{}']);
    expect(getTypeSummary(model, createRootNode(model, reference))).toBe('6 / 7 supplied');
  });

  it('accepts null as a concrete root reference', () => {
    expect(createRootNode(model, null).reference).toEqual({ kind: 'value', value: null });
    expect(formatJsonValue(null)).toBe('null');
  });
});

describe('labels and documentation', () => {
  const model = fixture([
    root([{ key: 'e1', typeId: 'element', optional: false }]),
    STRING,
    {
      id: 'element',
      kind: 'object',
      label: 'Element',
      documentation: { description: 'Full description.' },
      properties: [{ key: 'name', typeId: 'string', optional: false }]
    }
  ]);

  it('does not interpret name implicitly and prefers summary over configured reference fields', () => {
    const node = getNodeChildren(
      model,
      createRootNode(model, { e1: { name: 'button', title: 'Surface' } })
    )[0];
    expect(getSecondaryLabel(node)).toBeUndefined();
    expect(getSecondaryLabel(node, 'name')).toBe('button');
    expect(getSecondaryLabel(node, 'title')).toBe('Surface');
    expect(
      getSecondaryLabel(
        { ...node, documentation: { summary: 'Short label', description: 'Long text' } },
        'name'
      )
    ).toBe('Short label');
    expect(node.documentation?.description).toBe('Full description.');
  });

  it('omits the secondary line when configured fields are not meaningful text', () => {
    for (const name of ['', '   ', false, 0, null, {}] as JsonValue[]) {
      const node = getNodeChildren(model, createRootNode(model, { e1: { name } }))[0];
      expect(getSecondaryLabel(node, 'name')).toBeUndefined();
    }
  });

  it('keeps property documentation ahead of documentation on its referenced type', () => {
    const own = fixture([
      root([
        {
          key: 'e1',
          typeId: 'element',
          optional: false,
          documentation: { description: 'Own comment.' }
        }
      ]),
      model.definitions.element,
      STRING
    ]);
    expect(getNodeChildren(own, createRootNode(own))[0].documentation?.description).toBe(
      'Own comment.'
    );
  });
});

describe('unions, maps and arrays', () => {
  it('unwraps optional single object forms without deleting undefined from the contract', () => {
    const model = fixture([
      root([{ key: 'element', typeId: 'optional', optional: true }]),
      STRING,
      UNDEFINED,
      {
        id: 'optional',
        kind: 'union',
        label: 'Element | undefined',
        alternatives: ['object', 'undefined']
      },
      {
        id: 'object',
        kind: 'object',
        label: 'Element',
        documentation: { description: 'Type documentation.' },
        properties: [{ key: 'name', typeId: 'string', optional: false }]
      }
    ]);
    const element = getNodeChildren(model, createRootNode(model))[0];
    expect(element.typeId).toBe('optional');
    expect(element.typeLabel).toBe('Element | undefined');
    expect(getNavigationDefinition(model, element).id).toBe('object');
    expect(getNodeChildren(model, element).map((n) => n.label)).toEqual(['name']);
    expect(element.documentation?.description).toBe('Type documentation.');
    expect(model.definitions.optional.alternatives).toEqual(['object', 'undefined']);
  });

  it('keeps real union forms visible without applying a value to the wrong form', () => {
    const model = fixture([
      { id: 'root', kind: 'union', label: 'number | SizeMap', alternatives: ['number', 'map'] },
      NUMBER,
      {
        id: 'map',
        kind: 'object',
        label: 'SizeMap',
        properties: [{ key: 'md', typeId: 'number', optional: true }]
      }
    ]);
    const forms = getNodeChildren(model, createRootNode(model, 6));
    expect(forms.map((n) => n.label)).toEqual(['number', 'SizeMap']);
    expect(forms[0].reference).toEqual({ kind: 'value', value: 6 });
    expect(formatReference(forms[1].reference)).toBe('Other union form');
    expect(getNodeChildren(model, forms[1])[0].reference.kind).toBe('none');
    expect(canExpand(model, forms[1])).toBe(true);
  });

  it('counts only the displayed value forms while retaining optional undefined in the contract', () => {
    const model = fixture([
      root([{ key: 'size', typeId: 'optional', optional: true }]),
      NUMBER,
      UNDEFINED,
      { id: 'map', kind: 'object', label: 'SizeMap', properties: [] },
      {
        id: 'optional',
        kind: 'union',
        label: 'number | SizeMap | undefined',
        alternatives: ['undefined', 'number', 'map']
      }
    ]);
    const size = getNodeChildren(model, createRootNode(model))[0];
    expect(getNodeChildren(model, size)).toHaveLength(2);
    expect(getTypeSummary(model, size)).toBe('2 allowed forms');
    expect(model.definitions.optional.alternatives).toHaveLength(3);
  });

  it('rejects object forms with forbidden or unknown outer keys without validating every nested value', () => {
    const model = fixture([
      { id: 'root', kind: 'union', label: 'States | Intents', alternatives: ['states', 'intents'] },
      {
        id: 'states',
        kind: 'object',
        label: 'States',
        properties: [
          { key: 'rest', typeId: 'string', optional: false },
          { key: 'primary', typeId: 'undefined', optional: true }
        ]
      },
      {
        id: 'intents',
        kind: 'object',
        label: 'Intents',
        properties: [
          { key: 'primary', typeId: 'map', optional: true },
          { key: 'rest', typeId: 'never', optional: true }
        ]
      },
      { id: 'map', kind: 'object', label: 'Map', properties: [] },
      STRING,
      UNDEFINED,
      { id: 'never', kind: 'primitive', label: 'never' }
    ]);
    const intentForms = getNodeChildren(
      model,
      createRootNode(model, { primary: { high: { rest: 'blue' } } })
    );
    expect(intentForms.map((n) => n.reference.kind)).toEqual(['none', 'value']);
    const stateForms = getNodeChildren(model, createRootNode(model, { rest: 'blue' }));
    expect(stateForms.map((n) => n.reference.kind)).toEqual(['value', 'none']);
    const unknownForms = getNodeChildren(model, createRootNode(model, { unknown: 'blue' }));
    expect(unknownForms.every((n) => n.reference.kind === 'none')).toBe(true);
    // Outer-form selection is intentionally not a full validator of nested property values.
    const shallow = getNodeChildren(model, createRootNode(model, { primary: false }));
    expect(shallow[1].reference.kind).toBe('value');
  });

  it('allows observed keys in a compatible index-signature object union form', () => {
    const model = fixture([
      { id: 'root', kind: 'union', label: 'Named | Free', alternatives: ['named', 'free'] },
      {
        id: 'named',
        kind: 'object',
        label: 'Named',
        properties: [{ key: 'name', typeId: 'string', optional: false }]
      },
      {
        id: 'free',
        kind: 'object',
        label: 'Free',
        indexSignatures: [{ keyType: 'string', typeId: 'number' }]
      },
      STRING,
      NUMBER
    ]);
    const forms = getNodeChildren(model, createRootNode(model, { other: 6 }));
    expect(forms.map((n) => n.reference.kind)).toEqual(['none', 'value']);
    expect(getNodeChildren(model, forms[1]).at(-1)?.label).toBe('other');
  });

  it('projects only keys matching a generated template index pattern', () => {
    const model = fixture([
      {
        id: 'root',
        kind: 'object',
        label: 'DataMap',
        indexSignatures: [
          { keyType: '`data.${string}`', keyPattern: '^data\\.[\\s\\S]*$', typeId: 'number' }
        ]
      },
      NUMBER
    ]);
    const node = createRootNode(model, { 'data.value': 6, 'data.other': 0, dataXwrong: 4 });
    const children = getNodeChildren(model, node);
    expect(children.map((n) => n.label)).toEqual([
      '[key: `data.${string}`]',
      'data.value',
      'data.other'
    ]);
    expect(children[1].reference).toEqual({ kind: 'value', value: 6 });
    expect(getTypeSummary(model, node)).toBe('Dynamic keys (2 supplied)');
  });

  it('preserves every finite map key even when only one is supplied', () => {
    const model = fixture([
      root(['small', 'medium', 'large'].map((key) => ({ key, typeId: 'number', optional: true }))),
      NUMBER
    ]);
    const node = createRootNode(model, { medium: 6 });
    expect(getNodeChildren(model, node).map((n) => n.label)).toEqual(['small', 'medium', 'large']);
    expect(getTypeSummary(model, node)).toBe('1 / 3 supplied');
  });

  it('keeps long alternative type text in details without using it as a huge synthetic title', () => {
    const label = `Partial<Record<${'"size" | '.repeat(20)} never, number>>`;
    const model = fixture([
      { id: 'root', kind: 'union', label: 'number | object', alternatives: ['number', 'map'] },
      NUMBER,
      { id: 'map', kind: 'object', label, properties: [] }
    ]);
    const forms = getNodeChildren(model, createRootNode(model));
    expect(forms[1].label).toBe('Object form 2');
    expect(forms[1].typeLabel).toBe(label);
  });

  it('separates free-key contracts from observed keys and falls back when a key disappears', () => {
    const model = fixture([
      {
        id: 'root',
        kind: 'object',
        label: 'Record<string, number>',
        indexSignatures: [{ keyType: 'string', typeId: 'number' }]
      },
      NUMBER
    ]);
    const rootNode = createRootNode(model, { 'a.b': 6 });
    const nodes = getNodeChildren(model, rootNode);
    expect(nodes.map((n) => n.label)).toEqual(['[key: string]', 'a.b']);
    expect(formatReference(nodes[0].reference)).toBe('Type contract');
    expect(nodes[1].reference).toEqual({ kind: 'value', value: 6 });
    expect(getTypeSummary(model, rootNode)).toBe('Dynamic keys (1 supplied)');
    expect(resolveNode(model, nodes[1].path, { 'a.b': 6 }, false)).toBeUndefined();
    expect(resolveNearestNode(model, nodes[1].path, { 'a.b': 6 }, false).path).toEqual([]);
  });

  it('includes the array item contract even for an empty array', () => {
    const model = fixture([
      { id: 'root', kind: 'array', label: 'string[]', elementTypeId: 'string' },
      STRING
    ]);
    expect(getNodeChildren(model, createRootNode(model, [])).map((n) => n.label)).toEqual([
      '[item]'
    ]);
    const children = getNodeChildren(model, createRootNode(model, ['alpha', 'beta']));
    expect(children.map((n) => n.label)).toEqual(['[item]', '[0]', '[1]']);
    expect(children[1].reference).toEqual({ kind: 'value', value: 'alpha' });
    expect(children[2].reference).toEqual({ kind: 'value', value: 'beta' });
    expect(getTypeSummary(model, createRootNode(model, []))).toBe('0 items');
  });

  it('keeps tuple positions and their optionality visible without a reference', () => {
    const model = fixture([
      {
        id: 'root',
        kind: 'tuple',
        label: '[string, number?]',
        tupleItems: [
          { typeId: 'string', optional: false },
          { typeId: 'number', optional: true }
        ]
      },
      STRING,
      NUMBER
    ]);
    const tuple = getNodeChildren(model, createRootNode(model, ['alpha']));
    expect(tuple.map((n) => n.optional)).toEqual([false, true]);
    expect(tuple[1].reference.kind).toBe('missing');
  });
});

describe('occurrence identity and recursion', () => {
  it('distinguishes punctuation in a key from a nested path', () => {
    const model = fixture([
      root([
        { key: 'a.b', typeId: 'number', optional: false },
        { key: 'a', typeId: 'nested', optional: false }
      ]),
      NUMBER,
      {
        id: 'nested',
        kind: 'object',
        label: 'Nested',
        properties: [{ key: 'b', typeId: 'number', optional: false }]
      }
    ]);
    const nodes = getNodeChildren(model, createRootNode(model));
    const nested = getNodeChildren(model, nodes[1])[0];
    expect(nodes[0].id).not.toBe(nested.id);
    expect(getNodeBreadcrumb(nodes[0])).toEqual(['Example', 'a.b']);
    expect(getNodeBreadcrumb(nested)).toEqual(['Example', 'a', 'b']);
    expect(resolveNode(model, nested.path)?.id).toBe(nested.id);
    expect(nested.parentId).toBe(nodes[1].id);
  });

  it('stops recursive branches at a reference without preventing other occurrences', () => {
    const model = fixture([
      root([{ key: 'children', typeId: 'array', optional: true }]),
      { id: 'array', kind: 'array', label: 'Example[]', elementTypeId: 'root' }
    ]);
    const array = getNodeChildren(model, createRootNode(model))[0];
    const recursion = getNodeChildren(model, array)[0];
    expect(recursion.recursive).toBe(true);
    expect(canExpand(model, recursion)).toBe(false);
    expect(getNodeChildren(model, recursion)).toEqual([]);
    expect(getTypeSummary(model, recursion)).toBe('Recursive type reference');
  });

  it('renders unresolved types as inspectable leaves', () => {
    const model = fixture([{ id: 'root', kind: 'unsupported', label: 'Callable' }]);
    const node = createRootNode(model);
    expect(node.typeLabel).toBe('Callable');
    expect(canExpand(model, node)).toBe(false);
    expect(getTypeSummary(model, node)).toBe('Structure not expanded');
  });

  it('truncates preview text but retains a complete Inspector representation', () => {
    const value = 'a'.repeat(100);
    expect(formatJsonValue(value, 20)).toHaveLength(20);
    expect(formatJsonValue(value, Infinity)).toBe(JSON.stringify(value));
  });
});

describe('Fluent object-union overlays', () => {
  it('does not paint the direct-state form as provided for an intent-keyed Button palette', async () => {
    const { prepareDataset } = await import('../../node/dataset.ts');
    const { fluentButtonConfig } = await import('../../examples/fluent-button.ts');
    const { model, reference } = await prepareDataset(fluentButtonConfig);
    let node = createRootNode(model, reference);
    for (const key of [
      'elements',
      'e1',
      'palettes',
      'default',
      'light',
      'onVivid',
      'standard',
      'boxColor'
    ]) {
      const child = getNodeChildren(model, node).find((candidate) => candidate.label === key);
      if (!child) throw new Error(`Missing real Button property ${key}.`);
      node = child;
    }
    const forms = getNodeChildren(model, node);
    expect(forms).toHaveLength(2);
    expect(getTypeSummary(model, node)).toBe('2 allowed forms');
    const direct = forms.find((form) =>
      getNavigationDefinition(model, form).properties?.some((p) => p.key === 'rest' && !p.optional)
    );
    expect(direct?.reference).toEqual({ kind: 'none', applicable: false, scope: 'alternative' });
    const provided = forms.filter((form) => form.reference.kind === 'value');
    expect(provided).toHaveLength(1);
    expect(
      getNodeChildren(model, provided[0]).find((child) => child.label === 'primary')?.reference.kind
    ).toBe('value');
  });
});
