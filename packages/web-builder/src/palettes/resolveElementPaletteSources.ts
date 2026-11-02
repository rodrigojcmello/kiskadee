import type {
  ButtonIndicatorPalettes,
  CardSurfaceElementStyle,
  ElementForeground,
  ElementPalettes,
  ElementSeparator,
  SchemaContours,
  SchemaForegrounds,
  SchemaSeparators
} from '@kiskadee/core';
import { resolveColorVariantLeaves } from '@kiskadee/core';
import { expandElementForeground } from '../foreground/compileForegrounds.ts';
import { resolveForegroundReferences } from '../foreground/resolveForegroundReferences.ts';
import {
  type ExpandedElementSeparator,
  expandElementSeparator
} from '../phase-1-convert-schema-to-style-keys/separators/compileSeparators.ts';
import { resolveContourReferences } from './resolveContourReferences.ts';

export type ElementPaletteSource = {
  foreground?: ElementForeground;
  palettes?:
    | ElementPalettes<string>
    | CardSurfaceElementStyle<string>['palettes']
    | ButtonIndicatorPalettes<string>;
  separator?: ElementSeparator;
};

export type ResolvedElementPaletteSources = {
  palettes: ElementPalettes<string> | undefined;
  separatorRecipe: ExpandedElementSeparator | undefined;
};

export type ElementPaletteCatalogs = {
  foregrounds?: SchemaForegrounds;
  contours?: SchemaContours;
  separators?: SchemaSeparators;
};

export const alternativePaletteScopeKey = (segment: string, theme: string, context: string) =>
  JSON.stringify([segment, theme, context]);

function hasAuthoredPaint(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value !== 'object') return true;
  return Object.values(value).some(hasAuthoredPaint);
}

/** Foreground expansion has no alternative authoring axis; Separator retains its source grammar. */
export function getAuthoredElementPaletteSources(
  element: ElementPaletteSource,
  catalogs: ElementPaletteCatalogs
): ElementPalettes<string>[] {
  const separatorPalettes =
    element.separator && catalogs.separators
      ? expandElementSeparator(element.separator, catalogs.separators).palettes
      : undefined;
  return [element.palettes, separatorPalettes].filter(
    (palettes): palettes is ElementPalettes<string> => Boolean(palettes)
  );
}

/** Only authored paint activates inheritance across the elements of one structural branch. */
export function collectAlternativePaletteScopes(
  elements: Record<string, ElementPaletteSource | undefined>,
  catalogs: ElementPaletteCatalogs,
  excludedElements: readonly string[] = []
): Set<string> {
  const scopes = new Set<string>();
  for (const [name, element] of Object.entries(elements)) {
    if (!element || excludedElements.includes(name)) continue;
    for (const palettes of getAuthoredElementPaletteSources(element, catalogs)) {
      for (const [segment, themes] of Object.entries(palettes ?? {})) {
        for (const [theme, contexts] of Object.entries(themes ?? {})) {
          for (const [context, variants] of Object.entries(contexts ?? {})) {
            if (hasAuthoredPaint(variants.alternative))
              scopes.add(alternativePaletteScopeKey(segment, theme, context));
          }
        }
      }
    }
  }
  return scopes;
}

/**
 * What
 *     Resolves separator, foreground, and authored palette sources for one element.
 * Why
 *     Style emission and manifest metadata must consume the same effective palettes and precedence.
 */
export function resolveElementPaletteSources(
  element: ElementPaletteSource,
  catalogs: ElementPaletteCatalogs,
  options: {
    allowIndicatorBoxColor?: boolean;
    alternativePaletteScopes?: ReadonlySet<string>;
  } = {}
): ResolvedElementPaletteSources {
  if (element.foreground && !catalogs.foregrounds) {
    throw new Error('[web-builder] Element references foreground without global.foregrounds.');
  }
  if (element.separator && !catalogs.separators) {
    throw new Error('[web-builder] Element references separator without global.separators.');
  }

  const separatorRecipe =
    element.separator && catalogs.separators
      ? expandElementSeparator(element.separator, catalogs.separators)
      : undefined;
  const foregroundPalettes =
    element.foreground && catalogs.foregrounds
      ? expandElementForeground(element.foreground, catalogs.foregrounds)
      : undefined;
  const paletteSources = [
    separatorRecipe?.palettes as ElementPalettes<string> | undefined,
    foregroundPalettes,
    element.palettes as ElementPalettes<string> | undefined
  ].filter((value): value is ElementPalettes<string> => Boolean(value));
  const palettes = paletteSources.reduce<ElementPalettes<string> | undefined>(
    (current, value) =>
      current ? (resolveColorVariantLeaves(current, value) as ElementPalettes<string>) : value,
    undefined
  );

  return {
    palettes: palettes
      ? resolveContourReferences(
          resolveForegroundReferences(
            Object.fromEntries(
              Object.entries(palettes).map(([segment, themes]) => [
                segment,
                Object.fromEntries(
                  Object.entries(themes ?? {}).map(([theme, contexts]) => [
                    theme,
                    Object.fromEntries(
                      Object.entries(contexts ?? {}).map(([context, variants]) => [
                        context,
                        {
                          standard: variants.standard,
                          ...(!options.allowIndicatorBoxColor &&
                          (options.alternativePaletteScopes
                            ? options.alternativePaletteScopes.has(
                                alternativePaletteScopeKey(segment, theme, context)
                              )
                            : hasAuthoredPaint(variants.alternative))
                            ? {
                                alternative: resolveColorVariantLeaves(
                                  variants.standard,
                                  variants.alternative
                                )
                              }
                            : {})
                        }
                      ])
                    )
                  ])
                )
              ])
            ) as ElementPalettes<string>,
            catalogs.foregrounds,
            options
          ),
          catalogs.contours
        )
      : undefined,
    separatorRecipe
  };
}
