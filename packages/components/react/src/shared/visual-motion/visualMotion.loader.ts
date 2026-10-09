import { useState } from 'react';
import { createLazyModuleCache, useLazyModule } from '../utils/lazyModule.ts';
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect.ts';

const cache = createLazyModuleCache(() => import('./visualMotion.effect.ts'));
export function useVisualMotion(enabled: boolean) {
  const [reduced, setReduced] = useState(false);
  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [enabled]);
  const module = useLazyModule(cache, enabled && !reduced);
  return reduced ? null : module;
}
