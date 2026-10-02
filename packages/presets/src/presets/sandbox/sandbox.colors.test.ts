import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { primitiveColors } from './sandbox.colors.ts';
import { schema } from './sandbox.schema.ts';

const evidence = new URL('../../../docs/design-systems/sandbox/colors/generated/', import.meta.url);
it('keeps promoted scales and anchors in parity with generator evidence', () => {
  const manifest = JSON.parse(readFileSync(new URL('tonal-system.json', evidence), 'utf8'));
  for (const [name, id] of [
    ['blue', 'b.blue.v1'],
    ['black', 'n.black.v1'],
    ['green', 'g.green.v1'],
    ['red', 'r.red.v1']
  ] as const) {
    const entry = manifest.assets.find((asset: { familyId: string }) => asset.familyId === id);
    const bytes = readFileSync(new URL(entry.path, evidence));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(entry.sha256);
    const asset = JSON.parse(bytes.toString());
    const promoted = primitiveColors[name].v1;
    expect(promoted.scales).toEqual(asset.scales);
    for (const theme of ['light', 'dark'] as const) {
      for (const role of ['subtle', 'medium', 'vivid'] as const) {
        const tone = promoted.functionalReferences[theme][role];
        expect(tone).toBe(asset.functionalReferences[theme][role].tone);
        expect(promoted.scales[theme][tone]).toBe(asset.functionalReferences[theme][role].hex);
      }
    }
    const presetBytes = readFileSync(new URL(entry.preset.path, evidence));
    expect(createHash('sha256').update(presetBytes).digest('hex')).toBe(entry.preset.sha256);
  }
});
it('publishes rounded controls, canonical surfaces and its own Dropdown', () => {
  expect(schema.global?.radius).toBe('rounded');
  expect(schema.components.dropdown).toBeDefined();
  for (const theme of ['light', 'dark'] as const) {
    const catalog = schema.components.container?.options?.canonicalSurfaces?.default?.[theme];
    expect(catalog?.some((surface) => surface.contentSurfaceContext === 'onVivid')).toBe(true);
    expect(catalog?.some((surface) => surface.contentSurfaceContext === 'onSubtle')).toBe(true);
  }
});
