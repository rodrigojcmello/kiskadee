import { describe, expect, it } from 'vitest';
import { resolveBackgroundScenarios } from './background-scenarios';
import {
  type ResolvedCanonicalCardSurface,
  resolveDefaultCanonicalCardSurface
} from './canonical-card-surfaces';

const surfaces: ResolvedCanonicalCardSurface[] = [
  {
    key: 'neutral.low',
    label: 'Neutral low',
    resolvedColor: '#ffffff',
    contentSurfaceContext: 'onSubtle'
  },
  {
    key: 'neutral.medium',
    label: 'Neutral medium',
    resolvedColor: '#f9fbff',
    contentSurfaceContext: 'onSubtle'
  },
  {
    key: 'primary.medium',
    label: 'Primary medium',
    resolvedColor: '#e0efff',
    contentSurfaceContext: 'onSubtle'
  },
  {
    key: 'primary.highest',
    label: 'Primary highest',
    resolvedColor: '#0064b4',
    contentSurfaceContext: 'onVivid'
  }
];

describe('Showcase background combinations', () => {
  it('uses the main vivid surface as the supporting Card on a companion canvas', () => {
    const companion: ResolvedCanonicalCardSurface = {
      key: 'primaryComplementary.highest',
      label: 'Primary companion highest',
      resolvedColor: '#0059a1',
      contentSurfaceContext: 'onVivid'
    };
    const scenarios = resolveBackgroundScenarios([...surfaces, companion]);
    expect(scenarios.at(-1)).toMatchObject({
      canvas: companion,
      card: surfaces[3]
    });
    expect(scenarios.some((scenario) => scenario.key === 'primary.highest')).toBe(false);
  });
  it('preserves legacy exceptions and vivid compositions', () => {
    const scenarios = resolveBackgroundScenarios(surfaces);
    expect(scenarios.map(({ canvas, card }) => [canvas.key, card.key])).toEqual([
      ['neutral.low', 'neutral.low'],
      ['neutral.low', 'neutral.medium'],
      ['primary.medium', 'neutral.low'],
      ['neutral.medium', 'neutral.low'],
      ['primary.highest', 'primary.highest']
    ]);
    expect(new Set(scenarios.map((item) => item.key)).size).toBe(5);
    expect(scenarios.filter((item) => item.splitSwatch)).toHaveLength(1);
    expect(
      scenarios.find((item) => item.key === resolveDefaultCanonicalCardSurface(surfaces)?.key)
    ).toBe(scenarios[3]);
  });

  it('uses published theme/segment values and never authors white or gray literals', () => {
    const dark = surfaces.map((surface, index) => ({
      ...surface,
      resolvedColor: `theme-value-${index}`
    }));
    const pair = resolveBackgroundScenarios(dark)[1];
    expect(pair.canvas).toBe(dark[0]);
    expect(pair.card).toBe(dark[1]);
    expect(pair.key).toBe(resolveBackgroundScenarios(surfaces)[1].key);
  });

  it('does not fabricate a split combination for sparse or unavailable catalogs', () => {
    expect(resolveBackgroundScenarios([])).toEqual([]);
    expect(
      resolveBackgroundScenarios([surfaces[0], surfaces[3]]).every((item) => !item.splitSwatch)
    ).toBe(true);
  });
});

it('pairs each intent by emphasis, retaining equal-color identities and sparse fallbacks', () => {
  const make = (key: ResolvedCanonicalCardSurface['key']): ResolvedCanonicalCardSurface => ({
    key,
    label: key,
    resolvedColor: '#ffffff',
    contentSurfaceContext: 'onSubtle'
  });
  const catalog = [
    'neutral.lowest',
    'neutral.low',
    'neutral.medium',
    'primary.lowest',
    'primary.low',
    'primary.medium',
    'support.lowest',
    'support.medium'
  ].map((key) => make(key as ResolvedCanonicalCardSurface['key']));
  expect(
    resolveBackgroundScenarios(catalog).map(({ canvas, card }) => [canvas.key, card.key])
  ).toEqual([
    ['neutral.lowest', 'neutral.lowest'],
    ['neutral.lowest', 'neutral.low'],
    ['neutral.low', 'neutral.lowest'],
    ['primary.medium', 'primary.low'],
    ['support.medium', 'support.lowest'],
    ['neutral.medium', 'neutral.low']
  ]);
  const dark = catalog.map((surface, index) => ({ ...surface, resolvedColor: `dark-${index}` }));
  expect(resolveBackgroundScenarios(dark).map(({ key }) => key)).toEqual(
    resolveBackgroundScenarios(catalog).map(({ key }) => key)
  );
});

it('adds a solid Neutral Low swatch with Lowest cards before Medium', () => {
  const lowest: ResolvedCanonicalCardSurface = { ...surfaces[0], key: 'neutral.lowest' };
  const scenarios = resolveBackgroundScenarios([lowest, ...surfaces]);
  const index = scenarios.findIndex((scenario) => scenario.key === 'neutral.low');
  expect(scenarios[index]).toMatchObject({ card: lowest, splitSwatch: false });
  expect(scenarios.at(-2)?.key).toBe('neutral.medium');
  expect(scenarios.at(-1)?.key).toBe('primary.highest');
  expect(new Set(scenarios.map(({ key }) => key)).size).toBe(scenarios.length);
});

it('keeps base and tonal subtle scenarios independent of Card border policy', () => {
  const scenarios = resolveBackgroundScenarios(surfaces);
  expect(scenarios[0]).toMatchObject({
    canvas: surfaces[0],
    card: surfaces[0],
    splitSwatch: false
  });
  expect(scenarios.find(({ key }) => key === 'primary.medium')?.card.key).toBe('neutral.low');
  expect(scenarios.find(({ key }) => key === 'neutral.medium')?.card.key).toBe('neutral.low');
});

it('reuses the vivid supporting Card when published tones differ', () => {
  const vivid = surfaces[3];
  const sameColor = { ...vivid, key: 'neutral.highest' as const };
  const differentColor = { ...vivid, key: 'support.highest' as const, resolvedColor: '#6750a4' };
  const scenarios = resolveBackgroundScenarios([vivid, sameColor, differentColor]);
  expect(scenarios.every(({ card }) => card === vivid)).toBe(true);
});
