import { describe, expect, it } from 'vitest';
import { createTonalArtifactBundle, verifyTonalArtifactBundle } from './export/tonal-artifacts';
import { generateKiskadeeTonalSystem } from './tonal-system';
import {
  DEFAULT_TONAL_SYSTEM_RECIPE,
  isTonalFamilyVariant,
  nextTonalFamilyVariant,
  validateTonalSystemRecipe
} from './tonal-system-contract';

const colors = Array.from({ length: 10 }, (_, i) => ({
  id: `b.blue.v${i + 2}` as const,
  seedHex: '#0b57d0',
  policies: { light: 'source-exact' as const, dark: 'adaptive' as const }
}));
const catalog = {
  colors,
  names: { 'b.blue.v2': 'Alternative blue' },
  neutrals: colors.map((c, i) => ({
    id: `n.black.v${i + 2}` as const,
    sourceId: c.id,
    intensity: 'chromatic' as const
  }))
};

describe('shared catalog', () => {
  it('validates positive stable ordinals beyond four', () => {
    for (const v of ['v1', 'v5', 'v100']) expect(isTonalFamilyVariant(v)).toBe(true);
    for (const v of ['v0', 'v-1', 'v1.2', 'v01', 'vInfinity'])
      expect(isTonalFamilyVariant(v)).toBe(false);
    expect(nextTonalFamilyVariant(['b.blue.v2', 'b.blue.v3'], 'b.blue')).toBe('v4');
  });
  it('rejects collisions and orphaned neutral links', () => {
    for (const replacement of [
      { ...catalog, colors: [{ ...colors[0], id: 'b.blue.v1' }] },
      { ...catalog, neutrals: [{ id: 'n.black.v2', sourceId: 'b.blue.v99', intensity: 'subtle' }] }
    ])
      expect(
        validateTonalSystemRecipe({ ...DEFAULT_TONAL_SYSTEM_RECIPE, catalog: replacement }).valid
      ).toBe(false);
  });
  it('keeps the base and existing additions stable through growth, rename and reorder', async () => {
    const base = generateKiskadeeTonalSystem(DEFAULT_TONAL_SYSTEM_RECIPE);
    const full = generateKiskadeeTonalSystem({ ...DEFAULT_TONAL_SYSTEM_RECIPE, catalog });
    expect(full.valid, JSON.stringify(full.issues)).toBe(true);
    expect(
      base.families.every(
        (f) => JSON.stringify(f) === JSON.stringify(full.families.find((n) => n.id === f.id))
      )
    ).toBe(true);
    const reordered = generateKiskadeeTonalSystem({
      ...DEFAULT_TONAL_SYSTEM_RECIPE,
      catalog: { ...catalog, colors: [...colors].reverse(), names: { 'b.blue.v2': 'Renamed' } }
    });
    expect(reordered.families).toEqual(full.families);
    const subset = generateKiskadeeTonalSystem({
      ...DEFAULT_TONAL_SYSTEM_RECIPE,
      catalog: { colors: colors.slice(0, 1), names: {}, neutrals: catalog.neutrals.slice(0, 1) }
    });
    for (const f of subset.families) expect(full.families.find((n) => n.id === f.id)).toEqual(f);
    if (!full.valid) throw Error('Invalid catalog');
    const bundle = await createTonalArtifactBundle(full);
    const replay = await verifyTonalArtifactBundle(bundle.files);
    expect(replay.valid, JSON.stringify(replay.issues)).toBe(true);
  }, 240000);
});

it('migrates V5 primary neutral into an explicit V6 association', () => {
  const result = validateTonalSystemRecipe({
    ...DEFAULT_TONAL_SYSTEM_RECIPE,
    formatVersion: 5,
    neutral: {
      mode: 'derived-from-primary',
      seedHex: '#001d35',
      derivation: 'primary-neutral-v1',
      intensity: 'chromatic'
    }
  });
  expect(result.valid).toBe(true);
  if (!result.valid) return;
  expect(result.value.formatVersion).toBe(6);
  expect(result.value.catalog?.neutrals).toContainEqual({
    id: 'n.black.v2',
    sourceId: 'primary',
    intensity: 'chromatic'
  });
  expect(result.value.neutral?.seedHex).toBe('#001d35');
});
