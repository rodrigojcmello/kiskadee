export {
  CANONICAL_ICON_NAMES,
  type CanonicalIconName,
  type CustomIconName,
  type IconName,
  isCanonicalIconName
} from './canonical.ts';
export {
  defineIconFamily,
  defineIconFamilyCatalogEntry,
  defineIconFamilyFallback,
  resolveIconFamilyVariant,
  resolveIconGlyph
} from './defineIconFamily.ts';
export {
  DEFAULT_ESSENTIAL_ICONS,
  type EssentialIconMap,
  type EssentialIconName
} from './essential.ts';
export type {
  CompleteCanonicalGlyphMap,
  DefinedIconFamily,
  IconDirection,
  IconFamilyCatalogEntry,
  IconFamilyCatalogItem,
  IconFamilyDefinitionInput,
  IconFamilyFallbackEntry,
  IconFamilyId,
  IconFamilyVariant,
  IconFamilyVariantCatalogEntry,
  IconFamilyVariantId,
  IconFamilyVariantInput,
  IconGlyphDefinition,
  IconGlyphDescriptor,
  IconGlyphMap,
  IconGlyphRenderer,
  IconGlyphRendererProps,
  ResolvedIconGlyph
} from './types.ts';
