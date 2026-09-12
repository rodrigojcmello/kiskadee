import { expect, it } from 'vitest';
import {
  KISKADEE_TONES,
  type KiskadeeHexScale,
  type StaticPrimitiveTonalColorAsset
} from '../types/colors/colors.types';
import {
  assertPrimitiveFunctionalReferences,
  resolvePrimitiveFunctionalTone
} from './tonalReference';

it('resolves medium and offsets by grid position, preserving legacy assets', () => {
  const scale = {} as KiskadeeHexScale;
  for (const tone of KISKADEE_TONES) scale[tone] = '#000000';
  const asset: StaticPrimitiveTonalColorAsset = {
    kind: 'static',
    scales: { light: scale },
    functionalReferences: { light: { subtle: 4, medium: 18, vivid: 50 } }
  };
  expect(resolvePrimitiveFunctionalTone(asset, 'light', 'medium')).toBe(18);
  expect(resolvePrimitiveFunctionalTone(asset, 'light', 'medium', -2)).toBe(14);
  asset.functionalReferences.light!.medium = 20;
  expect(() => assertPrimitiveFunctionalReferences(asset)).toThrow('ordinal midpoint');
  delete asset.functionalReferences.light!.medium;
  expect(() => assertPrimitiveFunctionalReferences(asset)).not.toThrow();
  expect(() => resolvePrimitiveFunctionalTone(asset, 'light', 'medium')).toThrow('missing');
});
