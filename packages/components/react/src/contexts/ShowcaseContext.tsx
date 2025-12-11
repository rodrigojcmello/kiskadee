import type { ThemeMode } from '@kiskadee/core';
import type { DesignSystemListEntry } from '@kiskadee/web-builder/types';
import { createContext, useContext } from 'react';

export type ShowcaseContextValue = {
  designSystemKeys: string[];
  availableSegments: string[];
  availableThemes: ThemeMode[];
  /**
   * Simplified list of all available design systems, derived from the
   * web-builder manifests. Contains only key and displayName.
   */
  designSystemList: DesignSystemListEntry[];

  /**
   * Current font family name/key used for smooth transitions.
   */
  fontName: string;
  setFontName: (value: string) => void;
};

export const ShowcaseContext = createContext<ShowcaseContextValue | undefined>(undefined);

export function useShowcase(): ShowcaseContextValue {
  const context = useContext(ShowcaseContext);

  if (!context) {
    throw new Error('useShowcase must be used within a ShowcaseContext.Provider');
  }

  return context;
}
