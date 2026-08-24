/**
 * Component intent keys.
 *
 * This file is the central registry for per-component intent unions.
 * As the number of components grows, keeping these intent definitions
 * in a dedicated module avoids bloating `colors.types.ts`.
 */

/**
 * System-owned intent keys for the `button` component.
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

/**
 * Preset-authored intent keys for the `button` component (Layer 3).
 *
 * External intents are deliberately excluded from preset color schemas. They
 * are projected into optional artifacts by their owning domain instead.
 */
export type SystemButtonIntent = keyof typeof ButtonIntentKeys;

/** External Button intent namespace distributed outside preset color layers. */
export type ExternalButtonIntent = `brand.${string}`;

/** Public Button intents accepted by component consumers. */
export type ButtonIntent = SystemButtonIntent | ExternalButtonIntent;

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
 * Supported intent keys for the passive `badge` component.
 */
export const BadgeIntentKeys = {
  neutral: 'neutral',
  primary: 'primary',
  informative: 'informative',
  positive: 'positive',
  warning: 'warning',
  severe: 'severe',
  destructive: 'destructive',
  important: 'important'
} as const;

export type BadgeIntent = keyof typeof BadgeIntentKeys;
export type RoleBadge = `badge.${BadgeIntent}`;

/**
 * Supported intent keys for the entity/filter `chip` component.
 */
export const ChipIntentKeys = {
  neutral: 'neutral',
  primary: 'primary'
} as const;

export type ChipIntent = keyof typeof ChipIntentKeys;
export type RoleChip = `chip.${ChipIntent}`;

/**
 * Supported intent keys for the `icon` component.
 */
export const IconIntentKeys = {
  /** Default foreground treatment. */
  neutral: 'neutral',

  /** Brand/primary foreground treatment. */
  primary: 'primary'
} as const;

/** Supported intent keys for the `icon` component (Layer 3). */
export type IconIntent = keyof typeof IconIntentKeys;

/** Qualified role identifier for `icon` intents (e.g. `icon.primary`). */
export type RoleIcon = `icon.${IconIntent}`;

/**
 * Supported intent keys for the `dropdown` component.
 *
 * Dropdown items are neutral by default. Destructive is the only semantic
 * variation in the first contract; selection remains an interaction state.
 */
export const DropdownIntentKeys = {
  neutral: 'neutral',
  destructive: 'destructive'
} as const;

/** Supported intent keys for the `dropdown` component (Layer 3). */
export type DropdownIntent = keyof typeof DropdownIntentKeys;

/** Qualified role identifier for `dropdown` intents. */
export type RoleDropdown = `dropdown.${DropdownIntent}`;

/**
 * Supported intent keys for the `bottomSheet` component.
 *
 * BottomSheet is an independent modal surface. Its menu items preserve the
 * neutral and destructive semantic range without depending on Dropdown roles.
 */
export const BottomSheetIntentKeys = {
  neutral: 'neutral',
  destructive: 'destructive'
} as const;

/** Supported intent keys for the `bottomSheet` component (Layer 3). */
export type BottomSheetIntent = keyof typeof BottomSheetIntentKeys;

/** Qualified role identifier for `bottomSheet` intents. */
export type RoleBottomSheet = `bottomSheet.${BottomSheetIntent}`;

/**
 * Supported intent keys for the `progress` component.
 */
export const ProgressIntentKeys = {
  /** Default progress treatment. */
  neutral: 'neutral',

  /** Brand/primary progress treatment. */
  primary: 'primary',

  /** Positive/successful progress treatment. */
  positive: 'positive',

  /** Warning or attention progress treatment. */
  warning: 'warning',

  /** Destructive or critical progress treatment. */
  destructive: 'destructive'
} as const;

/** Supported intent keys for the `progress` component (Layer 3). */
export type ProgressIntent = keyof typeof ProgressIntentKeys;

/** Qualified role identifier for `progress` intents (e.g. `progress.primary`). */
export type RoleProgress = `progress.${ProgressIntent}`;

/**
 * Supported intent keys for the `slider` component.
 */
export const SliderIntentKeys = {
  /**
   * Default slider presentation for the selected preset.
   */
  neutral: 'neutral',

  /**
   * Brand/primary value selection presentation.
   */
  primary: 'primary'
} as const;

/** Supported intent keys for the `slider` component (Layer 3). */
export type SliderIntent = keyof typeof SliderIntentKeys;

/** Qualified role identifier for `slider` intents (e.g. `slider.primary`). */
export type RoleSlider = `slider.${SliderIntent}`;

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
