import type { CSSProperties } from 'react';

/**
 * CLICK_MIN_DURATION needs to be greater than CLICK_TRANSITION_DURATION.
 * Because the animation of minimum duration is the minimum time that the
 * button will be in the active state, the next transition is the one to
 * leave this active state, that is, a smaller number could impact the
 * quality and fluidity of the exit transition after the click
 */
export const CLICK_MIN_DURATION = 150;
export const CLICK_TRANSITION_DURATION = 80;

export const RIPPLE_DURATION = 500;
export const RIPPLE_TIMING_FUNCTION: CSSProperties['animationTimingFunction'] =
  'ease-in';
