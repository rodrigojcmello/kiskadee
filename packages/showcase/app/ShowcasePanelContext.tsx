'use client';

import type { ControlCursorValue, Density, DensityScaleMapJSON } from '@kiskadee/core';
import type { KiskadeeContextValue } from '@kiskadee/react-components';
import { createContext, useContext } from 'react';
import type { useShowcaseBackgroundState } from '@/hooks/use-showcase-background-state';

export type ShowcasePanelDetail = {
  id: string;
  eyebrow: string;
  showGlobalControls?: boolean;
  title: string;
};

type ShowcasePanelContextValue = {
  densityMap: DensityScaleMapJSON | undefined;
  densityOverride: Density | undefined;
  setDensityOverride: (value: Density | undefined) => void;
  controlCursorAvailable: boolean;
  controlCursorOverride: ControlCursorValue | undefined;
  setControlCursorOverride: (value: ControlCursorValue | undefined) => void;
  administrativeContext: KiskadeeContextValue;
  background: ReturnType<typeof useShowcaseBackgroundState>;
  panelDetail: ShowcasePanelDetail | null;
  panelSlotElement: HTMLElement | null;
  registerPanelDetail: (detail: ShowcasePanelDetail) => void;
  clearPanelDetail: (id: string) => void;
  showComponentsPanel: () => void;
  showDetailPanel: () => void;
};

export const ShowcasePanelContext = createContext<ShowcasePanelContextValue | null>(null);

export function useShowcasePanel() {
  const context = useContext(ShowcasePanelContext);

  if (!context) {
    throw new Error('useShowcasePanel must be used inside ShowcasePanelContext.Provider.');
  }

  return context;
}
