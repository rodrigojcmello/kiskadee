'use client';

import { useEffect } from 'react';

const overrideProperty = '--showcase-route-background';
const owners = new WeakMap<HTMLElement, symbol>();

/** Optional scenario override. Routes without one inherit the Shell's canonical default. */
export function useShowcaseRouteBackground(color: string | undefined) {
  useEffect(() => {
    const canvas = document.querySelector<HTMLElement>('[data-showcase-canvas]');
    if (!canvas) return;

    const owner = Symbol('showcase-background');
    owners.set(canvas, owner);
    if (color) {
      canvas.style.setProperty(overrideProperty, color);
    } else {
      canvas.style.removeProperty(overrideProperty);
    }

    return () => {
      // An outgoing route must not erase a newer route's selection.
      if (owners.get(canvas) !== owner) return;
      canvas.style.removeProperty(overrideProperty);
      owners.delete(canvas);
    };
  }, [color]);
}
