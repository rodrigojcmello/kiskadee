import type {
  EmphasisLevel,
  HueName,
  SchemaSegments,
  SemanticColor,
  ThemeMode,
  ThemeName
} from '@kiskadee/core';
import blackLight from './colors/black.light';
import blueLight from './colors/blue.light';

type Segment = 'default';

type CoreColorName = 'default' | 'alt_1' | 'alt_2' | 'alt_3';

type SocialColorName =
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

type PrimitiveColorName = CoreColorName | SocialColorName;

// Layer 1: Real color assets.
//
// IMPORTANT: We need separate scales for `light` and `dark` to keep `step` positions
// stable (e.g. `soft[3]` must stay `3` across modes). The `dark` scales are typically
// the inverted/adjusted counterparts of the `light` scales.
//
// NOTE: For now, we reuse the same scales for both modes as a placeholder, because
// we are focusing on data modeling (build may not pass yet, as agreed).
type Theme = ThemeName;

type EmphasisLevelByMode = Partial<Record<Theme, EmphasisLevel>>;

type PrimitiveColorAsset = {
  // `solid`/`gradient` here are about paint format (not tonal buckets).
  solid: EmphasisLevelByMode;
  // TEMP (refactor pre-phase 0): `gradient` support was intentionally removed for now.
  // In theory, primitives may support gradients, but we haven't validated the full pipeline yet.
  // Re-introduce later as:
  // gradient?: EmphasisLevelByMode;
};

type PrimitiveColors = Partial<
  Record<HueName, Partial<Record<PrimitiveColorName, PrimitiveColorAsset>>>
>;

// Layer 1: Primitive colors
export const primitiveColors: PrimitiveColors = {
  blue: {
    default: {
      solid: { light: blueLight }
    }
  },
  black: {
    default: {
      solid: { light: blackLight }
    }
  }
};

// Layer 2: Semantic colors (global meanings).
//
// Layer 2 is stable by default (no `light/dark`) and must not change meaning per
// component. However, for maximum flexibility, we support per-theme overrides.
//
// In practice, ~99% of design systems will mirror `light` and `dark` here: the same
// global semantic keys (e.g. `primary`, `neutral`) will point to the same primitive
// color assets.
//
// We still keep `Theme` support in Layer 2 for maximum flexibility in the remaining
// ~1% of cases. Example: in `light` you might map `neutral` to a black-based scale
// sitting on a very light gray surface; but in `dark` you may want to map `neutral`
// to a warm beige/rose primitive scale to increase contrast and improve readability.
// Having `light`/`dark` overrides in Layer 2 enables these fine-tuned adjustments.
//
// This enables rare cases where the same semantic key (e.g. `primary`) points to
// different real color families depending on the theme.
type PrimitiveColorRef = {
  hue: HueName;
  name: PrimitiveColorName;
};

// NOTE: Sandbox: this file may declare only a small subset of semantic keys,
// but the type is aligned with the full set so Layer 3 can reference any
// `SemanticColor` (e.g. `redLike`) without fighting the type system.
type GlobalSemanticKey = SemanticColor;

type GlobalSemanticPaintMap = {
  solid: PrimitiveColorRef;
  // TEMP (refactor pre-phase 0): `gradient` support was intentionally removed for now.
  // Re-introduce later as:
  // gradient?: PrimitiveColorRef;
};

type GlobalSemanticsByTheme = Record<
  Theme,
  Partial<Record<GlobalSemanticKey, GlobalSemanticPaintMap>>
>;

export const globalSemantics = {
  light: {
    primary: {
      solid: { hue: 'blue', name: 'default' }
      // TEMP (refactor pre-phase 0): gradients intentionally disabled for now.
      // gradient: { hue: 'blue', name: 'default' }
    },
    neutral: {
      solid: { hue: 'black', name: 'default' }
      // TEMP (refactor pre-phase 0): gradients intentionally disabled for now.
      // gradient: { hue: 'black', name: 'default' }
    }
  },
  dark: {
    primary: {
      solid: { hue: 'blue', name: 'default' }
      // TEMP (refactor pre-phase 0): gradients intentionally disabled for now.
      // gradient: { hue: 'blue', name: 'default' }
    },
    neutral: {
      solid: { hue: 'black', name: 'default' }
      // TEMP (refactor pre-phase 0): gradients intentionally disabled for now.
      // gradient: { hue: 'black', name: 'default' }
    }
  }
} as const satisfies GlobalSemanticsByTheme;

// Layer 3: Component intents (per-component meanings).
// Values can point to Layer 2 semantics or directly to Layer 1 real colors.
type IntentValue = GlobalSemanticKey | PrimitiveColorRef;

type ButtonIntent = 'primary' | 'neutral' | 'destructive' | 'positive';

type ComponentIntents = {
  button: Record<ButtonIntent, IntentValue>;
};

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'neutral',
    destructive: 'redLike',
    positive: 'greenLike'

    // Example of direct Layer 1 usage (e.g. social buttons):
    // socialLinkedIn: { hue: 'blue', name: 'linkedin' }
  }
} as const satisfies ComponentIntents;

export const segments: SchemaSegments<Segment> = {
  default: {
    name: 'Default',
    mainColor: 'blue',
    themes: {
      light: {
        primary: blueLight,
        neutral: blackLight
      }
    }
  }
};
