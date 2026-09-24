import { expect, it } from 'vitest';
import { createTonalArtifactBundle, verifyTonalArtifactBundle } from './export/tonal-artifacts.ts';
import { deriveSupportingColor } from './supporting-color.ts';
import { generateKiskadeeTonalSystem } from './tonal-system.ts';
import { DEFAULT_TONAL_SYSTEM_RECIPE, validateTonalSystemRecipe } from './tonal-system-contract.ts';

it('derives chromatic support independently of neutral generation', () => {
  const blue = deriveSupportingColor('#0b57d0');
  const purple = deriveSupportingColor('#6750a4');
  expect(blue.identity.sector).toBe('blue');
  expect(purple.seedHex).not.toBe(blue.seedHex);
});

it('preserves every shared family when support is added and rejects occupied or orphan ids', () => {
  const recipe = {
    ...DEFAULT_TONAL_SYSTEM_RECIPE,
    primary: { ...DEFAULT_TONAL_SYSTEM_RECIPE.primary, seedHex: '#0b57d0' }
  };
  const base = generateKiskadeeTonalSystem(recipe);
  const catalog = {
    colors: [],
    names: {},
    neutrals: [],
    supportingColors: [{ id: 'b.blue.v2', sourceId: 'primary', strategy: 'material-support-v1' }]
  };
  const withSupport = generateKiskadeeTonalSystem({ ...recipe, catalog });
  expect(base.valid).toBe(true);
  expect(withSupport.valid).toBe(true);
  for (const family of base.families)
    expect(withSupport.families.find((f) => f.id === family.id)).toEqual(family);
  for (const sourceId of ['n.black.v1', 'b.blue.v99']) {
    expect(
      generateKiskadeeTonalSystem({
        ...recipe,
        catalog: { ...catalog, supportingColors: [{ ...catalog.supportingColors[0], sourceId }] }
      }).valid
    ).toBe(false);
  }
  expect(
    generateKiskadeeTonalSystem({
      ...recipe,
      catalog: {
        ...catalog,
        supportingColors: [{ ...catalog.supportingColors[0], id: 'b.blue.v1' }]
      }
    }).valid
  ).toBe(false);
}, 60000);

it('round trips supporting origin metadata and rejects family drift', async () => {
  const recipe = {
    ...DEFAULT_TONAL_SYSTEM_RECIPE,
    primary: { ...DEFAULT_TONAL_SYSTEM_RECIPE.primary, seedHex: '#0b57d0' },
    catalog: {
      colors: [
        {
          id: 'pb.indigo.v2',
          seedHex: '#6750a4',
          policies: { light: 'source-exact', dark: 'adaptive' }
        }
      ],
      names: { 'b.blue.v2': 'Blue support' },
      neutrals: [{ id: 'n.black.v2', sourceId: 'primary', intensity: 'chromatic' }],
      supportingColors: [
        { id: 'b.blue.v2', sourceId: 'primary', strategy: 'material-support-v1' },
        { id: 'pb.indigo.v3', sourceId: 'pb.indigo.v2', strategy: 'material-support-v1' }
      ]
    }
  };
  const system = generateKiskadeeTonalSystem(recipe);
  expect(system.valid, JSON.stringify(system.issues)).toBe(true);
  if (!system.valid) return;
  const bundle = await createTonalArtifactBundle(system);
  expect(bundle.assets.find((a) => a.id === 'pb.indigo.v3')?.supportingColorOrigin).toEqual({
    sourceId: 'pb.indigo.v2',
    referenceHex: '#6750a4',
    strategy: 'material-support-v1'
  });
  expect((await verifyTonalArtifactBundle(bundle.files)).valid).toBe(true);
  const renamed = generateKiskadeeTonalSystem({
    ...recipe,
    catalog: {
      ...recipe.catalog,
      names: {},
      supportingColors: [...recipe.catalog.supportingColors].reverse()
    }
  });
  expect(renamed.families).toEqual(system.families);
  const drift = generateKiskadeeTonalSystem({
    ...recipe,
    catalog: {
      ...recipe.catalog,
      supportingColors: [{ ...recipe.catalog.supportingColors[0], id: 'g.green.v2' }]
    }
  });
  expect(drift.valid).toBe(false);
}, 120000);

it('reads legacy recipes and rejects duplicate, cyclic and unsupported associations', () => {
  for (const formatVersion of [5, 6]) {
    const result = validateTonalSystemRecipe({ ...DEFAULT_TONAL_SYSTEM_RECIPE, formatVersion });
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.value.formatVersion).toBe(7);
  }
  const link = { id: 'b.blue.v2', sourceId: 'primary', strategy: 'material-support-v1' };
  for (const supportingColors of [
    [link, { ...link, id: 'b.blue.v3' }],
    [{ ...link, sourceId: 'b.blue.v2' }],
    [{ ...link, strategy: 'unknown' }],
    [{ ...link, id: 'n.black.v2' }]
  ])
    expect(
      validateTonalSystemRecipe({
        ...DEFAULT_TONAL_SYSTEM_RECIPE,
        catalog: { colors: [], names: {}, neutrals: [], supportingColors }
      }).valid
    ).toBe(false);
});
