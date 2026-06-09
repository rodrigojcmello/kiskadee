import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackMotionDurationToken,
  ActivationFeedbackProfileConfig,
  ActivationFeedbackProfileMode,
  ResolvedActivationFeedbackConfig
} from './activation-feedback.types.ts';

export const ACTIVATION_FEEDBACK_DURATION_TOKEN_TO_MS: Readonly<
  Record<ActivationFeedbackMotionDurationToken, number>
> = {
  'interaction.instant': 0,
  'interaction.fast': 360,
  'interaction.slow': 468,
  'interaction.hold.short': 50,
  'interaction.fade.short': 100,
  'interaction.fade.long': 360
};

export const DEFAULT_ACTIVATION_FEEDBACK: Readonly<ResolvedActivationFeedbackConfig> = {
  thickness: 3,
  holdDurationToken: 'interaction.hold.short',
  fadeDurationToken: 'interaction.fade.long',
  curveToken: 'motion.standard.out'
};

export const DEFAULT_ACTIVATION_FEEDBACK_PROFILES: Readonly<
  Record<ActivationFeedbackProfileMode, ActivationFeedbackProfileConfig>
> = {
  surface: {
    animateSize: true,
    size: 'auto',
    durationToken: 'interaction.slow',
    curveToken: 'motion.emphasized.out',
    fade: {
      delayToken: 'interaction.hold.short',
      durationToken: 'interaction.fade.short',
      curveToken: 'motion.standard.out'
    }
  },
  overflow: {
    // Generic fallback for larger hosts; compact controls should override in their preset.
    animateSize: true,
    size: 200,
    durationToken: 'interaction.fast',
    curveToken: 'motion.standard.out',
    fade: {
      delayToken: 'interaction.hold.short',
      durationToken: 'interaction.fade.short',
      curveToken: 'motion.standard.out'
    }
  },
  'overflow-static': {
    // Generic fallback for larger hosts; compact controls should override in their preset.
    animateSize: false,
    size: 200,
    durationToken: 'interaction.instant',
    fade: {
      delayToken: 'interaction.hold.short',
      durationToken: 'interaction.fade.long',
      curveToken: 'motion.standard.out'
    }
  }
};

export const DEFAULT_PRESSED_ACTIVATION_FEEDBACK_PROFILE: Readonly<ActivationFeedbackProfileConfig> =
  {
    animateSize: false,
    size: 'auto',
    // Pressed overlays are instant by default so controlled pressed state does not linger.
    // Presets can override this to keep short tap feedback visible.
    durationToken: 'interaction.instant',
    curveToken: 'motion.standard.out',
    fade: {
      delayToken: 'interaction.hold.short',
      durationToken: 'interaction.fade.short',
      curveToken: 'motion.standard.out'
    }
  };
