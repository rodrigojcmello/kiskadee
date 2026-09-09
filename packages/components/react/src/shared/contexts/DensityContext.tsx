'use client';

import {
  type ComponentSize,
  componentSizeToScale,
  DEFAULT_DENSITY,
  type Density,
  resolveDensityScale
} from '@kiskadee/core';
import { createContext, type ReactNode, useContext } from 'react';
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
