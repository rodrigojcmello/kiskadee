import type { ComponentClassNameMapJSON, ThemeMode } from '@kiskadee/core';
import { createContext, useContext } from 'react';

export type DesignSystemManifest = {
  displayName?: string;
  [key: string]: unknown;
};

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
};

export const KiskadeeContext = createContext<KiskadeeContextValue | undefined>(undefined);

export function useKiskadee(): KiskadeeContextValue {
  const context = useContext(KiskadeeContext);

  if (!context) {
    throw new Error('useKiskadee must be used within a KiskadeeContext.Provider');
  }

  return context;
}
