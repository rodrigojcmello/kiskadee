// [RIPPLE EFFECT 5] START: Ripple schema/type model.
export type RippleOrigin = 'center' | 'pointer';
export type RippleMode = 'surface' | 'overflow' | 'overflow-static';
export type RippleInputFeedback = 'pressed' | 'ripple';
export type RipplePressedVisual = 'state' | 'overlay';
export type RippleMotionDurationToken =
  | 'interaction.instant'
  | 'interaction.fast'
  | 'interaction.slow'
  | 'interaction.hold.short'
  | 'interaction.fade.short'
  | 'interaction.fade.long';
export type RippleMotionCurveToken = 'motion.standard.out' | 'motion.emphasized.out';

// Global ripple configuration (element opt-in handled separately).
// Note: origin is ignored when mode is overflow (always pointer-based).
export type RippleEffectSchema = {
  mode?: RippleMode;
  origin?: RippleOrigin;
  inputFeedback?: {
    mouse?: RippleInputFeedback;
    keyboard?: RippleInputFeedback;
  };
  pressedVisual?: RipplePressedVisual;
  overlayAlphaByEmphasis?: {
    high?: number;
    medium?: number;
    low?: number;
    lowest?: number;
  };
  profiles?: {
    surface?: RippleProfile;
    overflow?: RippleProfile;
    overflowStatic?: RippleProfile;
    pressed?: RippleProfile;
  };
};

export type RippleProfile = {
  // Overflow/clipping behavior is fixed by mode:
  // - surface => hidden + clipped by radius
  // - overflow/overflow-static => visible + no clipping
  animateSize?: boolean;
  size?: number | 'auto';
  durationToken?: RippleMotionDurationToken;
  curveToken?: RippleMotionCurveToken;
  fade?: {
    delayToken?: RippleMotionDurationToken;
    durationToken?: RippleMotionDurationToken;
    curveToken?: RippleMotionCurveToken;
  };
  fillToken?: 'surface' | 'overflow' | 'overflowStatic';
  border?: {
    width?: number;
    colorToken?: 'surface' | 'overflow' | 'overflowStatic' | 'overflowStaticBorder';
  };
};
// [RIPPLE EFFECT 5] END: Ripple schema/type model.
