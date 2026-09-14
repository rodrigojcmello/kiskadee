'use client';

import {
  breakpoints,
  type ComponentSize,
  componentSizeToScale,
  DEFAULT_DENSITY,
  DENSITY_BREAKPOINT,
  type Density,
  REGULAR_DENSITY_BREAKPOINT,
  resolveDensityScale
} from '@kiskadee/core';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useSyncExternalStore
} from 'react';
import { KiskadeeContext } from './KiskadeeContext.tsx';

const DensityContext = createContext<Density | undefined>(undefined);

export type DensityProviderProps = { value: Density; children?: ReactNode };

/** Selects density for a subtree, preserving context through React portals. */
export function DensityProvider({ value, children }: DensityProviderProps) {
  return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>;
}

/** Resolves classes only; CSS owns adaptive viewport changes. */
export function useComponentScale(component: string, size?: ComponentSize): string {
  const scopeDensity = useContext(DensityContext);
  const context = useContext(KiskadeeContext);
  if (size !== undefined) return componentSizeToScale(size);
  const map = context?.global?.density?.[component];
  if (!map) return 's:md:1';
  return resolveDensityScale(scopeDensity ?? context?.density ?? DEFAULT_DENSITY, map);
}

/** Runtime effects need the active size; adaptive styling still uses the original CSS alias. */
export function useResolvedComponentScale(component: string, size?: ComponentSize): string {
  const scale = useComponentScale(component, size);
  const context = useContext(KiskadeeContext);
  const adaptive = scale === 'a';
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!adaptive || typeof window.matchMedia !== 'function') return () => {};
      const queries = [REGULAR_DENSITY_BREAKPOINT, DENSITY_BREAKPOINT].map((key) =>
        window.matchMedia(`(min-width: ${breakpoints[key]}px)`)
      );
      for (const query of queries) query.addEventListener('change', onChange);
      return () => {
        for (const query of queries) query.removeEventListener('change', onChange);
      };
    },
    [adaptive]
  );
  const snapshot = useCallback(() => {
    if (!adaptive || typeof window === 'undefined') return 'regular';
    return window.innerWidth >= breakpoints[DENSITY_BREAKPOINT]!
      ? 'compact'
      : window.innerWidth >= breakpoints[REGULAR_DENSITY_BREAKPOINT]!
        ? 'regular'
        : 'spacious';
  }, [adaptive]);
  const density = useSyncExternalStore(subscribe, snapshot, () => 'regular');
  if (!adaptive) return scale;
  const map = context?.global?.density?.[component];
  if (!map) return 's:md:1';
  if (density === 'compact') return map.c ?? map.r ?? map.s ?? 's:md:1';
  if (density === 'regular' && map.r) return map.r;
  return map.s ?? map.r ?? map.c ?? 's:md:1';
}
