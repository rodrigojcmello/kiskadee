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
    expect(scenarios.filter((item) => item.cardBorder)).toEqual([scenarios[0], scenarios[1]]);
    expect(
      scenarios.find((item) => item.key === resolveDefaultCanonicalCardSurface(surfaces)?.key)
    ).toBe(scenarios[0]);
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

it('adds a solid Neutral Low swatch with bordered Lowest cards before Medium', () => {
  const lowest: ResolvedCanonicalCardSurface = { ...surfaces[0], key: 'neutral.lowest' };
  const scenarios = resolveBackgroundScenarios([lowest, ...surfaces]);
  const index = scenarios.findIndex((scenario) => scenario.key === 'neutral.low');
  expect(scenarios[index]).toMatchObject({ card: lowest, splitSwatch: false, cardBorder: true });
  expect(scenarios.at(-2)?.key).toBe('neutral.medium');
  expect(scenarios.at(-1)?.key).toBe('primary.highest');
  expect(new Set(scenarios.map(({ key }) => key)).size).toBe(scenarios.length);
});

it('keeps a border on the base-on-base exception without adding borders to tonal scenarios', () => {
  const scenarios = resolveBackgroundScenarios(surfaces);
  expect(scenarios[0]).toMatchObject({
    canvas: surfaces[0],
    card: surfaces[0],
    cardBorder: true,
    splitSwatch: false
  });
  expect(scenarios.find(({ key }) => key === 'primary.medium')?.cardBorder).toBe(false);
  expect(scenarios.find(({ key }) => key === 'neutral.medium')?.cardBorder).toBe(false);
});
