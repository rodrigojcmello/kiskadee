import { animate } from 'motion';
import type { AccordionTransition } from './AccordionMotion.recipes.ts';

export type AccordionMotionParticipant = {
  panel: HTMLElement;
  content: HTMLElement;
  open: boolean;
};

/** A single progress clock keeps all participating heights on the same timeline. */
export function animateAccordionPanels(
  participants: readonly AccordionMotionParticipant[],
  transition: AccordionTransition,
  complete: () => void
): () => void {
  let cancelled = false;
  let progress = 0;
  const tracks = participants.map(({ panel, content, open }) => {
    const origin = panel.getBoundingClientRect().height;
    return {
      panel,
      content,
      open,
      origin,
      target: open ? content.getBoundingClientRect().height : 0,
      start: 0
    };
  });
  // Measure the entire cohort before writing, avoiding repeated read/write layout cycles.
  for (const track of tracks) {
    track.panel.style.height = `${track.origin}px`;
    track.panel.style.overflow = 'hidden';
  }
  const observer =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(() => {
          for (const track of tracks) {
            if (!track.open) continue;
            const target = track.content.getBoundingClientRect().height;
            if (target === track.target) continue;
            track.origin = track.panel.getBoundingClientRect().height;
            track.target = target;
            track.start = progress;
          }
        });
  for (const track of tracks) if (track.open) observer?.observe(track.content);
  const animation = animate(0, 1, {
    duration: transition.durationMs / 1000,
    ease: transition.easing === 'ease-in' ? [0.42, 0, 1, 1] : [0, 0, 0.58, 1],
    onUpdate(value) {
      if (cancelled) return;
      progress = value;
      for (const track of tracks) {
        const fraction = track.start === 1 ? 1 : (value - track.start) / (1 - track.start);
        track.panel.style.height = `${track.origin + (track.target - track.origin) * fraction}px`;
      }
    }
  });
  void animation.then(() => {
    if (cancelled) return;
    observer?.disconnect();
    for (const track of tracks) {
      track.panel.style.height = track.open ? 'auto' : '0px';
      track.panel.style.overflow = track.open ? '' : 'hidden';
    }
    complete();
  });
  return () => {
    cancelled = true;
    observer?.disconnect();
    animation.stop();
  };
}
