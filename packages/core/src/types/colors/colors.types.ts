import type { ButtonIntent, RoleButton, RoleTextField, TextFieldIntent } from './colors.intents.ts';

export type { ButtonIntent, RoleButton, RoleTextField, TextFieldIntent } from './colors.intents.ts';
export { ButtonIntentKeys, TextFieldIntentKeys } from './colors.intents.ts';

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
 * Resolved (final) gradient value.
 *
 * This is intentionally explicit (object-based) to keep call sites readable
 * and allow future extensions without tuple indexing.
 */
export type ResolvedGradient = {
  kind: 'linear';
  angle: GradientAngle;
  stops: Array<{
    color: SolidColor;
    position: GradientStopPosition;
  }>;
};

/** Represents a color, which can be either a solid color or a resolved gradient value. */
export type Color = SolidColor | ResolvedGradient;

/**
 * A color value that can be either:
 *  - a direct Color definition (applied in the element’s own state)
 *  - a ParentColor reference (applied only when the parent’s interaction state is inherited)
 */
export type ColorValue = Color | { ref?: Color | undefined };

/**
 * Interaction and component states that can be encoded in style keys.
 */
export type InteractionState =
  | 'rest'
  | 'hover'
  | 'pressed'
  | 'selected'
  | 'focus'
  | 'disabled'
  | 'readOnly'
  | 'filled';

export type NonSelectedInteractionState = Exclude<InteractionState, 'selected'>;
export type ProjectedStateKeys = Exclude<InteractionState, 'rest'>;

export const interactionStateKeys = [
  'rest',
  'hover',
  'pressed',
  'selected',
  'focus',
  'disabled',
  'readOnly',
  'filled'
] as const satisfies readonly InteractionState[];

export const nonSelectedInteractionStateKeys = [
  'rest',
  'hover',
  'pressed',
  'focus',
  'disabled',
  'readOnly',
  'filled'
] as const satisfies readonly NonSelectedInteractionState[];

export const projectedStateKeys = [
  'hover',
  'pressed',
  'selected',
  'focus',
  'disabled',
  'readOnly',
  'filled'
] as const satisfies readonly ProjectedStateKeys[];

export const InteractionStateCssPseudoSelector: Record<InteractionState, string> = {
  rest: '',
  hover: ':hover',
  pressed: ':active',
  selected: '',
  focus: ':focus-visible',
  disabled: '',
  readOnly: ':read-only',
  filled: ''
};

export type PseudoSelectorKeys = keyof typeof InteractionStateCssPseudoSelector;

export const projectedStateActivator = {
  hover: '-h',
  pressed: '-p',
  selected: '-s',
  focus: '-f',
  disabled: '-d',
  readOnly: '-r',
  filled: '-v'
} as const satisfies Record<ProjectedStateKeys, string>;

export const stateActivatorMeta = {
  shadow: '-e',
  activator: '-a',
  interactive: '-i'
} as const;

export type StateActivatorMetaKeys = keyof typeof stateActivatorMeta;

export const stateActivator = {
  ...projectedStateActivator,
  ...stateActivatorMeta
} as const satisfies Record<ProjectedStateKeys | StateActivatorMetaKeys, string>;

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
  filled?: ColorValue;
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

export type SemanticVariant = 'v1' | 'v2';

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
 * - Layer 1 (primitive) directly via `PrimitiveRole`.
 */
export type IntentValue = SemanticColor | PrimitiveRole;

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
export type Role = RoleButton | RoleTextField | `${string}.${string}`;

/**
 * Qualified role identifier used by the new `color()` API.
 *
 * Supports an optional paint suffix:
 * - `component.intent` (defaults to `solid`)
 * - `component.intent.solid`
 * - `component.intent.gradient`
 */
export type RoleWithPaint =
  | RoleButton
  | RoleTextField
  | `${string}.${string}`
  | `${string}.${string}.solid`
  | `${string}.${string}.gradient`;

/**
 * Qualified primitive identifier used by the new `color()` API.
 *
 * Example: `primitive.blue.v1`.
 */
export type PrimitiveRole = `primitive.${HueName}.${PrimitiveColorName}`;

/** Layer 1 (primitive) gradient stop template (references another primitive slot). */
export type GradientStopTemplate = {
  primitive: PrimitiveRole;
  position: GradientStopPosition;
};

/** Layer 1 (primitive) gradient template. */
export type GradientTemplate = {
  angle: GradientAngle;
  stops: GradientStopTemplate[];
};

export type PrimitiveColorAsset = {
  solid: Partial<Record<ThemeName, EmphasisLevel>>;

  /**
   * Optional gradient template for this primitive slot.
   *
   * Notes:
   * - This is a template (angle + stop references), not a precomputed 0–100 scale.
   * - The final gradient is generated by `color()` based on the requested `tone`.
   */
  gradient?: GradientTemplate;
};

export type PrimitiveColors = Partial<
  Record<HueName, Partial<Record<PrimitiveColorName, PrimitiveColorAsset>>>
>;

export type SemanticVariantMap = {
  v1: PrimitiveRole;
  v2?: PrimitiveRole;
};

export type GlobalSemanticsByTheme = Record<
  ThemeName,
  Partial<Record<SemanticColor, PrimitiveRole | SemanticVariantMap>>
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
 * - a global semantic key (Layer 2) or
 * - a direct primitive reference (Layer 1).
 */
export type ComponentIntents = {
  /**
   * Button intents.
   *
   * All intents are optional so presets can override selectively.
   */
  button?: Partial<Record<ButtonIntent, IntentValue>>;
  textField?: Partial<Record<TextFieldIntent, IntentValue>>;
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

export const componentEmphasisBuckets = {
  high: 'h',
  medium: 'm',
  low: 'l',
  lowest: 'll'
} as const;

export type ComponentEmphasis = keyof typeof componentEmphasisBuckets;

export type SemanticColorMap = Partial<
  Record<SemanticColor, Partial<Record<ComponentEmphasis, InteractionStateColorMap>>>
>;

export const CssColorProperty = {
  textColor: 'color',
  boxColor: 'background-color',
  borderColor: 'border-color'
} as const;

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
