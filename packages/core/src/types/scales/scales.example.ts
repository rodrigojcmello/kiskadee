import type { ScaleSchema } from './scales.types.ts';

const scale: ScaleSchema = {
  textSize: {
    // The first-level keys (sm, md, lg) represent different component size variants.
    // For example, a button can be small (sm), medium (md), or large (lg).

    // For the "sm" variant:
    // A fixed value is used, meaning the font size is 12px regardless of screen conditions.
    's:sm:1': 12,

    // For the "md" variant:
    // • The "all" property sets the default font size (following a mobile-first approach).
    // • Specific media query overrides can be defined, such as "lg1", which adjusts the size when that breakpoint is active.
    's:md:1': {
      'bp:all': 16, // The default font size for medium components was set to 16px.
      'bp:lg:1': 14 // When the lg1 media query condition applies, the font size is adjusted to 14px.
    },

    // For the "lg" variant:
    // • The "all" key provides a base font size for large components.
    // • Additional keys like "lg2" allow for responsive adjustments when a particular media query (here, lg2) becomes active.
    's:lg:1': {
      'bp:all': 20, // The default (mobile-first) font size for large components is 20px.
      'bp:lg:2': 24 // Under the lg2 media query condition, the font size increases to 24px.
    }
  },

  // For properties defined directly as a number (without responsive overrides):
  // They apply uniformly across all screen sizes.
  paddingTop: 10 // This means the top padding will always be 10px.
};

console.log({ scale });
