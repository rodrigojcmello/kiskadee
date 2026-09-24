import { compileDensityMap, resolveDensityScale, resolveSupportedSize } from '@kiskadee/core';
import { expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

it('selects Medium for every global density while preserving explicit Small geometry', () => {
  const slider = schema.components.slider!;
  expect(slider.options?.density).toEqual({ regular: 's:md:1' });
  const density = compileDensityMap(slider.options!.density!);
  for (const mode of ['compact', 'regular', 'spacious'] as const) {
    expect(resolveDensityScale(mode, density)).toBe('md:1');
  }
  const thumb = slider.variants?.standard?.modes?.base?.elements.e10?.scales?.boxWidth;
  expect(thumb).toEqual({ 's:sm:1': 14, 's:md:1': 18 });
  expect(resolveSupportedSize('sm:1', Object.keys(thumb!))).toBe('sm:1');
});
