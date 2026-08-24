'use client';

import type {
  ComponentEmphasis,
  ContentSurfaceContextMap,
  ContentSurfaceContextValue,
  SurfaceContext,
  ThemeMode
} from '@kiskadee/core';
import { createContext, type ReactNode, useContext } from 'react';

export type SurfaceContextProviderProps = {
  children: ReactNode;
  value: SurfaceContext;
};

const DEFAULT_SURFACE_CONTEXT: SurfaceContext = 'onSubtle';
const SurfaceContextState = createContext<SurfaceContext>(DEFAULT_SURFACE_CONTEXT);

export function SurfaceContextProvider({ children, value }: SurfaceContextProviderProps) {
  return <SurfaceContextState.Provider value={value}>{children}</SurfaceContextState.Provider>;
}

export function useSurfaceContext(explicitSurfaceContext?: SurfaceContext): SurfaceContext {
  const inheritedSurfaceContext = useContext(SurfaceContextState);
  return explicitSurfaceContext ?? inheritedSurfaceContext;
}

function resolveOutput(
  output: ContentSurfaceContextValue | undefined,
  consumedSurfaceContext: SurfaceContext
): SurfaceContext | undefined {
  if (output === 'inherit') return consumedSurfaceContext;
  return output;
}

export function resolveContentSurfaceContext({
  map,
  segment,
  theme,
  consumedSurfaceContext,
  intent,
  emphasis,
  selected,
  pending,
  disabled
}: {
  map: ContentSurfaceContextMap | undefined;
  segment: string;
  theme: ThemeMode;
  consumedSurfaceContext: SurfaceContext;
  intent: string;
  emphasis: ComponentEmphasis;
  selected?: boolean;
  pending?: boolean;
  disabled?: boolean;
}): SurfaceContext {
  const stateMap = map?.[segment]?.[theme]?.[consumedSurfaceContext]?.[intent]?.[emphasis];
  if (!stateMap) return consumedSurfaceContext;

  const output = disabled
    ? (stateMap.disabled ?? stateMap.rest)
    : pending
      ? (stateMap.pending ?? stateMap.rest)
      : selected
        ? (stateMap.selected ?? stateMap.rest)
        : stateMap.rest;

  return resolveOutput(output, consumedSurfaceContext) ?? consumedSurfaceContext;
}
