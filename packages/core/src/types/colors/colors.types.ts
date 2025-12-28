import type { ButtonIntent, RoleButton } from './colors.intents';

export type { ButtonIntent, RoleButton } from './colors.intents';
export { ButtonIntentKeys } from './colors.intents';

// Unique identifier for each segment (brand/product identity) within a design system.
// Defined here to avoid circular type dependencies between schema and color types.
export type SegmentName = string;

/** Represents a hue value in degrees ranging from 0 to 360. */
type Hue = number;

/** Represents a lightness percentage ranging from 0 to 100. */
type Lightness = number;

/** Represents a saturation percentage ranging from 0 to 100. */
type Saturation = number;

/** Represents an alpha value (opacity) ranging from 0 to 1 (e.g., 0.02). */
type Alpha = number;

/** Represents a color in HSLA format: [hue, saturation, lightness, alpha]. */
export type HSLA = readonly [hue: Hue, saturation: Saturation, lightness: Lightness, alpha: Alpha];

/** Represents a color in hexadecimal format (e.g., "#ff0000" or "#ff0000ff"). */
export type Hex = string;

/** Represents a CSS variable string (e.g., "var(--my-color)"). */
export type CssVariable = string;

/** Represents a single solid color in HSLA format or a CSS variable string. */
export type SolidColor = HSLA | CssVariable;

/** Represents the position of a color stop in a CSS gradient as a percentage (0–100). */
type GradientStopPosition = number;

/** Represents a gradient angle in degrees (0–360). */
type GradientAngle = number;

/**
 * Represents a gradient defined by an angle and a series of color stops.
 * Each stop is a tuple of [hue, lightness, saturation, alpha, position].
 */
type Gradient = [GradientAngle, [...HSLA, GradientStopPosition][]];

/** Represents a color, which can be either a solid color or a gradient definition. */
export type Color = SolidColor | Gradient;

/**
 * A color value that can be either:
 *  - a direct Color definition (applied in the element’s own state)
 *  - a ParentColor reference (applied only when the parent’s interaction state is inherited)
 */
export type ColorValue = Color | { ref?: Color | undefined };

/**
 * Interaction states.
 */
export type InteractionState =
  | 'rest'
  | 'hover'
  | 'pressed'
  | 'selected'
  | 'focus'
  | 'disabled'
  | 'readOnly';

export const InteractionStateCssPseudoSelector: Record<InteractionState, string> = {
  rest: '',
  hover: ':hover',
  pressed: ':active',
  selected: '',
  focus: ':focus-visible',
  disabled: '',
  readOnly: ':read-only'
};

export type PseudoSelectorKeys = keyof typeof InteractionStateCssPseudoSelector;

export const stateActivator = {
  hover: '-h',
  pressed: '-p',
  selected: '-s',
  focus: '-f',
  disabled: '-d',
  readOnly: '-r',
  shadow: '-e',
  activator: '-a',
  interactive: '-i'
};

export type StateActivatorKeys = keyof typeof stateActivator;

export type SelectedInteractionState = keyof SelectedInteractionSubMap;
export type SelectedInteractionStateToken = `selected:${SelectedInteractionState}`;

export type SelectedInteractionSubMap = {
  rest?: ColorValue;
  hover?: ColorValue;
  pressed?: ColorValue;
  focus?: ColorValue;
};

export type InteractionStateColorMap = {
  rest?: Color;
  hover?: ColorValue;
  pressed?: ColorValue;
  focus?: ColorValue;
  selected?: SelectedInteractionSubMap;
  disabled?: ColorValue;
  readOnly?: ColorValue;
};

/**
 * Base hues supported by Kiskadee in the first layer (real colors).
 *
 * These represent generic color families without semantic meaning.
 * They can be used as the source hues for segments (mainColor) and
 * as building blocks for higher semantic layers (e.g., redLike).
 */
export type HueName =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'black';

export type SemanticColor =
  | 'primary'
  | 'secondary'
  | 'redLike'
  | 'yellowLike'
  | 'greenLike'
  | 'neutral';

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

/**
 * Theme shortcuts used across schema definitions to keep call sites visually compact.
 *
 * Note: These are shortcuts for theme *names* (light/dark), not “modes”.
 */
export type ThemeShortcut = 'l' | 'd';

/** Theme names used in configuration/data structures (explicit, human-readable). */
export type ThemeName = 'light' | 'dark';

/**
 * Layer 1 (Primitive) color names.
 *
 * These keys are used to identify a specific primitive color asset within a hue family.
 *
 * NOTE: For now this is a global union shared across design systems.
 * If a future preset needs extra primitive names, we can extend this union later.
 */
/**
 * Core (non-social) primitive slots.
 *
 * These are ordinal slots within a hue family and are intentionally versioned
 * as `v1..v4` to match file naming like `purple-2.*` -> `v2`.
 */
export type CorePrimitiveColorName = 'v1' | 'v2' | 'v3' | 'v4' | 'dynamic';

export type SocialPrimitiveColorName =
  | 'linkedin'
  | 'microsoft'
  | 'google'
  | 'twitter'
  | 'telegram'
  | 'facebook'
  | 'instagram'
  | 'github'
  | 'gitlab'
  | 'whatsapp'
  | 'youtube'
  | 'tiktok'
  | 'discord'
  | 'slack'
  | 'reddit';

/**
 * Layer 1 (Primitive) color names.
 *
 * These keys are used to identify a specific primitive color asset within a hue family.
 */
export type PrimitiveColorName = CorePrimitiveColorName | SocialPrimitiveColorName;

/** Layer 1 reference: points to a primitive asset by `hue` and `name`. */
export type PrimitiveColorRef = {
  hue: HueName;
  name: PrimitiveColorName;
};

/**
 * Intent values can reference either:
 * - Layer 2 (global semantics) via `SemanticColor`, or
 * - Layer 1 (primitive) directly via `PrimitiveColorRef`.
 */
export type IntentValue = SemanticColor | PrimitiveColorRef;

/**
 * Qualified role identifier used by the new `color()` API.
 *
 * Example: `button.primary`.
 */

/**
 * Qualified role identifier used by the new `color()` API.
 *
 * NOTE: This is intentionally extensible. Each component can introduce its own
 * typed role union later (e.g. `RoleBadge`) and be merged into `Role`.
 */
export type Role = RoleButton | `${string}.${string}`;

/**
 * Qualified primitive identifier used by the new `color()` API.
 *
 * Example: `primitive.blue.v1`.
 */
export type PrimitiveRole = `primitive.${HueName}.${PrimitiveColorName}`;

export type PrimitiveColorAsset = {
  solid: Partial<Record<ThemeName, EmphasisLevel>>;

  // TEMP: gradient support intentionally disabled for now.
  // Re-introduce later as:
  // gradient?: Partial<Record<ThemeName, EmphasisLevel>>;
};

export type PrimitiveColors = Partial<
  Record<HueName, Partial<Record<PrimitiveColorName, PrimitiveColorAsset>>>
>;

export type GlobalSemanticPaintMap = {
  solid: PrimitiveColorRef;

  // TEMP: gradient support intentionally disabled for now.
  // Re-introduce later as:
  // gradient?: PrimitiveColorRef;
};

export type GlobalSemanticsByTheme = Record<
  ThemeName,
  Partial<Record<SemanticColor, GlobalSemanticPaintMap>>
>;

/** Segment metadata used by tooling (build/showcase), not by the color resolver. */
export type SegmentMeta = {
  name: string;
};

/**
 * Segment-scoped Layer 2 overrides.
 *
 * `themes` is optional because most segments will share the global baseline.
 */
export type GlobalSemanticsBySegmentEntry = {
  meta: SegmentMeta;
  themes?: GlobalSemanticsByTheme;
};

export type GlobalSemanticsBySegment = Partial<Record<SegmentName, GlobalSemanticsBySegmentEntry>>;

/**
 * Layer 3 (Component intents).
 *
 * Each component maps its supported intent keys to either:
 * - a global semantic key (Layer 2), or
 * - a direct primitive reference (Layer 1).
 */
export type ComponentIntents = {
  button?: Record<ButtonIntent, IntentValue>;
} & Partial<Record<string, Record<string, IntentValue>>>;

export type SchemaColors = Partial<{
  primitiveColors: PrimitiveColors;
  globalSemantics: GlobalSemanticsByTheme;
  /**
   * Segment registry + optional per-segment overrides for Layer 2.
   *
   * This allows segments (brands/products) to:
   * - be discoverable by tooling (via `meta.name`), and
   * - override primitive mappings for the same global semantic key (e.g. `primary`) without
   *   changing component intents.
   *
   * NOTE: Segment overrides live under `themes`.
   */
  globalSemanticsBySegment: GlobalSemanticsBySegment;
  componentIntents: ComponentIntents;
}>;

export type Emphasis = keyof EmphasisLevel;

export type SemanticColorMap = Partial<
  Record<SemanticColor, Partial<Record<Emphasis, InteractionStateColorMap>>>
>;

export enum CssColorProperty {
  textColor = 'color',
  boxColor = 'background-color',
  borderColor = 'border-color'
}

export type ColorProperty = keyof typeof CssColorProperty;

type Prohibit<K extends PropertyKey> = { [P in K]?: never };

type ColorEntry =
  | (InteractionStateColorMap & Prohibit<keyof SemanticColorMap>)
  | (SemanticColorMap & Prohibit<keyof InteractionStateColorMap>);

export type ColorSchema = Partial<Record<ColorProperty, ColorEntry>>;

// -------------------------------------------------------------------------------------------------
// Token scale types
// -------------------------------------------------------------------------------------------------

export type ColorScale = Partial<Record<LightTrackTones | DarkTrackTones, SolidColor>>;

// Soft track tones: 0–15 (step 1), then 20, 25, 30
export type LightTrackTones =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 20
  | 25
  | 30;

// Dark track tones: 35–100 (step 5)
export type DarkTrackTones = 35 | 40 | 45 | 50 | 55 | 60 | 65 | 70 | 75 | 80 | 85 | 90 | 95 | 100;

export type ColorScaleLight = Partial<Record<LightTrackTones, SolidColor>>;
export type ColorScaleDark = Partial<Record<DarkTrackTones, SolidColor>>;

export type VariantColorScale = {
  light: ColorScaleLight;
  dark: ColorScaleDark;
};

export type ThemeMode = 'light' | 'dark' | 'darker';

export type EmphasisLevel = {
  subtle: ColorScaleLight;
  vivid: ColorScaleDark;
};

export type ColorPalette = Partial<Record<SemanticColor, EmphasisLevel>>;
export type ThemeColorPalette = ColorPalette;

export type ElementPalettes<TSegmentName extends SegmentName = never> = Partial<
  Record<TSegmentName | 'default' | 'dynamic', Partial<Record<ThemeMode, ColorSchema>>>
>;
