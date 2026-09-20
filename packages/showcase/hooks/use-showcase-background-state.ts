'use client';

import type { SurfaceContext } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components/resources';
import { useMemo, useState } from 'react';
import { resolveBackgroundScenarios } from '../utils/background-scenarios';
import { resolveDefaultCanonicalCardSurface } from '../utils/canonical-card-surfaces';
import { useCanonicalCardSurfaces } from './use-canonical-card-surfaces';

type Selection = {
  designSystem: string;
  route: string;
  key?: string;
  context: SurfaceContext;
};

/** Shell-owned inspection state, scoped to the route rather than persisted between pages. */
export function useShowcaseBackgroundState(route: string) {
  const { theme, designSystem } = useKiskadee();
  const canonical = useCanonicalCardSurfaces(undefined, false);
  const scenarios = useMemo(() => resolveBackgroundScenarios(canonical.tones), [canonical.tones]);
  const [selection, setSelection] = useState<Selection>({
    route,
    designSystem,
    context: 'onSubtle'
  });
  const current: Selection =
    selection.route !== route
      ? { route, designSystem, context: 'onSubtle' }
      : selection.designSystem !== designSystem
        ? { route, designSystem, context: selection.context }
        : selection;
  if (current !== selection) setSelection(current);
  // The default uses the surface identity, never the index in the expanded swatch list.
  const defaultScenario = scenarios.find(
    (item) =>
      item.key ===
      resolveDefaultCanonicalCardSurface(
        scenarios.map((entry) => entry.canvas),
        current.context,
        theme
      )?.key
  );
  const scenario = scenarios.find((item) => item.key === current.key) ?? defaultScenario;
  const surfaceContext = scenario?.canvas.contentSurfaceContext ?? current.context;
  const cardSurface = scenario?.card;

  function selectContext(context: SurfaceContext) {
    setSelection({ route, designSystem, context });
  }

  function selectBackground(key: string) {
    const next = scenarios.find((item) => item.key === key);
    if (!next) return;
    setSelection({ route, designSystem, context: next.canvas.contentSurfaceContext, key });
  }

  return {
    key: scenario?.key,
    surfaceContext,
    color: scenario?.canvas.resolvedColor,
    defaultColor: defaultScenario?.canvas.resolvedColor,
    cardSurface,
    cardBorder: Boolean(scenario?.cardBorder),
    surfaces: canonical.tones,
    scenarios,
    selectContext,
    selectBackground
  };
}
