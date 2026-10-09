import { animate } from 'motion';
import type { VisualMotionTiming } from './visualMotion.types.ts';

function options(timing: VisualMotionTiming) {
  return {
    duration: Math.max(0, timing.durationMs) / 1000,
    ease: timing.easing === 'ease-in' ? ([0.42, 0, 1, 1] as const) : ([0, 0, 0.58, 1] as const)
  };
}
export function rotate(element: HTMLElement, angle: number, timing: VisualMotionTiming) {
  const control = animate(element, { rotate: angle }, options(timing));
  return () => control.stop();
}
export function crossfade(
  current: HTMLElement,
  previous: HTMLElement,
  timing: VisualMotionTiming,
  complete: () => void
) {
  let cancelled = false;
  const outgoing = animate(previous, { opacity: 0 }, options(timing));
  const incoming = animate(current, { opacity: [0, 1] }, options(timing));
  void incoming.then(() => {
    if (!cancelled) complete();
  });
  return () => {
    cancelled = true;
    incoming.stop();
    outgoing.stop();
  };
}
