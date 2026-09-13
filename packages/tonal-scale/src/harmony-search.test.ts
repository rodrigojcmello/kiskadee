import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { createTonalArtifactBundle, verifyTonalArtifactBundle } from './export/tonal-artifacts';
import { generateKiskadeeTonalSystem } from './tonal-system';

it('finds an exportable brown fallback for a vivid green primary without relaxing limits', async () => {
  const recipe = JSON.parse(
    readFileSync(
      new URL('../docs/examples/fluent-vivid-lights.recipe.json', import.meta.url),
      'utf8'
    )
  );
  recipe.primary.seedHex = '#27ae60';
  recipe.overrides = recipe.overrides.filter(
    (entry: { id: string }) => !['g.green.v1', 'r.red.v1', 'n.black.v2'].includes(entry.id)
  );
  recipe.neutral = {
    mode: 'derived-from-primary',
    seedHex: '#21242d',
    derivation: 'primary-neutral-v1'
  };
  const result = generateKiskadeeTonalSystem(recipe);
  expect(result.valid).toBe(true);
  if (!result.valid) throw new Error(JSON.stringify(result.issues));
  expect(result.issues.filter((issue) => issue.severity === 'error')).toEqual([]);
  expect(result.families.some((family) => family.id === 'yr.brown.v1')).toBe(true);
  const bundle = await createTonalArtifactBundle(result);
  expect((await verifyTonalArtifactBundle(bundle.files)).valid).toBe(true);
}, 30000);

it.each([
  'balanced',
  'muted-darks',
  'vivid-lights'
] as const)('preserves nearby automatic teal candidates across the emitted midtrack (%s)', (tonalProfile) => {
  const recipe = JSON.parse(
    readFileSync(
      new URL('../docs/examples/fluent-vivid-lights.recipe.json', import.meta.url),
      'utf8'
    )
  );
  recipe.tonalProfile = tonalProfile;
  recipe.primary.seedHex = '#0b57d0';
  recipe.overrides = [
    { id: 'g.green.v1', seedHex: '#146c2e', policies: { light: 'source-exact', dark: 'adaptive' } },
    { id: 'r.red.v1', seedHex: '#b3261e', policies: { light: 'source-exact', dark: 'adaptive' } },
    {
      id: 'n.black.v2',
      seedHex: '#001d35',
      policies: { light: 'source-exact', dark: 'source-exact' }
    }
  ];
  const result = generateKiskadeeTonalSystem(recipe);
  expect(result.valid).toBe(true);
  if (!result.valid) throw new Error(JSON.stringify(result.issues));
  const teal = result.families.find((f) => f.id === 'bg.teal.v1')!;
  const blue = result.families.find((f) => f.id === 'b.blue.v1')!;
  expect(teal.themes.light.harmony!.seedDeltaE).toBeLessThan(0.18);
  expect(teal.themes.light.harmony!.vividPeakError).toBeLessThanOrEqual(1);
  // The old peak-lightness-only search produced a midtrack more chromatic
  // than the exact primary while moving the reference by over 0.33 delta E.
  const midtrackChroma = (family: typeof teal) =>
    family.themes.light.scale.colors
      .filter((color) => [16, 18, 20].includes(color.tone))
      .reduce((sum, color) => sum + color.oklch.c, 0);
  expect(midtrackChroma(teal)).toBeLessThan(midtrackChroma(blue));
  for (const id of ['b.blue.v1', 'g.green.v1', 'r.red.v1', 'n.black.v1', 'n.black.v2']) {
    const family = result.families.find((f) => f.id === id)!;
    expect(family.themes.light.effectiveSeedHex).toBe(family.sourceSeedHex);
    expect(family.themes.light.sourceSeedPreserved).toBe(true);
  }
}, 30000);
