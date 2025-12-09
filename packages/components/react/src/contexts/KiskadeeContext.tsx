import type { ComponentClassNameMapJSON, ThemeMode } from '@kiskadee/core';
import type { Manifest as DesignSystemManifest } from '@kiskadee/web-builder/types';
import { createContext, useContext } from 'react';

export type KiskadeeContextValue = {
  classesMap: ComponentClassNameMapJSON;
  segment: string;
  theme: ThemeMode;
  setSegment: (value: string) => void;
  setTheme: (value: ThemeMode) => void;

  designSystem: string;
  setDesignSystem: (value: string) => void;
  availableSegments: string[];
  availableThemes: string[];
  designSystemKeys: string[];
  designSystemMeta: Record<string, DesignSystemManifest>;
  /**
   * Map of background colors resolved per theme for the current design system/segment.
   * Keys are ThemeMode string values (e.g. "light", "dark", "darker").
   */
  backgroundsByTheme: Record<string, string | undefined>;

  /**
   * Current font family name/key used for smooth transitions.
   */
  fontName: string;
  setFontName: (value: string) => void;
};

export const KiskadeeContext = createContext<KiskadeeContextValue | undefined>(undefined);

export function useKiskadee(): KiskadeeContextValue {
  const context = useContext(KiskadeeContext);

  if (!context) {
    throw new Error('useKiskadee must be used within a KiskadeeContext.Provider');
  }

  return context;
}
