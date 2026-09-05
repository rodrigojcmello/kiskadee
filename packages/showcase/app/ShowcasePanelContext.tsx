'use client';

import { createContext, useContext } from 'react';
import type { useShowcaseBackgroundState } from '@/hooks/use-showcase-background-state';

export type ShowcasePanelDetail = {
  id: string;
  eyebrow: string;
  showGlobalControls?: boolean;
  title: string;
};

type ShowcasePanelContextValue = {
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
