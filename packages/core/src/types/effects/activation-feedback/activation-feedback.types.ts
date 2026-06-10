import type { ComponentEmphasis } from '../../colors/colors.types.ts';
import type { SolidColor } from '../../colors/colors.types.ts';

export type ActivationFeedbackMotionDurationToken =
  | 'interaction.instant'
  | 'interaction.fast'
  | 'interaction.slow'
  | 'interaction.hold.short'
  | 'interaction.fade.short'
  | 'interaction.fade.long';

export type ActivationFeedbackMotionCurveToken = 'motion.standard.out' | 'motion.emphasized.out';

export type ActivationFeedbackProfile = 'ripple' | 'ripple-overflow' | 'halo' | 'pressed';

export type ActivationFeedbackProfileMode = Exclude<ActivationFeedbackProfile, 'pressed'>;

export type ActivationFeedbackOrigin = 'center' | 'pointer';

export type ActivationFeedbackPressedVisual = 'state' | 'overlay';

export type ActivationFeedbackTone = 'subtle' | 'vivid';

export type ActivationFeedbackToneMap = {
  default?: ActivationFeedbackTone;
  byEmphasis?: Partial<Record<ComponentEmphasis, ActivationFeedbackTone>>;
};

export type ActivationFeedbackVisual = {
  layer?: 'overlay' | 'underlay';
  paint?: 'halo' | 'outline';
  tone?: ActivationFeedbackToneMap;
};

export type ActivationFeedbackProfileConfig = {
  animateSize?: boolean;
  size?: number | 'auto';
  durationToken?: ActivationFeedbackMotionDurationToken;
  curveToken?: ActivationFeedbackMotionCurveToken;
  fade?: {
    delayToken?: ActivationFeedbackMotionDurationToken;
    durationToken?: ActivationFeedbackMotionDurationToken;
    curveToken?: ActivationFeedbackMotionCurveToken;
  };
  /** @deprecated Use visual.paint="outline" plus size on the active profile. */
  border?: {
    width?: number;
    surfaceTone?: ActivationFeedbackTone;
  };
};

export type ActivationFeedbackEffectSchema = {
  thickness?: number;
  holdDurationToken?: ActivationFeedbackMotionDurationToken;
  fadeDurationToken?: ActivationFeedbackMotionDurationToken;
  curveToken?: ActivationFeedbackMotionCurveToken;
  profile?: ActivationFeedbackProfileMode;
  origin?: ActivationFeedbackOrigin;
  visual?: ActivationFeedbackVisual;
  /** @deprecated Use visual.layer="overlay" for overlay feedback. */
  pressedVisual?: ActivationFeedbackPressedVisual;
  profiles?: {
    ripple?: ActivationFeedbackProfileConfig;
    rippleOverflow?: ActivationFeedbackProfileConfig;
    halo?: ActivationFeedbackProfileConfig;
    pressed?: ActivationFeedbackProfileConfig;
  };
};

export type ActivationFeedbackSetting = boolean | ActivationFeedbackEffectSchema;

export type ResolvedActivationFeedbackConfig = Required<
  Pick<
    ActivationFeedbackEffectSchema,
    'thickness' | 'holdDurationToken' | 'fadeDurationToken' | 'curveToken'
  >
>;

export type ActivationFeedbackSurfaceToneTokens = {
  color?: SolidColor;
  opacity?: number;
};

export type ActivationFeedbackToneTokens = ActivationFeedbackSurfaceToneTokens;

export type ActivationFeedbackThemeTokens = {
  /**
   * Legacy single-tone feedback tokens. New presets should prefer tone.subtle.
   */
  color?: SolidColor;
  /**
   * Legacy single-tone feedback tokens. New presets should prefer tone.subtle.
   */
  opacity?: number;
  tone?: Partial<Record<ActivationFeedbackTone, ActivationFeedbackToneTokens>>;
  /** @deprecated Use tone. */
  surfaceTone?: Partial<Record<ActivationFeedbackTone, ActivationFeedbackToneTokens>>;
};

/** @deprecated Use ActivationFeedbackTone. */
export type ActivationFeedbackSurfaceTone = ActivationFeedbackTone;
