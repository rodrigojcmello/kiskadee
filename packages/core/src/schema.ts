import type { Breakpoints, ElementAllSizeValue, ElementSizeValue } from './breakpoints';
import type {
  ElementPalettes,
  InteractionState,
  SchemaSegments,
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
  // Palettes follow the same structure as SchemaSegments: segmentName → themes → ColorSchema
  // This ensures consistency and enables proper white-label theming with light/dark mode support
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
// --k-font-body / --k-font-heading / --k-font-code).
export type SchemaFonts = {
  body: string;
  heading?: string;
  code?: string;
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
   * Optional, global font configuration for the schema.
   *
   * This is descriptive metadata that captures the font stacks originally
   * envisioned for the design system (body/heading/code). Runtime consumers
   * may choose to honor or override these values when wiring CSS variables
   * or platform-specific font settings.
   */
  fonts?: SchemaFonts;
  segments?: SchemaSegments<TSegmentName>;
  themeTokens?: ThemeTokens<TSegmentName>;
  components: Components<TSegmentName>;
};

// Color classes structure: segregates single-color, soft, and solid variants
export type ColorClasses = {
  u?: string; // unique/single color (no tone variants)
  f?: string; // soft (light tone track)
  d?: string; // solid (dark tone track)
};

// Types describing the JSON artifact produced by web-builder (classNamesMap.json)
export type ClassNameByElementJSON = {
  // d = decorations, e = effects, s = scales, c = colors (with u/f/d sub-fields), cs = control states
  // d: flattened into a single space-separated string of class names (always-on)
  d?: string;
  // e: unified string of effect base classes (space-separated). These classes are opt-in and require
  // activation via state activators (.-a, .-h, .-f, .-p, .-s, .-d, .-r) or native pseudos to take effect.
  // No interaction-state nesting here; components may append all base effect classes unconditionally.
  e?: string;
  // s: values are pre-joined into a single space-separated string (no arrays) per size key
  s?: Partial<Record<string, string>>;
  // c: Map of semantic key -> ColorClasses (semantic-aware colors). No legacy flat format.
  c?: Record<string, ColorClasses>;
  // cs: control-state specific (selected) — flattened string of utility classes
  // TODO: replace is with a single letter
  cs?: string;
};

export type ComponentClassNameMapJSON = Partial<
  Record<string, Record<string, ClassNameByElementJSON>>
>;
