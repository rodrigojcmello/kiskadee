import type { ComponentEmphasis, ContentSurfaceContextMap, SurfaceContext } from '@kiskadee/core';
import { useCallback } from 'react';
import { useKiskadee } from './KiskadeeContext.tsx';
import { resolveContentSurfaceContext, useSurfaceContext } from './SurfaceContext.tsx';

export type ProducedSurfaceState = {
  selected?: boolean;
  pending?: boolean;
  disabled?: boolean;
};

/** Resolve one surface owner's input and preset-authored output for its descendants. */
export function useProducedSurfaceContext({
  map,
  surfaceContext,
  intent,
  emphasis
}: {
  map: ContentSurfaceContextMap | undefined;
  surfaceContext?: SurfaceContext;
  intent: string;
  emphasis: ComponentEmphasis;
}) {
  const consumedSurfaceContext = useSurfaceContext(surfaceContext);
  const { segment, theme } = useKiskadee();
  const resolveProducedSurfaceContext = useCallback(
    ({ selected, pending, disabled }: ProducedSurfaceState = {}) =>
      resolveContentSurfaceContext({
        map,
        segment,
        theme,
        consumedSurfaceContext,
        intent,
        emphasis,
        selected,
        pending,
        disabled
      }),
    [map, segment, theme, consumedSurfaceContext, intent, emphasis]
  );

  return { consumedSurfaceContext, resolveProducedSurfaceContext };
}
