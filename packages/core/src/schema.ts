import type { Breakpoints, ElementAllSizeValue, ElementSizeValue } from './breakpoints';
import type {
  ElementPalettes,
  InteractionState,
  SchemaColors,
  SegmentName,
  SelectedInteractionStateToken,
  SemanticColor,
  SolidColor,
  ThemeMode
} from './types/colors/colors.types';
import type { DecorationSchema } from './types/decorations/decorations.types';
import type { ElementEffects } from './types/effects';
import type { ScaleSchema } from './types/scales/scales.types';

// Names of all supported components
export type ComponentName = 'button' | 'tabs';

export type ElementStyle<TSegmentName extends SegmentName = never> = Partial<{
  name?: string; // for example "element-element-element-element"
  decorations: DecorationSchema;
  scales: ScaleSchema;
  // Palettes follow the structure: segmentName → theme → ColorSchema.
  // This ensures consistency and enables proper white-label theming with theme mode support.
  palettes: ElementPalettes<TSegmentName>;
  effects: ElementEffects;
}>;

type Elements<TSegmentName extends SegmentName = never> = Record<
  ElementName,
  ElementStyle<TSegmentName>
>;

// -------------------------------------------------------------------------------------------------
export type StyleKey = string;

/**
 * Element name by component. Initially using generic names like e1, e2, etc., but may need specific
 * names in the future.
 */
export type ElementName = string;

// Mapping of style keys by interaction state per element
export type StyleKeysByInteractionState = Partial<
  Record<InteractionState | SelectedInteractionStateToken, StyleKey[]>
>;

export type InteractionStateBySemanticColor = Partial<{
  [K in SemanticColor]: StyleKeysByInteractionState;
}>;

export interface StyleKeyByElement<TSegmentName extends SegmentName = never> {
  decorations: StyleKey[];
  effects: StyleKeysByInteractionState;
  scales: Partial<Record<ElementSizeValue | ElementAllSizeValue, StyleKey[]>>;
  radiusScales?: Partial<Record<ElementSizeValue | ElementAllSizeValue, StyleKey[]>>;
  // Palettes now include theme mode in the structure: segment → theme → semantic color → interaction states
  palettes: Partial<
    Record<
      TSegmentName | 'default' | 'dynamic',
      Partial<Record<ThemeMode, InteractionStateBySemanticColor>>
    >
  >;
}

export type ComponentStyleKeyMap<TSegmentName extends SegmentName = never> = Partial<{
  [componenteName in ComponentName]: {
    [elementName: ElementName]: StyleKeyByElement<TSegmentName>;
  };
}>;

// Legacy, delete it
export interface ClassNameMap {
  [componenteName: string]: {
    [elementName: string]: Partial<Record<InteractionState, string[]>>;
  };
}

// -------------------------------------------------------------------------------------------------

type Components<TSegmentName extends SegmentName = never> = Partial<
  Record<ComponentName, { elements: Elements<TSegmentName> }>
>;

export type SchemaMetadata = {
  name: string;
  version: [number, number, number];
  author: string;
  breakpoints: Breakpoints;
  prefix?: string;
};

// Global, descriptive font tokens for a design system.
//
// These values represent the intended font-family stacks for the schema as a whole
// and are not meant to be strictly enforced. Consumers are free to override fonts
// at the application level (for example, by redefining CSS variables such as
// --k-font-body / --k-font-heading).
export type SchemaFontStack = readonly [primary: string, fallback: string];

export type SchemaFonts = {
  body: SchemaFontStack;
  heading?: SchemaFontStack;
};

export type FocusGlobalTokens = {
  /** Outline width in px (unitless number in schema/artifacts; consumers append px). */
  width?: number;
  /** Outline offset in px (unitless number; may be negative to simulate inset). */
  offset?: number;
};

export type RadiusMode = 'rounded' | 'square' | 'full';

export type SchemaGlobalTokens = {
  fonts?: SchemaFonts;
  focus?: FocusGlobalTokens;
  radius?: RadiusMode;
};

export type ThemeTokens<TSegmentName extends SegmentName = never> = Partial<{
  palettes: Partial<
    Record<
      TSegmentName | 'default' | 'dynamic',
      Partial<
        Record<
          ThemeMode,
          {
            focusColor?: SolidColor;
            background?: SolidColor;
          }
        >
      >
    >
  >;
}>;

export type Schema<TSegmentName extends SegmentName = never> = SchemaMetadata & {
  /**
   * Global tokens independent of segment/theme (web payload optimization).
   *
   * Example: focus outline width/offset and global font stacks.
   */
  global?: SchemaGlobalTokens;
  /**
   * Optional 3-layer color configuration.
   *
   * This is the source of truth for the modern color pipeline:
   * - Layer 1: primitive colors
   * - Layer 2: global semantics
   * - Layer 3: component intents
   */
  colors?: SchemaColors;
  themeTokens?: ThemeTokens<TSegmentName>;
  components: Components<TSegmentName>;
};

// Color classes structure: emphasis variants for component palettes
export type ColorClasses = {
  h?: string; // high emphasis
  m?: string; // medium emphasis
  l?: string; // low emphasis
  ll?: string; // lowest emphasis
};

// Types describing the JSON artifact produced by web-builder (classNamesMap.json)
export type ClassNameByElementJSON = {
  // d = decorations, e = effects (segregated), s = scales, c = colors (with h/m/l/ll sub-fields), l = control states
  // d: flattened into a single space-separated string of class names (always-on)
  d?: string;
  // e: effect buckets (each bucket is opt-in at component level).
  // Each bucket value is a space-separated string of class names.
  // Example buckets (not exhaustive):
  // - h: shadow
  // - rr: border radius (rounded)
  // - rf: border radius (full)
  e?: Partial<Record<string, string>>;
  // s: values are pre-joined into a single space-separated string (no arrays) per size key.
  // For web payload optimization, keys are stored without the "s:" prefix (e.g. "s:md:1" -> "md:1", "s:all" -> "all").
  s?: Partial<Record<string, string>>;
  // r: rounded border radius scales (size-aware, opt-in at component level).
  r?: Partial<Record<string, string>>;
  // c: Map of semantic key -> ColorClasses (semantic-aware colors). No legacy flat format.
  c?: Record<string, ColorClasses>;
  // l: control-state specific (selected) — flattened string of utility classes
  l?: string;
};

export type ComponentClassNameMapJSON = Partial<
  Record<string, Record<string, ClassNameByElementJSON>>
>;
