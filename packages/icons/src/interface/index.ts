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
