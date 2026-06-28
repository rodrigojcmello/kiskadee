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
 * Supported intent keys for the `card` component.
 */
export const CardIntentKeys = {
  /**
   * Default card surface presentation.
   */
  neutral: 'neutral',

  /**
   * Brand/primary card surface presentation.
   */
  primary: 'primary'
} as const;

/** Supported intent keys for the `card` component (Layer 3). */
export type CardIntent = keyof typeof CardIntentKeys;

/** Qualified role identifier for `card` intents (e.g. `card.neutral`). */
export type RoleCard = `card.${CardIntent}`;

/**
 * Supported intent keys for the `textField` component.
 */
export const TextFieldIntentKeys = {
  /**
   * Default form-field chrome and text.
   */
  neutral: 'neutral',

  /**
   * Invalid form values that block submission or need correction.
   */
  error: 'error',

  /**
   * Non-blocking validation attention, such as recommended corrections.
   */
  warning: 'warning'
} as const;

/** Supported intent keys for the `textField` component (Layer 3). */
export type TextFieldIntent = keyof typeof TextFieldIntentKeys;

/** Qualified role identifier for `textField` intents (e.g. `textField.error`). */
export type RoleTextField = `textField.${TextFieldIntent}`;

/**
 * Supported intent keys for the `switch` component.
 */
export const SwitchIntentKeys = {
  /**
   * Default switch presentation for the selected preset.
   */
  neutral: 'neutral',

  /**
   * Brand/primary activation presentation.
   */
  primary: 'primary',

  /**
   * Explicit negative/positive poles: off is negative, on is positive.
   */
  polarity: 'polarity'
} as const;

/** Supported intent keys for the `switch` component (Layer 3). */
export type SwitchIntent = keyof typeof SwitchIntentKeys;

/** Qualified role identifier for `switch` intents (e.g. `switch.primary`). */
export type RoleSwitch = `switch.${SwitchIntent}`;
