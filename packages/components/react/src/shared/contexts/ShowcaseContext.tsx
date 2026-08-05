import type { ThemeMode } from '@kiskadee/core';
import type { DesignSystemListEntry, Manifest } from '@kiskadee/web-builder/types';
import { createContext, useContext } from 'react';

export type ShowcaseFontRole = 'body' | 'heading' | 'code';

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

  /**
   * Current font family name/key used for smooth transitions.
   */
  fontName: string;
  setFontName: (value: string) => void;
  fontRoleNames: Record<ShowcaseFontRole, string>;
  setFontRoleName: (role: ShowcaseFontRole, value: string) => void;
  /** Family currently rendered by the global interface-icon provider. */
  iconFamilyId: string;
  /** Selects an explicit Showcase family until the design system changes. */
  setIconFamilyId: (value: string) => void;
};

export const ShowcaseContext = createContext<ShowcaseContextValue | undefined>(undefined);

export function useShowcase(): ShowcaseContextValue {
  const context = useContext(ShowcaseContext);

  if (!context) {
    throw new Error('useShowcase must be used within a ShowcaseContext.Provider');
  }

  return context;
}
