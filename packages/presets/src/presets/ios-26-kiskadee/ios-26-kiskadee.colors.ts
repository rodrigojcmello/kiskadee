import type { SchemaSegments, ThemeColorPalette, ThemeMode } from '@kiskadee/core';
import { createSegmentFactory } from '../../utils/segmentFactory';
import dynamicColor from '../dynamic.color';
import neutralLight from './colors/neutral.light';
import primaryLight from './colors/primary.light';
import redLikeLight from './colors/red-like.light';

// Kiskadee iOS 26: starts as a copy of Apple iOS 26; can evolve with Kiskadee opinions later

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
