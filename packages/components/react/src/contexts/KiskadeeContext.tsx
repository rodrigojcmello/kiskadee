import type { ComponentClassNameMapJSON, ThemeMode } from '@kiskadee/core';
import type { Manifest } from '@kiskadee/web-builder/types';
import { createContext, useContext } from 'react';

export type KiskadeeContextValue = {
  classesMap: ComponentClassNameMapJSON;
  segment: string;
  theme: ThemeMode;
  setSegment: (value: string) => void;
  setTheme: (value: ThemeMode) => void;

  designSystem: string;
  setDesignSystem: (value: string) => void;

  /**
   * Full manifest for the currently selected design system, as produced
   * by @kiskadee/web-builder (phase-7 publishMetadata).
   *
   * May be undefined temporarily while loading in environments where
   * manifests are fetched lazily.
   */
  manifest?: Manifest;
  /**
   * Map of background colors resolved per theme for the current design system/segment.
   * Keys are ThemeMode string values (e.g. "light", "dark", "darker").
   */
  backgroundsByTheme: Record<string, string | undefined>;
};

export const KiskadeeContext = createContext<KiskadeeContextValue | undefined>(undefined);

export function useKiskadee(): KiskadeeContextValue {
  const context = useContext(KiskadeeContext);

  if (!context) {
    throw new Error('useKiskadee must be used within a KiskadeeContext.Provider');
  }

  return context;
}
