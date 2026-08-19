import type { ComponentEmphasis, SolidColor } from '../../colors/colors.types.ts';

export type ActivationFeedbackMotionDurationToken =
  | 'interaction.instant'
  | 'interaction.fast'
  | 'interaction.slow'
  | 'interaction.hold.short'
  | 'interaction.fade.short'
  | 'interaction.fade.long';

export type ActivationFeedbackMotionCurveToken = 'motion.standard.out' | 'motion.emphasized.out';

export type ActivationFeedbackProfile = 'ripple' | 'ripple-overflow' | 'halo';

export type ActivationFeedbackProfileMode = ActivationFeedbackProfile;

export type ActivationFeedbackProfileKey = ActivationFeedbackProfile | 'pressed';

export type ActivationFeedbackProfileBucket = 'afs' | 'afo' | 'afx' | 'afp';

export type ActivationFeedbackProfileRuntime = 'radial' | 'static';

export type ActivationFeedbackProfileOverflow = 'clipped' | 'visible';

export type ActivationFeedbackProfileShape = 'radial' | 'halo';

export type ActivationFeedbackProfileDefinition = {
  bucket: ActivationFeedbackProfileBucket;
  overflow: ActivationFeedbackProfileOverflow;
  runtime: ActivationFeedbackProfileRuntime;
  shape: ActivationFeedbackProfileShape;
};

export type ActivationFeedbackOrigin = 'center' | 'pointer';

export type ActivationFeedbackTone = 'subtle' | 'vivid';

export type ActivationFeedbackToneMap = {
  default?: ActivationFeedbackTone;
  byEmphasis?: Partial<Record<ComponentEmphasis, ActivationFeedbackTone>>;
};

export type ActivationFeedbackVisual = {
  layer?: 'overlay' | 'underlay';
  paint?: 'field' | 'outline';
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
};

export type ActivationFeedbackEffectSchema = {
  profile?: ActivationFeedbackProfileMode;
  origin?: ActivationFeedbackOrigin;
  visual?: ActivationFeedbackVisual;
  profiles?: {
    ripple?: ActivationFeedbackProfileConfig;
    rippleOverflow?: ActivationFeedbackProfileConfig;
    halo?: ActivationFeedbackProfileConfig;
    pressed?: ActivationFeedbackProfileConfig;
  };
};

export type ActivationFeedbackSetting = boolean | ActivationFeedbackEffectSchema;

export type ActivationFeedbackToneTokens = {
  color?: SolidColor;
  opacity?: number;
};

export type ActivationFeedbackThemeTokens = {
  tone?: Partial<Record<ActivationFeedbackTone, ActivationFeedbackToneTokens>>;
};
