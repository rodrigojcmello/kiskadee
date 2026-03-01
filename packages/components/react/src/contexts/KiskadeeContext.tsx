import type {
  ComponentClassNameMapJSON,
  RadiusMode,
  RippleEffectSchema,
  TabsVariant,
  TabsIndicatorShape,
  TabsIndicatorPosition,
  ThemeMode
} from '@kiskadee/core';
import { createContext, useContext } from 'react';

export type KiskadeeContextValue = {
  classesMap: ComponentClassNameMapJSON;
  segment: string;
  theme: ThemeMode;
  setSegment: (value: string) => void;
  setTheme: (value: ThemeMode) => void;

  designSystem: string;
  setDesignSystem: (value: string) => void;
  global?: {
    radius?: RadiusMode;
    // [RIPPLE EFFECT 16] START: Global ripple config exposed to React components.
    effects?: {
      ripple?: RippleEffectSchema;
    };
    // [RIPPLE EFFECT 16] END: Global ripple config exposed to React components.
    components?: {
      tabs?: {
        options?: {
          variant?: TabsVariant;
          indicatorPosition?: TabsIndicatorPosition;
          indicatorShape?: TabsIndicatorShape;
        };
      };
    };
  };
};

export const KiskadeeContext = createContext<KiskadeeContextValue | undefined>(undefined);

export function useKiskadee(): KiskadeeContextValue {
  const context = useContext(KiskadeeContext);

  if (!context) {
    throw new Error('useKiskadee must be used within a KiskadeeContext.Provider');
  }

  return context;
}
