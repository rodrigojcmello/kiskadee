import type { ComponentType, CSSProperties, ExoticComponent } from 'react';
import type { CanonicalIconName, IconName } from './canonical.ts';

export type IconFamilyId = string;
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

export type DefinedIconFamily = {
  id: IconFamilyId;
  label: string;
  glyphs: IconGlyphMap;
  prepare?: () => void | Promise<void>;
};

export type IconFamilyCatalogEntry = {
  kind: 'family';
  id: IconFamilyId;
  label: string;
  load: () => Promise<DefinedIconFamily>;
};

export type IconFamilyFallbackEntry = {
  kind: 'fallback';
  id: IconFamilyId;
  label: string;
  fallbackTo: IconFamilyId;
};

export type IconFamilyCatalogItem = IconFamilyCatalogEntry | IconFamilyFallbackEntry;

export type ResolvedIconGlyph = {
  direction: IconDirection;
  glyph: IconGlyphRenderer;
  name: IconName;
  rtlGlyph?: IconGlyphRenderer;
};
