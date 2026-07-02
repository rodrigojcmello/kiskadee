import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackSetting,
  ComponentClassNameMapJSON,
  RadiusMode,
  ShadowEffectSchema,
  ShadowGlobalEffectSchema,
  SliderEdgeMarkLabelPlacement,
  SliderEdgeMarks,
  SliderMarkLabelPlacement,
  SliderMarks,
  SliderMode,
  SliderValueDisplay,
  SliderVariant,
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
  TextFieldLabelPlacement,
  TextFieldMode,
  TextFieldModeByVariant,
  TextFieldVariant,
  ThemeMode
} from '@kiskadee/core';
import { createContext, useContext } from 'react';

export type ComponentClassMapScope =
  | { kind: 'core' }
  | { kind: 'palette'; segment: string; theme: ThemeMode };

export type KiskadeeInteractionEnvironment = {
  isLikelyTouch?: boolean;
};

export type KiskadeeLayoutEnvironment = {
  isCompactViewport?: boolean;
};

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
  loadComponentClassMap?: <T>(
    componentName: string,
    scope: ComponentClassMapScope
  ) => Promise<T | undefined>;
  interactionEnvironment?: KiskadeeInteractionEnvironment;
  layoutEnvironment?: KiskadeeLayoutEnvironment;
  global?: {
    radius?: RadiusMode;
    effects?: {
      activationFeedback?: ActivationFeedbackEffectSchema;
      shadow?: ShadowGlobalEffectSchema;
    };
    components?: {
      button?: {
        effects?: {
          activationFeedback?: ActivationFeedbackSetting;
          shadow?: ShadowEffectSchema;
        };
      };
      card?: {
        effects?: {
          shadow?: ShadowEffectSchema;
        };
      };
      slider?: {
        options?: {
          variant?: SliderVariant;
          valueDisplay?: SliderValueDisplay;
          marks?: SliderMarks;
          edgeMarks?: SliderEdgeMarks;
          markLabelPlacement?: SliderMarkLabelPlacement;
          edgeMarkLabelPlacement?: SliderEdgeMarkLabelPlacement;
        };
        variants?: {
          standard?: {
            options?: {
              mode?: SliderMode;
            };
          };
        };
      };
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
            } & (TVariant extends 'standard' ? { labelPlacement?: TextFieldLabelPlacement } : {});
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
          activationFeedback?: ActivationFeedbackSetting;
          thumbShrink?: true;
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
