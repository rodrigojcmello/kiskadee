import type { SchemaFonts } from '@kiskadee/core';
import {
  type FontFamilyCatalogEntry,
  fontFamilyCatalog,
  fontFamilyCatalogById
} from '@kiskadee/fonts/catalog';
import type { ShowcaseFontRole } from '@kiskadee/react-components';
import type { FontFamilyPreparationResult } from '@kiskadee/runtime/font-family';

export const FOLLOW_PRESET_FONT_KEY = 'preset';
export const MIXED_FONT_KEY = 'mixed';

export type FontFamilyResolutions = Readonly<Partial<Record<string, FontFamilyPreparationResult>>>;

export type FontSelectionOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export function getPresetFamilyId(
  role: ShowcaseFontRole,
  fonts: SchemaFonts | undefined
): string | undefined {
  if (!fonts) return undefined;
  if (role === 'heading') return fonts.roles.heading ?? fonts.roles.body;
  return fonts.roles[role];
}

export function getCatalogEntryLabel(entry: FontFamilyCatalogEntry): string {
  return entry.fallbackFamily ? `${entry.label} → ${entry.fallbackFamily}` : entry.label;
}

export function getFamilyResolutionLabel(result: FontFamilyPreparationResult): string {
  return result.fallbackFor
    ? `${result.family} (fallback for ${result.fallbackFor})`
    : result.family;
}

export function getRecommendedFontLabel(
  role: ShowcaseFontRole,
  fonts: SchemaFonts | undefined,
  resolutions: FontFamilyResolutions
): string {
  const familyId = getPresetFamilyId(role, fonts);

  if (!familyId) {
    return role === 'code' ? 'System monospace' : 'Application default';
  }

  const resolution = resolutions[familyId];
  if (resolution) return getFamilyResolutionLabel(resolution);

  const catalogEntry = fontFamilyCatalogById.get(familyId);
  if (catalogEntry) return getCatalogEntryLabel(catalogEntry);

  return fonts?.families[familyId]?.stack[0] ?? familyId;
}

export function createFontSelectionOptions(
  role: ShowcaseFontRole,
  fonts: SchemaFonts | undefined,
  resolutions: FontFamilyResolutions
): FontSelectionOption[] {
  const recommendedFamilyId = getPresetFamilyId(role, fonts);

  return [
    {
      value: FOLLOW_PRESET_FONT_KEY,
      label: getRecommendedFontLabel(role, fonts, resolutions)
    },
    ...fontFamilyCatalog
      .filter((entry) => entry.id !== recommendedFamilyId)
      .map((entry) => ({
        value: entry.id,
        label: getCatalogEntryLabel(entry)
      }))
  ];
}

export function formatFontProvider(entry: FontFamilyCatalogEntry): string {
  return entry.provider === 'google-fonts' ? 'Google Fonts' : 'Microsoft / Google fallback';
}
