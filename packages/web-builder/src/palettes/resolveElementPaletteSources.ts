import type {
  ElementForeground,
  ElementPalettes,
  ElementSeparator,
  SchemaForegrounds,
  SchemaSeparators
} from '@kiskadee/core';
import { expandElementForeground } from '../foreground/compileForegrounds.ts';
import {
  type ExpandedElementSeparator,
  expandElementSeparator
} from '../phase-1-convert-schema-to-style-keys/separators/compileSeparators.ts';

export type ElementPaletteSource = {
  foreground?: ElementForeground;
  palettes?: ElementPalettes;
  separator?: ElementSeparator;
};

export type ResolvedElementPaletteSources = {
  palettes: ElementPalettes | undefined;
  separatorRecipe: ExpandedElementSeparator | undefined;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergePaletteRecords(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const merged = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = merged[key];
    merged[key] =
      isRecord(current) && isRecord(value) ? mergePaletteRecords(current, value) : value;
  }
  return merged;
}

/**
 * What
 *     Resolves separator, foreground, and authored palette sources for one element.
 * Why
 *     Style emission and manifest metadata must consume the same effective palettes and precedence.
 */
export function resolveElementPaletteSources(
  element: ElementPaletteSource,
  catalogs: {
    foregrounds?: SchemaForegrounds;
    separators?: SchemaSeparators;
  }
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
    separatorRecipe?.palettes as ElementPalettes | undefined,
    foregroundPalettes,
    element.palettes
  ].filter((value): value is ElementPalettes => Boolean(value));
  const palettes = paletteSources.reduce<ElementPalettes | undefined>(
    (current, value) =>
      current
        ? (mergePaletteRecords(
            current as Record<string, unknown>,
            value as Record<string, unknown>
          ) as ElementPalettes)
        : value,
    undefined
  );

  return { palettes, separatorRecipe };
}
