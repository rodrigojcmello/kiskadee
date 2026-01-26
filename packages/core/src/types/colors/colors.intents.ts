/**
 * Component intent keys.
 *
 * This file is the central registry for per-component intent unions.
 * As the number of components grows, keeping these intent definitions
 * in a dedicated module avoids bloating `colors.types.ts`.
 */

/**
 * Supported intent keys for the `button` component.
 */
export const ButtonIntentKeys = {
  /**
   * Primary actions: the main CTA for a view or flow.
   *
   * Examples: "Sign in", "Continue", "Save", "Buy".
   */
  primary: 'primary',

  /**
   * Neutral actions: secondary actions that should not compete with the primary CTA.
   *
   * Examples: "Cancel", "Back", "Later".
   */
  neutral: 'neutral',

  /**
   * Destructive actions: irreversible or risky actions that require user attention.
   *
   * Examples: "Delete", "Remove", "Discard changes".
   */
  destructive: 'destructive',

  /**
   * Positive actions: confirm/successful outcomes where a positive reinforcement color is desired.
   *
   * Examples: "Confirm", "Accept", "Done".
   */
  positive: 'positive'
} as const;

/** Supported intent keys for the `button` component (Layer 3). */
export type ButtonIntent = keyof typeof ButtonIntentKeys;

/** Qualified role identifier for `button` intents (e.g. `button.primary`). */
export type RoleButton = `button.${ButtonIntent}`;

/**
 * Supported emphasis variants for the `button` component.
 * Consumers use these to select subtle/vivid and subtle-derived variants.
 */
export const ButtonEmphasisKeys = {
  subtle: 'subtle',
  vivid: 'vivid',
  subtleOutline: 'subtle-outline',
  subtleFlat: 'subtle-flat'
} as const;

/** Supported emphasis values for the `button` component. */
export type ButtonEmphasis = (typeof ButtonEmphasisKeys)[keyof typeof ButtonEmphasisKeys];
