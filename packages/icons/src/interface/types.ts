import type { ComponentType, CSSProperties, ExoticComponent } from 'react';
import type { CanonicalIconName, IconName } from './canonical.ts';

export type IconFamilyId = string;
export type IconFamilyVariantId = string;
export type IconDirection = 'fixed' | 'mirror' | 'unique';

export type IconGlyphRendererProps = {
  className?: string;
  style?: CSSProperties;
};

export type IconGlyphRenderer =
  | ComponentType<IconGlyphRendererProps>
  | ExoticComponent<IconGlyphRendererProps>;

export type IconGlyphDescriptor = {
  glyph: IconGlyphRenderer;
  direction?: IconDirection;
  rtlGlyph?: IconGlyphRenderer;
};

export type IconGlyphDefinition = IconGlyphRenderer | IconGlyphDescriptor;
export type IconGlyphMap = Readonly<Record<string, IconGlyphDefinition>>;
export type CompleteCanonicalGlyphMap = Readonly<
  Record<CanonicalIconName, IconGlyphDefinition> & Record<string, IconGlyphDefinition>
>;

export type IconFamilyVariant = {
  id: IconFamilyVariantId;
  label: string;
  glyphs: IconGlyphMap;
  rendererProps?: Readonly<Record<string, unknown>>;
  prepare?: () => void | Promise<void>;
};

export type IconFamilyVariantInput = Omit<IconFamilyVariant, 'id'>;

export type DefinedIconFamily = {
  id: IconFamilyId;
  label: string;
  defaultVariant: IconFamilyVariantId;
  variants: Readonly<Record<IconFamilyVariantId, IconFamilyVariant>>;
};

export type SingleVariantIconFamilyInput = {
  id: IconFamilyId;
  label: string;
  glyphs: IconGlyphMap;
  prepare?: () => void | Promise<void>;
};

export type MultiVariantIconFamilyInput = {
  id: IconFamilyId;
  label: string;
  defaultVariant: IconFamilyVariantId;
  variants: Readonly<Record<IconFamilyVariantId, IconFamilyVariantInput>>;
};

export type IconFamilyDefinitionInput = SingleVariantIconFamilyInput | MultiVariantIconFamilyInput;

export type IconFamilyVariantCatalogEntry = {
  id: IconFamilyVariantId;
  label: string;
};

export type IconFamilyCatalogEntry = {
  kind: 'family';
  id: IconFamilyId;
  label: string;
  defaultVariant: IconFamilyVariantId;
  variants: readonly IconFamilyVariantCatalogEntry[];
  load: () => Promise<DefinedIconFamily>;
};

export type IconFamilyFallbackEntry = {
  kind: 'fallback';
  id: IconFamilyId;
  label: string;
  fallbackTo: IconFamilyId;
  fallbackVariant?: IconFamilyVariantId;
};

export type IconFamilyCatalogItem = IconFamilyCatalogEntry | IconFamilyFallbackEntry;

export type ResolvedIconGlyph = {
  direction: IconDirection;
  glyph: IconGlyphRenderer;
  name: IconName;
  rendererProps?: Readonly<Record<string, unknown>>;
  rtlGlyph?: IconGlyphRenderer;
};
