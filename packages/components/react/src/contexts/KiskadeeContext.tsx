import type {
  ActivationFeedbackEffectSchema,
  ComponentClassNameMapJSON,
  RadiusMode,
  RippleEffectSchema,
  SwitchActivationMotion,
  SwitchControlTextVisibility,
  SwitchMode,
  SwitchVariant,
  TabsBridgeLowerCurve,
  TabsIndicatorPosition,
  TabsIndicatorShape,
  TabsIndicatorWidth,
  TabsTabWidth,
  TabsVariant,
  TextFieldFocusRingColorSource,
  TextFieldLabelOffsetByRadius,
  TextFieldMode,
  TextFieldModeByVariant,
  TextFieldVariant,
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
  artifactVersion?: string;
  loadComponentArtifact?: <T>(componentName: string) => Promise<T | undefined>;
  global?: {
    radius?: RadiusMode;
    // [RIPPLE EFFECT 16] START: Global ripple config exposed to React components.
    effects?: {
      activationFeedback?: ActivationFeedbackEffectSchema;
      ripple?: RippleEffectSchema;
    };
    // [RIPPLE EFFECT 16] END: Global ripple config exposed to React components.
    components?: {
      textField?: {
        options?: {
          variant?: TextFieldVariant;
          mode?: TextFieldMode;
          focusRingColorSource?: TextFieldFocusRingColorSource;
        };
        variants?: {
          [TVariant in TextFieldVariant]?: {
            options?: {
              focusRingColorSource?: TextFieldFocusRingColorSource;
            };
            modes?: {
              [TMode in TextFieldModeByVariant[TVariant]]?: {
                options?: {
                  labelOffset?: TextFieldLabelOffsetByRadius;
                  focusRingColorSource?: TextFieldFocusRingColorSource;
                };
              };
            };
          };
        };
      };
      tabs?: {
        options?: {
          variant?: TabsVariant;
          indicatorPosition?: TabsIndicatorPosition;
          indicatorShape?: TabsIndicatorShape;
          indicatorWidth?: TabsIndicatorWidth;
          tabWidth?: TabsTabWidth;
          separator?: boolean;
          lowerCurve?: TabsBridgeLowerCurve;
        };
      };
      switch?: {
        options?: {
          variant?: SwitchVariant;
          radius?: RadiusMode;
          activationMotion?: SwitchActivationMotion;
          controlTextVisibility?: SwitchControlTextVisibility;
        };
        effects?: {
          thumbSize?: true;
        };
        variants?: {
          standard?: {
            options?: {
              mode?: SwitchMode;
            };
          };
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
