import type { TransitionSpeed } from '../../../../shared/motion/transitionSpeed.ts';

export type AccordionTransition = { durationMs: number; easing: 'ease-in' | 'ease-out' };
const durations = {
  normal: [180, 120],
  fast: [120, 80],
  slow: [360, 240],
  debugSlow: [1800, 1200]
} as const satisfies Record<TransitionSpeed, readonly [number, number]>;

export function resolveAccordionTransition(
  speed: TransitionSpeed,
  open: boolean
): AccordionTransition {
  return { durationMs: durations[speed][open ? 0 : 1], easing: open ? 'ease-out' : 'ease-in' };
}

// Indicator timing is intentionally independent of panel speed and coordination.
export const accordionIndicatorTiming = {
  enterDurationMs: 180,
  exitDurationMs: 120,
  enterEasing: 'ease-out',
  exitEasing: 'ease-in'
} as const;
