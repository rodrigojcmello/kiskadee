import { useState } from 'react';
import { useIsomorphicLayoutEffect } from '../../shared/utils/useIsomorphicLayoutEffect.ts';

type Positioning = {
  offset: number;
  collisionPadding: { top: number; right: number; bottom: number; left: number };
};

// e13 publishes pixel scale tokens; missing geometry does not invent a visual fallback.
export function useSelectPositioning(className: string | undefined) {
  const [element, ref] = useState<HTMLElement | null>(null);
  const [geometry, setGeometry] = useState<Positioning | null>(null);
  useIsomorphicLayoutEffect(() => {
    const view = element?.ownerDocument.defaultView;
    if (!element || !view || !className) {
      setGeometry(null);
      return;
    }
    const read = () => {
      const style = view.getComputedStyle(element);
      const values = ['--k-mgt', '--k-pdt', '--k-pdr', '--k-pdb', '--k-pdl'].map((key) =>
        Number.parseFloat(style.getPropertyValue(key))
      );
      const [offset, top, right, bottom, left] = values;
      const next = values.every(Number.isFinite)
        ? {
            offset: offset!,
            collisionPadding: { top: top!, right: right!, bottom: bottom!, left: left! }
          }
        : null;
      setGeometry((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next
      );
    };
    read();
    view.addEventListener('resize', read);
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(read);
    observer?.observe(element);
    return () => {
      view.removeEventListener('resize', read);
      observer?.disconnect();
    };
  }, [element, className]);
  return {
    ref,
    offset: geometry?.offset ?? null,
    collisionPadding: geometry?.collisionPadding ?? null
  };
}
