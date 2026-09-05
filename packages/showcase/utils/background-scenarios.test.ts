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
  it('adds white/gray after white/white without replacing gray/white or changing the default', () => {
    const scenarios = resolveBackgroundScenarios(surfaces);
    expect(scenarios.map(({ canvas, card }) => [canvas.key, card.key])).toEqual([
      ['neutral.low', 'neutral.low'],
      ['neutral.low', 'neutral.medium'],
      ['neutral.medium', 'neutral.low'],
      ['primary.medium', 'neutral.low'],
      ['primary.highest', 'primary.highest']
    ]);
    expect(new Set(scenarios.map((item) => item.key)).size).toBe(5);
    expect(scenarios.filter((item) => item.splitSwatch)).toHaveLength(1);
    expect(
      scenarios.find((item) => item.key === resolveDefaultCanonicalCardSurface(surfaces)?.key)
    ).toBe(scenarios[2]);
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
