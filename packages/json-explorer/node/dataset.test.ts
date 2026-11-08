import { describe, expect, it } from 'vitest';
import { fluentButtonConfig, loadFluentButtonReference } from '../examples/fluent-button.ts';
import type { InspectionModel, TypeDefinition } from '../src/model/inspection.ts';
import { assertJsonValue, prepareDataset } from './dataset.ts';
import { extractInspectionModel } from './extract.ts';

function structure(model: InspectionModel, definition: TypeDefinition): TypeDefinition {
  if (definition.kind !== 'union') return definition;
  const members = definition
    .alternatives!.map((id) => model.definitions[id])
    .filter((item) => item.label !== 'undefined');
  return members.length === 1 ? structure(model, members[0]) : definition;
}
function child(model: InspectionModel, definition: TypeDefinition, key: string) {
  const property = structure(model, definition).properties?.find((item) => item.key === key);
  expect(property, key).toBeDefined();
  return structure(model, model.definitions[property!.typeId]);
}

describe('Fluent Button inspection', () => {
  it('reads the current contract with the Teams generic and full finite maps', () => {
    const model = extractInspectionModel(fluentButtonConfig);
    const root = model.definitions[model.root.typeId];
    expect(root.properties?.map((item) => item.key)).toEqual([
      'contentSurfaceContext',
      'effects',
      'options',
      'elements'
    ]);
    expect(child(model, root, 'options').properties).toHaveLength(10);
    const elements = child(model, root, 'elements');
    expect(elements.properties).toHaveLength(12);
    const e1 = child(model, elements, 'e1');
    expect(e1.properties).toHaveLength(5);
    expect(e1.documentation?.description).toBe('e1 — button container/surface');
    const palettes = child(model, e1, 'palettes');
    expect(palettes.properties?.map((item) => item.key).sort()).toEqual([
      'default',
      'dynamic',
      'teams'
    ]);
    const scales = child(model, e1, 'scales');
    const padding = child(model, scales, 'paddingTop');
    expect(padding.kind).toBe('union');
    const sizeMap = padding
      .alternatives!.map((id) => model.definitions[id])
      .find((type) => type.kind === 'object');
    expect(sizeMap?.properties).toHaveLength(11);
    expect(model.diagnostics).toEqual([]);
    expect(Object.keys(model.definitions).length).toBeLessThan(1000);
  });

  it('loads the authoritative preset reference without building Web artifacts', async () => {
    const data = await prepareDataset(fluentButtonConfig);
    const reference = data.reference as Record<string, any>;
    expect(Object.keys(reference)).toHaveLength(4);
    expect(Object.keys(reference.options)).toHaveLength(9);
    expect(reference.options).not.toHaveProperty('selectionIntent');
    expect(reference.elements.e1).not.toHaveProperty('effects');
    expect(reference.elements.e1.scales.paddingTop).toEqual({
      's:sm:1': 4,
      's:md:1': 6,
      's:lg:1': 9,
      's:lg:2': 13
    });
    expect(reference.elements.e1.palettes).toHaveProperty('teams');
    expect(data.secondaryLabelField).toBe('name');
    expect(await loadFluentButtonReference()).toEqual(data.reference);
  });

  it('can prepare type-only data without invoking a reference adapter', async () => {
    const { referenceAdapter: _adapter, ...target } = fluentButtonConfig;
    const data = await prepareDataset(target);
    expect(data).not.toHaveProperty('reference');
  });
});

describe('reference JSON boundaries', () => {
  it('accepts false, zero, null and empty values', () => {
    expect(() =>
      assertJsonValue({
        zero: 0,
        enabled: false,
        emptyText: '',
        emptyArray: [],
        emptyObject: {},
        nil: null
      })
    ).not.toThrow();
  });
  it('rejects coercions, undefined, class instances and cycles', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    for (const invalid of [
      undefined,
      { value: undefined },
      Number.NaN,
      Infinity,
      1n,
      Symbol('key'),
      () => null,
      new Date(),
      cyclic
    ]) {
      expect(() => assertJsonValue(invalid)).toThrow();
    }
  });
});
