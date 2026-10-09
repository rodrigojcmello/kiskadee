import type { GrowHeightPresenceProfile } from '@kiskadee/core';
import { animate } from 'motion';

/** Retarget measured height from the current frame, including content changes during entry. */
export function animateAccordionPanel(
  panel: HTMLElement,
  content: HTMLElement,
  open: boolean,
  timing: GrowHeightPresenceProfile,
  complete: () => void
): () => void {
  let cancelled = false;
  let observer: ResizeObserver | undefined;
  let animation: ReturnType<typeof animate> | undefined;
  let generation = 0;
  const duration = (open ? timing.enterDurationMs : timing.exitDurationMs) / 1000;
  const ease = open ? timing.enterEasing : timing.exitEasing;
  const curve = ease === 'ease-in' ? ([0.42, 0, 1, 1] as const) : ([0, 0, 0.58, 1] as const);
  let lastTarget = -1;
  const retarget = () => {
    const target = open ? content.getBoundingClientRect().height : 0;
    if (target === lastTarget) return;
    lastTarget = target;
    const current = panel.getBoundingClientRect().height;
    animation?.stop();
    const currentGeneration = ++generation;
    panel.style.height = `${current}px`;
    panel.style.overflow = 'hidden';
    animation = animate(
      panel,
      { height: [`${current}px`, `${target}px`] },
      { duration, ease: curve }
    );
    void animation.then(() => {
      if (cancelled || generation !== currentGeneration) return;
      observer?.disconnect();
      panel.style.height = open ? 'auto' : '0px';
      panel.style.overflow = open ? '' : 'hidden';
      complete();
    });
  };
  retarget();
  if (open && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(retarget);
    observer.observe(content);
  }
  return () => {
    cancelled = true;
    observer?.disconnect();
    animation?.stop();
  };
}
