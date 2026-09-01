import type {
  ElementForeground,
  ElementPalettes,
  ForegroundProfilePalettes,
  SchemaForegrounds,
  SurfaceContext,
  ThemeMode
} from '@kiskadee/core';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeRecords(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const merged = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];
    merged[key] = isRecord(current) && isRecord(value) ? mergeRecords(current, value) : value;
  }
  return merged;
}

/** Expands global foreground profiles into ordinary element text-color palettes. */
export function expandElementForeground(
  foreground: ElementForeground,
  foregrounds: SchemaForegrounds
): ElementPalettes {
  let expanded: Record<string, unknown> = {};

  for (const [intent, reference] of Object.entries(foreground)) {
    const family = foregrounds.profiles[reference.family];
    if (!family) {
      throw new Error(`[web-builder] Foreground family "${reference.family}" is not defined.`);
    }
    const profile = family[reference.profile];
    if (!profile) {
      throw new Error(
        `[web-builder] Foreground profile "${reference.family}.${reference.profile}" is not defined.`
      );
    }

    const intentPalettes: Record<string, unknown> = {};
    for (const [segment, byTheme] of Object.entries(
      profile.palettes as ForegroundProfilePalettes
    )) {
      if (!byTheme) continue;
      const themes: Record<string, unknown> = {};

      for (const [theme, byContext] of Object.entries(byTheme) as [
        ThemeMode,
        NonNullable<(typeof byTheme)[ThemeMode]>
      ][]) {
        if (!byContext) continue;
        const contexts: Record<string, unknown> = {};

        for (const [context, emphases] of Object.entries(byContext) as [
          SurfaceContext,
          NonNullable<(typeof byContext)[SurfaceContext]>
        ][]) {
          if (!emphases) continue;
          const restOnlyEmphases = Object.fromEntries(
            Object.entries(emphases).map(([emphasis, stateMap]) => [
              emphasis,
              { rest: stateMap.rest }
            ])
          );
          contexts[context] = {
            textColor: {
              [intent]: restOnlyEmphases
            }
          };
        }
        themes[theme] = contexts;
      }
      intentPalettes[segment] = themes;
    }

    expanded = mergeRecords(expanded, intentPalettes);
  }

  return expanded as ElementPalettes;
}
