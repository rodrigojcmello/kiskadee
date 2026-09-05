import type { CardCanonicalSurfacesPayload } from '@kiskadee/web-builder/types';
import { describe, expect, it } from 'vitest';
import {
  isDarkSurfaceColor,
  resolveCanonicalCardSurfaces,
  resolveDefaultCanonicalCardSurface
} from './canonical-card-surfaces';

function createCanonicalSurfaces(): CardCanonicalSurfacesPayload {
  return {
    default: {
      light: [
        {
          intent: 'neutral',
          emphasis: 'low',
          contentSurfaceContext: 'onSubtle',
          rest: '#ffffff'
        },
        {
          intent: 'neutral',
          emphasis: 'medium',
          contentSurfaceContext: 'onSubtle',
          rest: '#f9fbff'
        },
        {
          intent: 'primary',
          emphasis: 'medium',
          contentSurfaceContext: 'onSubtle',
          rest: '#e1efff'
        },
        {
          intent: 'neutral',
          emphasis: 'high',
          contentSurfaceContext: 'onSubtle',
          rest: '#f4f6fe'
        },
        {
          intent: 'primary',
          emphasis: 'highest',
          contentSurfaceContext: 'onVivid',
          rest: '#0064b4'
        },
        {
          intent: 'neutral',
          emphasis: 'highest',
          contentSurfaceContext: 'onSubtle',
          rest: '#000000'
        }
      ]
    }
  };
}

describe('canonical Card surface resolver', () => {
  it('shares the Button initial canvas surface without hardcoding a color', () => {
    const surfaces = resolveCanonicalCardSurfaces({
      canonicalSurfaces: createCanonicalSurfaces(),
      segment: 'default',
      theme: 'light'
    });
    expect(resolveDefaultCanonicalCardSurface(surfaces)).toBe(surfaces[1]);
    expect(resolveDefaultCanonicalCardSurface(surfaces, 'onVivid')).toBe(surfaces[4]);
    // The initial choice is made after filtering unsupported contexts, not by raw array index.
    expect(resolveDefaultCanonicalCardSurface([surfaces[4], surfaces[0], surfaces[1]])).toBe(
      surfaces[1]
    );
    expect(resolveDefaultCanonicalCardSurface([surfaces[0]])).toBe(surfaces[0]);
    expect(resolveDefaultCanonicalCardSurface([surfaces[4]])).toBeUndefined();
    expect(resolveDefaultCanonicalCardSurface([])).toBeUndefined();
  });

  it('resolves the same default policy from the current segment and theme artifacts', () => {
    const canonicalSurfaces = createCanonicalSurfaces();
    canonicalSurfaces.default.dark = [
      { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle', rest: '#292929' },
      { intent: 'neutral', emphasis: 'medium', contentSurfaceContext: 'onSubtle', rest: '#242424' }
    ];
    canonicalSurfaces.alternate = {
      light: [
        { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle', rest: '#fffef0' },
        {
          intent: 'neutral',
          emphasis: 'medium',
          contentSurfaceContext: 'onSubtle',
          rest: '#eeede0'
        }
      ]
    };
    expect(
      resolveDefaultCanonicalCardSurface(
        resolveCanonicalCardSurfaces({ canonicalSurfaces, segment: 'default', theme: 'dark' })
      )?.resolvedColor
    ).toBe('#242424');
    expect(
      resolveDefaultCanonicalCardSurface(
        resolveCanonicalCardSurfaces({ canonicalSurfaces, segment: 'alternate', theme: 'light' })
      )?.resolvedColor
    ).toBe('#eeede0');
  });

  it('preserves the artifact order and descendant surface-context metadata', () => {
    expect(
      resolveCanonicalCardSurfaces({
        canonicalSurfaces: createCanonicalSurfaces(),
        segment: 'default',
        theme: 'light'
      })
    ).toEqual([
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
        resolvedColor: '#e1efff',
        contentSurfaceContext: 'onSubtle'
      },
      {
        key: 'neutral.high',
        label: 'Neutral high',
        resolvedColor: '#f4f6fe',
        contentSurfaceContext: 'onSubtle'
      },
      {
        key: 'primary.highest',
        label: 'Primary highest',
        resolvedColor: '#0064b4',
        contentSurfaceContext: 'onVivid'
      },
      {
        key: 'neutral.highest',
        label: 'Neutral highest',
        resolvedColor: '#000000',
        contentSurfaceContext: 'onSubtle'
      }
    ]);
  });

  it('deduplicates equivalent colors without changing authored precedence', () => {
    const canonicalSurfaces = createCanonicalSurfaces();
    const light = canonicalSurfaces.default?.light;
    if (!light) throw new Error('Test canonical surfaces are missing');
    light[0].rest = '#FFFFFF';
    light[1].rest = '#ffffff';

    const resolved = resolveCanonicalCardSurfaces({
      canonicalSurfaces,
      segment: 'default',
      theme: 'light'
    });

    expect(resolved.map((surface) => surface.key)).toEqual([
      'neutral.low',
      'primary.medium',
      'neutral.high',
      'primary.highest',
      'neutral.highest'
    ]);
    expect(
      resolveCanonicalCardSurfaces({
        canonicalSurfaces,
        segment: 'default',
        theme: 'light'
      })
    ).not.toEqual(expect.arrayContaining([expect.objectContaining({ key: 'neutral.medium' })]));
  });

  it('returns no canonical surfaces when the Card palette is unavailable', () => {
    expect(
      resolveCanonicalCardSurfaces({
        canonicalSurfaces: createCanonicalSurfaces(),
        segment: 'default',
        theme: 'dark'
      })
    ).toEqual([]);
  });

  it('classifies opaque dark surfaces by relative luminance', () => {
    expect(isDarkSurfaceColor('#142d48')).toBe(true);
    expect(isDarkSurfaceColor('#0064b4')).toBe(true);
    expect(isDarkSurfaceColor('#e1efff')).toBe(false);
    expect(isDarkSurfaceColor('var(--surface)')).toBe(false);
  });
});
