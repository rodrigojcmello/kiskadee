import { describe, expect, it } from 'vitest';
import type { DesignSystemSchemaArtifact } from '@/hooks/use-design-system-schema';
import { isDarkSurfaceColor, resolveCanonicalCardSurfaces } from './canonical-card-surfaces';

function createSchema(
  boxColor: Record<string, Record<string, { rest?: unknown }>>
): DesignSystemSchemaArtifact {
  return {
    components: {
      card: {
        elements: {
          e1: {
            palettes: {
              default: {
                light: {
                  default: {
                    boxColor
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

describe('canonical Card surface resolver', () => {
  it('reads ordered Rest surfaces from the default Card surface context', () => {
    const schema = createSchema({
      neutral: {
        low: { rest: '#ffffff' },
        medium: { rest: '#f9fbff' },
        high: { rest: '#f4f6fe' },
        highest: { rest: '#000000' }
      },
      primary: {
        medium: { rest: '#e1efff' },
        highest: { rest: '#0064b4' }
      }
    });

    expect(
      resolveCanonicalCardSurfaces({
        schema,
        segment: 'default',
        theme: 'light'
      })
    ).toEqual([
      { key: 'neutral.low', label: 'Neutral low', resolvedColor: '#ffffff' },
      { key: 'neutral.medium', label: 'Neutral medium', resolvedColor: '#f9fbff' },
      { key: 'primary.medium', label: 'Primary medium', resolvedColor: '#e1efff' },
      { key: 'neutral.high', label: 'Neutral high', resolvedColor: '#f4f6fe' },
      { key: 'primary.highest', label: 'Primary highest', resolvedColor: '#0064b4' },
      { key: 'neutral.highest', label: 'Neutral highest', resolvedColor: '#000000' }
    ]);
  });

  it('filters missing roles and deduplicates equivalent colors', () => {
    const schema = createSchema({
      neutral: {
        low: { rest: '#FFFFFF' },
        medium: { rest: '#ffffff' },
        high: { rest: { ref: '#11131c' } }
      },
      primary: {
        medium: { rest: '#e1efff' }
      }
    });

    expect(
      resolveCanonicalCardSurfaces({
        schema,
        segment: 'default',
        theme: 'light'
      })
    ).toEqual([
      { key: 'neutral.low', label: 'Neutral low', resolvedColor: '#FFFFFF' },
      { key: 'primary.medium', label: 'Primary medium', resolvedColor: '#e1efff' },
      { key: 'neutral.high', label: 'Neutral high', resolvedColor: '#11131c' }
    ]);
  });

  it('returns no canonical surfaces when the Card palette is unavailable', () => {
    expect(
      resolveCanonicalCardSurfaces({
        schema: createSchema({}),
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
