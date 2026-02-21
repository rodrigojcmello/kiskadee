import type {
  RippleMode,
  RippleMotionDurationToken,
  RippleProfile
} from './ripple.types';

// [RIPPLE EFFECT 6] START: Default ripple constants and profiles.
export const RIPPLE_DURATION_TOKEN_TO_MS: Readonly<Record<RippleMotionDurationToken, number>> = {
  'interaction.instant': 0,
  'interaction.fast': 360,
  'interaction.slow': 468,
  'interaction.hold.short': 50,
  'interaction.fade.short': 100,
  'interaction.fade.long': 180
};

export const DEFAULT_RIPPLE_PROFILES: Readonly<Record<RippleMode, RippleProfile>> = {
  surface: {
    animateSize: true,
    size: 'auto',
    durationToken: 'interaction.slow',
    curveToken: 'motion.emphasized.out',
    fade: {
      delayToken: 'interaction.hold.short',
      durationToken: 'interaction.fade.short',
      curveToken: 'motion.standard.out'
    },
    fillToken: 'surface'
  },
  overflow: {
    animateSize: true,
    size: 200,
    durationToken: 'interaction.fast',
    curveToken: 'motion.standard.out',
    fade: {
      delayToken: 'interaction.hold.short',
      durationToken: 'interaction.fade.short',
      curveToken: 'motion.standard.out'
    },
    fillToken: 'overflow'
  },
  'overflow-static': {
    animateSize: false,
    size: 200,
    durationToken: 'interaction.instant',
    fade: {
      delayToken: 'interaction.hold.short',
      durationToken: 'interaction.fade.long',
      curveToken: 'motion.standard.out'
    },
    fillToken: 'overflowStatic',
    border: {
      width: 1,
      colorToken: 'overflowStaticBorder'
    }
  }
};

export const DEFAULT_PRESSED_RIPPLE_PROFILE: Readonly<RippleProfile> = {
  animateSize: false,
  size: 'auto',
  durationToken: 'interaction.instant',
  curveToken: 'motion.standard.out',
  fade: {
    delayToken: 'interaction.hold.short',
    durationToken: 'interaction.fade.short',
    curveToken: 'motion.standard.out'
  },
  fillToken: 'surface'
};
// [RIPPLE EFFECT 6] END: Default ripple constants and profiles.
