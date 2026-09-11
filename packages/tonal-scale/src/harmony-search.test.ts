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
