import type { Breakpoints, ElementAllSizeValue, ElementSizeValue } from './breakpoints.ts';
import type { ButtonElements, ButtonOptions } from './components/button.ts';
import type { CardElements, CardOptions } from './components/card.ts';
import type { DropdownElements } from './components/dropdown.ts';
import type { IconElements } from './components/icon.ts';
import type { ProgressElements } from './components/progress.ts';
import type { SliderOptions, SliderVariants } from './components/slider.ts';
import type { SwitchOptions, SwitchVariants } from './components/switch.ts';
import type { TabsOptions, TabsVariants } from './components/tabs.ts';
import type { TextFieldOptions, TextFieldVariants } from './components/text-field.ts';
import type { ElementIconSize, SchemaIconSizes } from './icon-sizes.ts';
import type {
  ElementPalettes,
  InteractionState,
  SchemaColors,
  SegmentName,
  SelectedInteractionStateToken,
  SemanticColor,
  SolidColor,
  SurfaceContext,
  SurfaceContextBucket,
  ThemeMode
} from './types/colors/colors.types.ts';
import type { DecorationSchema } from './types/decorations/decorations.types.ts';
import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackSetting,
  ActivationFeedbackThemeTokens
} from './types/effects/activation-feedback/activation-feedback.types.ts';
import type { ElementEffects } from './types/effects/index.ts';
import type {
  ShadowEffectSchema,
  ShadowGlobalEffectSchema
} from './types/effects/shadow/shadow.types.ts';
import type { ScaleSchema } from './types/scales/scales.types.ts';
import type { ElementTypography, SchemaTypography } from './typography.ts';

// Names of all supported components
export type ComponentName =
  | 'button'
  | 'card'
  | 'dropdown'
  | 'icon'
  | 'progress'
  | 'slider'
  | 'switch'
  | 'tabs'
  | 'textField';

export type ElementStyle<TSegmentName extends SegmentName = never> = {
  name: string; // human-readable element label, for example "button-text"
} & Partial<{
  decorations: DecorationSchema;
  iconSize: ElementIconSize;
  typography: ElementTypography;
  scales: ScaleSchema;
  // Palettes follow the structure: segmentName → theme → surface context → ColorSchema.
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
  radiusScales?: Partial<
    Record<RadiusMode, Partial<Record<ElementSizeValue | ElementAllSizeValue, StyleKey[]>>>
  >;
  // Palettes include segment, theme, and surface context before semantic colors and states.
  palettes: Partial<
    Record<
      TSegmentName | 'default' | 'dynamic',
      Partial<Record<ThemeMode, Partial<Record<SurfaceContext, InteractionStateBySemanticColor>>>>
    >
  >;
}

export type ComponentElementsStyleKeyMap<TSegmentName extends SegmentName = never> = Record<
  ElementName,
  StyleKeyByElement<TSegmentName>
>;

export type ComponentVariantsStyleKeyMap<TSegmentName extends SegmentName = never> = Record<
  string,
  ComponentElementsStyleKeyMap<TSegmentName>
>;

export type ComponentVariantModesStyleKeyMap<TSegmentName extends SegmentName = never> = Record<
  string,
  ComponentVariantsStyleKeyMap<TSegmentName>
>;

export type ComponentStyleKeyMap<TSegmentName extends SegmentName = never> = Partial<{
  button: ComponentElementsStyleKeyMap<TSegmentName>;
  card: ComponentElementsStyleKeyMap<TSegmentName>;
  dropdown: ComponentElementsStyleKeyMap<TSegmentName>;
  icon: ComponentElementsStyleKeyMap<TSegmentName>;
  progress: ComponentElementsStyleKeyMap<TSegmentName>;
  slider: ComponentVariantModesStyleKeyMap<TSegmentName>;
  switch: ComponentVariantModesStyleKeyMap<TSegmentName>;
  tabs: ComponentVariantsStyleKeyMap<TSegmentName>;
  textField: ComponentVariantModesStyleKeyMap<TSegmentName>;
}>;

// Legacy, delete it
export interface ClassNameMap {
  [componenteName: string]: {
    [elementName: string]: Partial<Record<InteractionState, string[]>>;
  };
}

// -------------------------------------------------------------------------------------------------

type TabsComponent<TSegmentName extends SegmentName = never> = {
  elements?: never;
  options?: TabsOptions;
  variants: TabsVariants<TSegmentName>;
};

type TextFieldComponent<TSegmentName extends SegmentName = never> = {
  elements?: never;
  options?: TextFieldOptions;
  variants: TextFieldVariants<TSegmentName>;
};

type SwitchComponent<TSegmentName extends SegmentName = never> = {
  elements?: never;
  effects?: ComponentEffects;
  options?: SwitchOptions;
  variants: SwitchVariants<TSegmentName>;
};

type SliderComponent<TSegmentName extends SegmentName = never> = {
  elements?: never;
  effects?: ComponentEffects;
  options?: SliderOptions;
  variants: SliderVariants<TSegmentName>;
};

type ComponentEffects = {
  activationFeedback?: ActivationFeedbackSetting;
  shadow?: ShadowEffectSchema;
};

type Components<TSegmentName extends SegmentName = never> = Partial<{
  button: {
    effects?: ComponentEffects;
    options?: ButtonOptions;
    elements: ButtonElements<TSegmentName> & Elements<TSegmentName>;
  };
  card: {
    effects?: ComponentEffects;
    options?: CardOptions<TSegmentName>;
    elements: CardElements<TSegmentName> & Elements<TSegmentName>;
  };
  dropdown: {
    effects?: {
      shadow?: ShadowEffectSchema;
    };
    elements: DropdownElements<TSegmentName> & Elements<TSegmentName>;
  };
  icon: {
    elements: IconElements<TSegmentName> & Elements<TSegmentName>;
  };
  progress: {
    elements: ProgressElements<TSegmentName>;
  };
  slider: SliderComponent<TSegmentName>;
  switch: SwitchComponent<TSegmentName>;
  tabs: TabsComponent<TSegmentName>;
  textField: TextFieldComponent<TSegmentName>;
}>;

export type SchemaMetadata = {
  name: string;
  version: [number, number, number];
  author: string;
  breakpoints: Breakpoints;
  prefix?: string;
};

export type FontFamilyId = string;

export type FontStack = readonly [primary: string, ...fallbacks: string[]];

export type SchemaFontFamily = {
  stack: FontStack;
};

// Global font recommendations are split into a reusable family catalog and semantic roles.
// Availability and loading remain consumer concerns and are intentionally absent from the schema.
export type SchemaFonts = {
  families: Readonly<Record<FontFamilyId, SchemaFontFamily>>;
  roles: {
    body: FontFamilyId;
    heading?: FontFamilyId;
    code?: FontFamilyId;
  };
};

export type IconFamilyId = string;
export type IconFamilyVariantId = string;

// Global icon recommendations identify a family and, optionally, one of its
// local variants without coupling the schema to a renderer, package, URL,
// glyph catalog, or loading strategy.
export type SchemaIcons = {
  family: IconFamilyId;
  variant?: IconFamilyVariantId;
};

// [EFFECTS] START: Global effect schema section.
export type SchemaGlobalEffects = {
  activationFeedback?: ActivationFeedbackEffectSchema;
  shadow?: ShadowGlobalEffectSchema;
};
// [EFFECTS] END: Global effect schema section.

export type FocusGlobalTokens = {
  /** Outline width in px (unitless number in schema/artifacts; consumers append px). */
  width?: number;
  /** Outline offset in px (unitless number; may be negative to simulate inset). */
  offset?: number;
};

export type RadiusMode = 'rounded' | 'square' | 'pill';

export type SchemaGlobalTokens = {
  fonts?: SchemaFonts;
  iconSizes?: SchemaIconSizes;
  icons?: SchemaIcons;
  typography?: SchemaTypography;
  focus?: FocusGlobalTokens;
  radius?: RadiusMode;
  effects?: SchemaGlobalEffects;
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
            // [EFFECTS] START: Theme effect token overrides.
            effects?: {
              activationFeedback?: ActivationFeedbackThemeTokens;
            };
            // [EFFECTS] END: Theme effect token overrides.
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
  hh?: string; // highest emphasis
  h?: string; // high emphasis
  m?: string; // medium emphasis
  l?: string; // low emphasis
  ll?: string; // lowest emphasis
};

export type EffectClassNamesBySizeJSON = Partial<Record<string, string>>;
export type EffectClassBucketJSON = string | EffectClassNamesBySizeJSON;

// Types describing the JSON artifact produced by web-builder (classNamesMap.json)
export type ClassNameByElementJSON = {
  // d = decorations, e = effects, s = scales, t = typography profiles, w = width scales,
  // c = colors (with hh/h/m/l/ll sub-fields), l = control states
  // d: flattened into a single space-separated string of class names (always-on)
  d?: string;
  // e: effect buckets (each bucket is opt-in at component level).
  // Each bucket value is a space-separated string of class names.
  // Example buckets (not exhaustive):
  // - af: activation feedback
  // - h: shadow
  // - rr: border radius (rounded)
  // - rp: border radius (pill)
  // - rs: border radius (square)
  // - ts: Switch thumb-shrink effect
  // Size-aware effect buckets use { all, md:1, lg:1, ... }.
  e?: Partial<Record<string, EffectClassBucketJSON>>;
  // s: values are pre-joined into a single space-separated string (no arrays) per size key.
  // For web payload optimization, keys are stored without the "s:" prefix (e.g. "s:md:1" -> "md:1", "s:all" -> "all").
  s?: Partial<Record<string, string>>;
  // t: compact typography-profile bucket -> space-separated atomic utility classes.
  // Text consumes this independently from component scale; no profile-specific CSS selector exists.
  t?: Partial<Record<string, string>>;
  // w: width-only scales, kept separate so components can opt into fixed-width behavior.
  // Keys follow the same "s:" stripping as `s`.
  w?: Partial<Record<string, string>>;
  // rr: rounded border radius scales (size-aware, opt-in at component level).
  rr?: Partial<Record<string, string>>;
  // rp: pill border radius scales (size-aware, opt-in at component level).
  rp?: Partial<Record<string, string>>;
  // rs: square border radius scales (size-aware, opt-in at component level).
  rs?: Partial<Record<string, string>>;
  // c: Surface-context bucket -> semantic key -> emphasis color classes.
  // s = onSubtle, v = onVivid. No legacy flat format.
  c?: Partial<Record<SurfaceContextBucket, Record<string, ColorClasses>>>;
  // l: control-state specific (selected) — flattened string of utility classes
  l?: string;
};

export type ComponentElementClassNameMapJSON = Record<string, ClassNameByElementJSON>;

export type ComponentVariantClassNameMapJSON = Record<string, ComponentElementClassNameMapJSON>;

export type ComponentVariantModeClassNameMapJSON = Record<string, ComponentVariantClassNameMapJSON>;

export type ComponentClassNameMapJSON = Partial<
  Record<
    string,
    | ComponentElementClassNameMapJSON
    | ComponentVariantClassNameMapJSON
    | ComponentVariantModeClassNameMapJSON
  >
>;

export type TextClassNameMapJSON = {
  e1: ClassNameByElementJSON & {
    t: Record<string, string>;
  };
};

export type GlobalClassNameMapJSON = {
  text?: TextClassNameMapJSON;
};

export type ComponentClassNameMapSplitJSON = {
  core: ComponentClassNameMapJSON;
  palettes: Record<string, ComponentClassNameMapJSON>;
};
