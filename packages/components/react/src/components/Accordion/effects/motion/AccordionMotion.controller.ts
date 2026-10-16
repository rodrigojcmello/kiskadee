import { type RefObject, useRef, useState } from 'react';
import type { TransitionSpeed } from '../../../../shared/motion/transitionSpeed.ts';
import { useIsomorphicLayoutEffect } from '../../../../shared/utils/useIsomorphicLayoutEffect.ts';
import type { AccordionTransitionCoordination } from '../../Accordion.types.ts';
import { type AccordionMotionGroup, createAccordionMotionGroup } from './AccordionMotion.group.ts';
import { useAccordionMotionModule } from './AccordionMotion.loader.ts';

export function useAccordionMotionGroup(
  enabled: boolean,
  speed: TransitionSpeed,
  coordination: AccordionTransitionCoordination
) {
  const [reduced, setReduced] = useState(false);
  const group = useRef<AccordionMotionGroup | null>(null);
  if (!group.current) group.current = createAccordionMotionGroup();
  const current = group.current;
  const module = useAccordionMotionModule(enabled && !reduced);
  useIsomorphicLayoutEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const update = () => {
      setReduced(query.matches);
      if (query.matches) current.configure({ animate: null, speed, coordination });
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [current, speed, coordination]);
  useIsomorphicLayoutEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    current.configure({
      animate:
        enabled && !reduced && !prefersReduced && module ? module.animateAccordionPanels : null,
      speed,
      coordination
    });
  }, [current, enabled, reduced, module, speed, coordination]);
  useIsomorphicLayoutEffect(() => () => current.destroy(), [current]);
  return current;
}

export function useAccordionMotion(
  id: string,
  open: boolean,
  group: AccordionMotionGroup,
  panel: RefObject<HTMLDivElement | null>,
  content: RefObject<HTMLDivElement | null>
) {
  const [retained, setRetained] = useState(open);
  useIsomorphicLayoutEffect(() => {
    if (!panel.current || !content.current) return;
    if (open) setRetained(true);
    group.update(id, {
      panel: panel.current,
      content: content.current,
      open,
      finish: () => setRetained(open)
    });
  }, [id, open, group, panel, content]);
  useIsomorphicLayoutEffect(() => () => group.remove(id), [group, id]);
  return { hidden: !open && !retained };
}
