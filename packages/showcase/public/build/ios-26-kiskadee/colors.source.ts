import type {
  ComponentIntents,
  GlobalSemanticsByTheme,
  PrimitiveColorRef,
  PrimitiveColors,
  SchemaSegments,
  ThemeColorPalette,
  ThemeMode
} from '@kiskadee/core';
import { createSegmentFactory } from '../../utils/segmentFactory';
import dynamicColor from '../dynamic.color';
import neutralLight from './colors/neutral.light';
import primaryLight from './colors/primary.light';
import redLikeLight from './colors/red-like.light';

// Kiskadee iOS 26: starts as a copy of Apple iOS 26; can evolve with Kiskadee opinions later

// -------------------------------------------------------------------------------------------------
// Segments
// -------------------------------------------------------------------------------------------------

/**
 * Segments definition for the iOS 26 design system.
 * Each segment represents a brand/product identity with support for multiple theme modes.
 *
 * Current implementation includes:
 * - ios: Primary segment with light theme (blue brand color HSL 206°)
 *
 * All segments include universal semantic colors:
 * - primary: Brand identity color (varies by segment)
 * - secondary: Supporting brand color
 * - greenLike: Success, purchase, confirmation, profit (always green ~140°)
 * - yellowLike: Attention, warning, caution (always yellow ~45°)
 * - redLike: Danger, error, urgent, notification (always red ~0°)
 * - neutral: Text, backgrounds, borders, dividers (always grayscale)
 */

// Define the base theme shared across segments
const baseThemes: Partial<Record<ThemeMode, ThemeColorPalette>> = {
  light: {
    neutral: neutralLight,
    redLike: redLikeLight
  },
  dark: {
    redLike: redLikeLight
  }
};

// Create the factory with the base theme
const createSegment = createSegmentFactory(baseThemes);

export const segments: SchemaSegments = {
  default: createSegment('Default', 'blue', {
    light: {
      primary: primaryLight
    }
  }),
  dynamic: createSegment('Dynamic', 'blue', {
    light: {
      primary: dynamicColor
    }
  })
};

// -------------------------------------------------------------------------------------------------
// 3-layer color architecture (Primitive → Global semantics → Component intents)
// -------------------------------------------------------------------------------------------------

/**
 * Layer 1: primitive color assets.
 *
 * NOTE: For now, we reuse light scales for `d` as a placeholder.
 */
export const primitiveColors = {
  blue: {
    v1: { solid: { light: primaryLight, dark: primaryLight } },
    // `dynamic` segment override uses `dynamic`.
    dynamic: { solid: { light: dynamicColor, dark: dynamicColor } }
  },
  black: {
    v1: { solid: { light: neutralLight, dark: neutralLight } }
  },
  red: {
    v1: { solid: { light: redLikeLight, dark: redLikeLight } }
  }
} as const satisfies PrimitiveColors;

type GlobalSemanticKey = 'primary' | 'neutral' | 'redLike';

export const globalSemantics = {
  light: {
    primary: { solid: { hue: 'blue', name: 'v1' } },
    neutral: { solid: { hue: 'black', name: 'v1' } },
    redLike: { solid: { hue: 'red', name: 'v1' } }
  },
  dark: {
    primary: { solid: { hue: 'blue', name: 'v1' } },
    neutral: { solid: { hue: 'black', name: 'v1' } },
    redLike: { solid: { hue: 'red', name: 'v1' } }
  }
} as const satisfies GlobalSemanticsByTheme;

// -------------------------------------------------------------------------------------------------
// Color Layer 2 (optional) - Global semantics overrides by segment
// -------------------------------------------------------------------------------------------------

/**
 * Optional per-segment overrides for global semantics.
 *
 * Here we override `primary` for the `dynamic` segment to use a different primitive.
 */
export const globalSemanticsBySegment = {
  dynamic: {
    light: {
      primary: { solid: { hue: 'blue', name: 'dynamic' } }
    },
    dark: {
      primary: { solid: { hue: 'blue', name: 'dynamic' } }
    }
  }
} as const satisfies Partial<Record<string, GlobalSemanticsByTheme>>;

export const componentIntents = {
  button: {
    primary: 'primary',
    neutral: 'neutral',
    destructive: 'redLike',
    positive: 'primary'
  }
} as const satisfies ComponentIntents;

// Type-level sanity: make sure our per-segment override points to a valid primitive ref.
const _dynamicPrimaryRef: PrimitiveColorRef = globalSemanticsBySegment.dynamic.light.primary.solid;
void _dynamicPrimaryRef;
