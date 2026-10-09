import type { GrowHeightPresenceProfile } from '@kiskadee/core';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../../../../shared/utils/useIsomorphicLayoutEffect.ts';
import { useAccordionMotionModule } from './AccordionMotion.loader.ts';

export function useAccordionMotion(
  open: boolean,
  enabled: boolean,
  timing: GrowHeightPresenceProfile | undefined,
  panel: RefObject<HTMLDivElement | null>,
  content: RefObject<HTMLDivElement | null>
) {
  const module = useAccordionMotionModule(enabled && Boolean(timing));
  const [reduced, setReduced] = useState(false);
  const [retained, setRetained] = useState(open);
  const previousOpen = useRef(open);
  useEffect(() => {
    if (!enabled) return;
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [enabled]);
  useIsomorphicLayoutEffect(() => {
    const element = panel.current;
    const body = content.current;
    if (!element || !body) return;
    const changed = previousOpen.current !== open;
    previousOpen.current = open;
    const finish = () => setRetained(open);
    // Loading the enhancer must never replay a transition already applied without it.
    if (!changed || !enabled || reduced || !module || !timing) {
      element.style.height = open ? 'auto' : '0px';
      element.style.overflow = open ? '' : 'hidden';
      finish();
      return;
    }
    if (open) setRetained(true);
    return module.animateAccordionPanel(element, body, open, timing, finish);
  }, [open, enabled, reduced, module, timing, panel, content]);
  return { hidden: !open && !retained };
}
