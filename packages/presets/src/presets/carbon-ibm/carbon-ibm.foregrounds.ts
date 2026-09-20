import {
  type ForegroundEmphasisMap,
  type ForegroundProfile,
  normalizeHexColor,
  type PrimitiveRole,
  primitive,
  type SchemaForegrounds,
  type SolidColor,
  type ThemeMode,
  withAlpha
} from '@kiskadee/core';
import { absoluteCap, type CarbonIbmColorResolver, referenceColor } from './carbon-ibm.color.ts';
import { tokenColor } from './carbon-ibm.tokens.ts';

const THEMES = ['light', 'dark', 'darker'] as const;

// Measured against the generated White/G10 backgrounds and dark layer tokens.
// These are family-relative Text extensions, not replacements for source tokens.
function chromaticOffset(role: PrimitiveRole | 'primary', theme: ThemeMode, deep: boolean): number {
  if (theme !== 'light') return deep ? 9 : 7;
  const base = role === primitive('orange', 'v1') ? 7 : role === primitive('yellow', 'v1') ? 12 : 0;
  return base + (deep ? 3 : 0);
}

/** Preserve the original token's opacity when reducing its visibility. */
function visibility(color: SolidColor, percent: number): SolidColor {
  if (!color.startsWith('#')) return withAlpha(color, percent);
  const normalized = normalizeHexColor(color);
  const sourceAlpha =
    normalized.length === 9 ? Number.parseInt(normalized.slice(7, 9), 16) / 255 : 1;
  return withAlpha(normalized, sourceAlpha * percent);
}

function onColor(c: CarbonIbmColorResolver, theme: ThemeMode): ForegroundEmphasisMap {
  const rest = tokenColor(c, theme, 'text-on-color');
  const disabled = tokenColor(c, theme, 'text-on-color-disabled', 'neutral');
  return {
    medium: { rest, pending: visibility(rest, 70), disabled },
    low: { rest: visibility(rest, 70), disabled },
    lowest: { rest: visibility(rest, 40), disabled }
  };
}

function neutralProfile(c: CarbonIbmColorResolver, deep = false): ForegroundProfile {
  return {
    palettes: {
      default: Object.fromEntries(
        THEMES.map((theme) => {
          const rest = deep
            ? c.resolve(
                'default',
                theme === 'light' ? 'l' : 'd',
                absoluteCap(primitive('black', 'v1'), theme === 'light' ? 'dark' : 'light')
              )
            : tokenColor(c, theme, 'text-primary', 'neutral');
          const disabled = tokenColor(c, theme, 'text-disabled', 'neutral');
          return [
            theme,
            {
              onSubtle: {
                medium: { rest, pending: visibility(rest, 70), disabled },
                low: {
                  rest: tokenColor(c, theme, deep ? 'text-primary' : 'text-secondary', 'neutral'),
                  disabled
                },
                lowest: {
                  rest: tokenColor(c, theme, deep ? 'text-secondary' : 'text-helper', 'neutral'),
                  disabled
                }
              },
              onVivid: onColor(c, theme)
            }
          ];
        })
      )
    }
  };
}

function chromaticProfile(
  c: CarbonIbmColorResolver,
  role: PrimitiveRole | 'primary',
  deep = false
): ForegroundProfile {
  return {
    palettes: {
      default: Object.fromEntries(
        THEMES.map((theme) => {
          const track = theme === 'light' ? 'l' : 'd';
          const rest =
            role === 'primary'
              ? tokenColor(c, theme, deep ? 'link-secondary' : 'link-primary', role)
              : c.resolve(
                  'default',
                  track,
                  referenceColor(role, 'vivid', chromaticOffset(role, theme, deep))
                );
          const disabled = tokenColor(c, theme, 'text-disabled', 'neutral');
          const hover =
            role === 'primary' && !deep
              ? tokenColor(c, theme, 'link-primary-hover', role)
              : undefined;
          return [
            theme,
            {
              onSubtle: {
                medium: {
                  rest,
                  ...(hover !== undefined && hover !== rest ? { hover } : {}),
                  pending: visibility(rest, 70),
                  disabled
                },
                low: { rest: visibility(rest, 68), disabled },
                lowest: { rest: visibility(rest, 40), disabled }
              },
              onVivid: onColor(c, theme)
            }
          ];
        })
      )
    }
  };
}

export function createCarbonIbmForegrounds({
  c
}: {
  c: CarbonIbmColorResolver;
}): SchemaForegrounds {
  const family = (role: PrimitiveRole | 'primary') => ({
    standard: chromaticProfile(c, role),
    deep: chromaticProfile(c, role, true)
  });
  return {
    profiles: {
      neutral: { standard: neutralProfile(c), deep: neutralProfile(c, true) },
      blue: family('primary'),
      red: family(primitive('red', 'v1')),
      green: family(primitive('green', 'v1')),
      purple: family(primitive('purple', 'v1')),
      orange: family(primitive('orange', 'v1')),
      yellow: family(primitive('yellow', 'v1'))
    }
  };
}
