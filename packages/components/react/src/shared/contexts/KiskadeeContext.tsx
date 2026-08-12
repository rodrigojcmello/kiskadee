import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackSetting,
  ButtonIconLayout,
  ButtonIconPlacement,
  ButtonIconSurfaceCorners,
  ButtonIconTreatment,
  ComponentClassNameMapJSON,
  GlobalClassNameMapJSON,
  RadiusMode,
  SchemaFonts,
  SchemaIconSizes,
  SchemaIcons,
  ShadowEffectSchema,
  ShadowGlobalEffectSchema,
  SliderEdgeLabelAlignment,
  SliderEdgeLabelPlacement,
  SliderEdgeMarks,
  SliderFillOrigin,
  SliderFillOriginMark,
  SliderMarkLabelPlacement,
  SliderMarkPlacement,
  SliderMarks,
  SliderMode,
  SliderSnapAnimation,
  SliderThumbCrossing,
  SliderThumbEdge,
  SliderThumbStepBehavior,
  SliderValueAnimation,
  SliderValueDisplay,
  SliderValueSummaryPlacement,
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
import type { BrandPackLoader, LoadedBrandPackResources } from './BrandPackContext.tsx';

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
  /**
   * Resolves optional brand-pack resources. Brand assets are deliberately kept
   * outside the regular preset artifacts and are loaded only by a
   * BrandPackBoundary.
   */
  brandPackLoader?: BrandPackLoader;
  /**
   * Resources already included by an SSR host. Keys must be produced by
   * createBrandPackResourceKey(); the matching stylesheet must already be in
   * the rendered document head.
   */
  preloadedBrandPacks?: Readonly<Record<string, LoadedBrandPackResources>>;
  interactionEnvironment?: KiskadeeInteractionEnvironment;
  layoutEnvironment?: KiskadeeLayoutEnvironment;
  global?: {
    classMap?: GlobalClassNameMapJSON;
    fonts?: SchemaFonts;
    iconSizes?: SchemaIconSizes;
    icons?: SchemaIcons;
    radius?: RadiusMode;
    effects?: {
      activationFeedback?: ActivationFeedbackEffectSchema;
      shadow?: ShadowGlobalEffectSchema;
    };
    components?: {
      button?: {
        options?: {
          iconLayout?: ButtonIconLayout;
          iconPlacement?: ButtonIconPlacement;
          iconSurfaceCorners?: ButtonIconSurfaceCorners;
          iconTreatment?: ButtonIconTreatment;
        };
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
        effects?: {
          activationFeedback?: ActivationFeedbackSetting;
        };
        options?: {
          variant?: SliderVariant;
          valueDisplay?: SliderValueDisplay;
          valueSummaryPlacement?: SliderValueSummaryPlacement;
          valueAnimation?: SliderValueAnimation;
          snapAnimation?: SliderSnapAnimation;
          thumbStepBehavior?: SliderThumbStepBehavior;
          thumbCrossing?: SliderThumbCrossing;
          marks?: SliderMarks;
          markInterval?: number;
          edgeMarks?: SliderEdgeMarks;
          markPlacement?: SliderMarkPlacement;
          markLabelPlacement?: SliderMarkLabelPlacement;
          edgeLabelPlacement?: SliderEdgeLabelPlacement;
          edgeLabelAlignment?: SliderEdgeLabelAlignment;
          thumbEdge?: SliderThumbEdge;
          fillOrigin?: SliderFillOrigin;
          fillOriginMark?: SliderFillOriginMark;
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
