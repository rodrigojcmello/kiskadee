'use client';

import {
  breakpoints,
  type ComponentSize,
  componentSizeToScale,
  DEFAULT_DENSITY,
  DENSITY_BREAKPOINT,
  type Density,
  REGULAR_DENSITY_BREAKPOINT,
  resolveDensityScale,
  resolveSupportedSize,
  selectSizeSupport
} from '@kiskadee/core';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useSyncExternalStore
} from 'react';
import { KiskadeeContext } from './KiskadeeContext.tsx';
import { useComponentMetadata } from './useComponentMetadata.ts';

const DensityContext = createContext<Density | undefined>(undefined);

export type DensityProviderProps = { value: Density; children?: ReactNode };

/** Selects density for a subtree, preserving context through React portals. */
export function DensityProvider({ value, children }: DensityProviderProps) {
  return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>;
}

/** Resolves classes only; CSS owns adaptive viewport changes. */
export function useComponentScale(
  component: string,
  size?: ComponentSize,
  selection: { variant?: string; mode?: string } = {}
): string {
  const scopeDensity = useContext(DensityContext);
  const context = useContext(KiskadeeContext);
  const metadata = useComponentMetadata(component);
  const map = metadata?.density ?? context?.global?.density;
  const requested =
    size !== undefined
      ? componentSizeToScale(size)
      : map
        ? resolveDensityScale(scopeDensity ?? context?.density ?? DEFAULT_DENSITY, map)
        : 'md:1';
  if (!metadata?.sizeSupport) return context?.loadComponentArtifact ? 'pending' : requested;
  if (requested === 'a') return requested;
  const variant =
    selection.variant ?? (metadata.options as { variant?: string } | undefined)?.variant;
  const mode = selection.mode ?? (metadata.variants as any)?.[variant ?? '']?.options?.mode;
  return resolveSupportedSize(
    requested,
    selectSizeSupport(metadata.sizeSupport, { variant, mode })
  );
}

/** Runtime effects need the active size; adaptive styling still uses the original CSS alias. */
export function useResolvedComponentScale(
  component: string,
  size?: ComponentSize,
  selection: { variant?: string; mode?: string } = {}
): string {
  const scale = useComponentScale(component, size, selection);
  const metadata = useComponentMetadata(component);
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
  const map = metadata?.density ?? context?.global?.density;
  if (!map) return 's:md:1';
  const requested =
    density === 'compact'
      ? (map.c ?? map.r ?? map.s)
      : density === 'regular' && map.r
        ? map.r
        : (map.s ?? map.r ?? map.c);
  const variant =
    selection.variant ?? (metadata?.options as { variant?: string } | undefined)?.variant;
  const mode = selection.mode ?? (metadata?.variants as any)?.[variant ?? '']?.options?.mode;
  return metadata?.sizeSupport
    ? resolveSupportedSize(
        requested ?? 'md:1',
        selectSizeSupport(metadata.sizeSupport, { variant, mode })
      )
    : 'pending';
}
