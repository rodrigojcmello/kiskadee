'use client';

import type { SurfaceContext } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import { useMemo, useState } from 'react';
import { resolveBackgroundScenarios } from '../utils/background-scenarios';
import {
  getAvailableButtonStressTestBackgrounds,
  getPreferredButtonStressTestBackground,
  resolveBackgroundSurfaceContext
} from '../utils/button-stress-test-backgrounds';
import { resolveDefaultCanonicalCardSurface } from '../utils/canonical-card-surfaces';
import { useButtonStressTestBackgroundTones } from './use-background-tones';
import { useCanonicalCardSurfaces } from './use-canonical-card-surfaces';

export type BackgroundMode = 'canonical' | 'stress-test';
type Selection = { route: string; mode: BackgroundMode; key?: string; context: SurfaceContext };

/** Shell-owned inspection state, scoped to the route rather than persisted between pages. */
export function useShowcaseBackgroundState(route: string) {
  const { theme } = useKiskadee();
  const canonical = useCanonicalCardSurfaces();
  const stress = useButtonStressTestBackgroundTones();
  const scenarios = useMemo(() => resolveBackgroundScenarios(canonical.tones), [canonical.tones]);
  const stressTones = useMemo(
    () => getAvailableButtonStressTestBackgrounds(stress.tones, theme),
    [stress.tones, theme]
  );
  const [selection, setSelection] = useState<Selection>({
    route,
    mode: 'canonical',
    context: 'onSubtle'
  });
  if (selection.route !== route) {
    setSelection({ route, mode: 'canonical', context: 'onSubtle' });
  }
  const current: Selection =
    selection.route === route ? selection : { route, mode: 'canonical', context: 'onSubtle' };
  // The default uses the surface identity, never the index in the expanded swatch list.
  const scenario =
    scenarios.find((item) => item.key === current.key) ??
    scenarios.find(
      (item) =>
        item.key ===
        resolveDefaultCanonicalCardSurface(canonical.tones, current.context, theme)?.key
    );
  const stressTone =
    stressTones.find((item) => item.key === current.key) ??
    getPreferredButtonStressTestBackground(stress.tones, theme, current.context);
  const active = current.mode === 'canonical' ? scenario?.canvas : stressTone;
  const surfaceContext =
    current.mode === 'canonical'
      ? (scenario?.canvas.contentSurfaceContext ?? current.context)
      : current.context;
  const cardSurface =
    current.mode === 'canonical'
      ? scenario?.card
      : canonical.tones.find((item) => item.contentSurfaceContext === surfaceContext);

  function selectContext(context: SurfaceContext) {
    setSelection({ route, mode: 'canonical', context });
  }

  function selectMode(mode: BackgroundMode) {
    if (mode === current.mode) return;
    setSelection({ route, mode, context: surfaceContext });
  }

  function selectBackground(key: string) {
    const next =
      current.mode === 'canonical'
        ? scenarios.find((item) => item.key === key)
        : stressTones.find((item) => item.key === key);
    if (!next) return;
    const context =
      'canvas' in next
        ? next.canvas.contentSurfaceContext
        : resolveBackgroundSurfaceContext(next.row);
    setSelection({ route, mode: current.mode, context, key });
  }

  return {
    mode: current.mode,
    key: current.mode === 'canonical' ? scenario?.key : stressTone?.key,
    surfaceContext,
    color: active?.resolvedColor,
    defaultColor: canonical.defaultSurface?.resolvedColor,
    cardSurface,
    cardBorder: current.mode === 'canonical' && Boolean(scenario?.cardBorder),
    surfaces: canonical.tones,
    scenarios,
    stressTones,
    selectContext,
    selectMode,
    selectBackground
  };
}
