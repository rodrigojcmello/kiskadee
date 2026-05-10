export const STYLE_EMISSION_MODE = {
  direct: 'direct',
  mirrored: 'mirrored',
  token: 'token',
  interpolated: 'interpolated',
  compensated: 'compensated'
} as const;

type DirectEmission = typeof STYLE_EMISSION_MODE.direct;
type MirroredEmission = typeof STYLE_EMISSION_MODE.mirrored;
type TokenEmission = typeof STYLE_EMISSION_MODE.token;
type InterpolatedEmission = typeof STYLE_EMISSION_MODE.interpolated;
type CompensatedEmission = typeof STYLE_EMISSION_MODE.compensated;

type DirectOrMirroredEmission = DirectEmission | MirroredEmission;
type DirectOrTokenEmission = DirectEmission | TokenEmission;
type DirectMirroredOrTokenEmission = DirectOrMirroredEmission | TokenEmission;
type BoxColorEmission = DirectMirroredOrTokenEmission;
type BoxColorGradientEmission = DirectEmission | InterpolatedEmission;
type TextColorEmission = DirectOrMirroredEmission;

export type BorderWidthEmission = DirectMirroredOrTokenEmission;
export type BorderRadiusEmission = DirectMirroredOrTokenEmission;
export type BorderColorEmission = DirectMirroredOrTokenEmission;
export type BoxWidthEmission = DirectOrTokenEmission;
export type MarginLeftEmission = DirectOrMirroredEmission;
export type PaddingEmission = DirectMirroredOrTokenEmission | CompensatedEmission;
export type ShadowEmission = DirectOrTokenEmission;

export type ElementStyleEmissionPolicy = {
  boxColorEmission?: BoxColorEmission;
  boxColorGradientEmission?: BoxColorGradientEmission;
  textColorEmission?: TextColorEmission;
  borderWidthEmission?: BorderWidthEmission;
  borderRadiusEmission?: BorderRadiusEmission;
  borderColorEmission?: BorderColorEmission;
  boxWidthEmission?: BoxWidthEmission;
  marginLeftEmission?: MarginLeftEmission;
  paddingEmission?: PaddingEmission;
  shadowEmission?: ShadowEmission;
};

export type ResolvedElementStyleEmissionPolicy = {
  boxColorEmission?: BoxColorEmission;
  boxColorGradientEmission?: BoxColorGradientEmission;
  textColorEmission?: TextColorEmission;
  borderWidthEmission: BorderWidthEmission;
  borderRadiusEmission: BorderRadiusEmission;
  borderColorEmission: BorderColorEmission;
  boxWidthEmission?: BoxWidthEmission;
  marginLeftEmission?: MarginLeftEmission;
  paddingEmission: PaddingEmission;
  shadowEmission: ShadowEmission;
};

export type VariantStyleEmissionPolicy = {
  elements?: Record<string, ElementStyleEmissionPolicy>;
};

export type ComponentStyleEmissionPolicy = {
  // Legacy shape: component-wide element emission without variant isolation.
  // New work should prefer `variants.<name>.elements`.
  // This branch stays temporarily for legacy coverage and should be removed after that review.
  elements?: Record<string, ElementStyleEmissionPolicy>;
  variants?: Record<string, VariantStyleEmissionPolicy>;
};

export type WebStyleEmissionPolicy = {
  components?: Record<string, ComponentStyleEmissionPolicy>;
};

export const DEFAULT_WEB_STYLE_EMISSION_POLICY: WebStyleEmissionPolicy = {
  components: {
    button: {
      elements: {
        e1: {
          boxColorGradientEmission: 'interpolated',
          borderRadiusEmission: 'mirrored',
          borderWidthEmission: 'mirrored',
          paddingEmission: 'compensated'
        }
      }
    },
    textField: {
      elements: {
        e2: {
          marginLeftEmission: 'mirrored'
        },
        e3: {
          boxColorEmission: 'mirrored',
          textColorEmission: 'mirrored',
          borderWidthEmission: 'token',
          borderColorEmission: 'token'
        },
        e6: {
          boxColorEmission: 'token'
        }
      }
    },
    switch: {
      variants: {
        standard: {
          elements: {
            e2: {
              borderWidthEmission: 'mirrored',
              paddingEmission: 'compensated'
            }
          }
        }
      }
    },
    tabs: {
      elements: {
        e2: {
          boxWidthEmission: 'token',
          borderRadiusEmission: 'token',
          shadowEmission: 'token'
        },
        e5: {
          borderRadiusEmission: 'token',
          shadowEmission: 'token'
        }
      },
      variants: {
        bridge: {
          elements: {
            e1: {
              paddingEmission: 'token'
            },
            e2: {
              paddingEmission: 'token'
            }
          }
        },
        segmented: {
          elements: {
            e1: {
              borderColorEmission: 'mirrored',
              borderWidthEmission: 'mirrored',
              paddingEmission: 'compensated'
            }
          }
        }
      }
    }
  }
};

export const DEFAULT_ELEMENT_STYLE_EMISSION_POLICY: ResolvedElementStyleEmissionPolicy = {
  boxColorEmission: 'direct',
  boxColorGradientEmission: 'direct',
  textColorEmission: 'direct',
  borderRadiusEmission: 'mirrored',
  borderWidthEmission: 'direct',
  borderColorEmission: 'direct',
  boxWidthEmission: 'direct',
  marginLeftEmission: 'direct',
  paddingEmission: 'direct',
  shadowEmission: 'direct'
};

export function resolveElementStyleEmissionPolicy(
  webStyleEmissionPolicy: WebStyleEmissionPolicy | undefined,
  componentName: string,
  elementName: string,
  variantName?: string
): ResolvedElementStyleEmissionPolicy {
  const componentPolicy = webStyleEmissionPolicy?.components?.[componentName];
  const elementPolicy = componentPolicy?.elements?.[elementName];
  const variantElementPolicy = variantName
    ? componentPolicy?.variants?.[variantName]?.elements?.[elementName]
    : undefined;

  return {
    boxColorEmission:
      variantElementPolicy?.boxColorEmission ??
      elementPolicy?.boxColorEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.boxColorEmission,
    boxColorGradientEmission:
      variantElementPolicy?.boxColorGradientEmission ??
      elementPolicy?.boxColorGradientEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.boxColorGradientEmission,
    textColorEmission:
      variantElementPolicy?.textColorEmission ??
      elementPolicy?.textColorEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.textColorEmission,
    borderRadiusEmission:
      variantElementPolicy?.borderRadiusEmission ??
      elementPolicy?.borderRadiusEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.borderRadiusEmission,
    borderWidthEmission:
      variantElementPolicy?.borderWidthEmission ??
      elementPolicy?.borderWidthEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.borderWidthEmission,
    borderColorEmission:
      variantElementPolicy?.borderColorEmission ??
      elementPolicy?.borderColorEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.borderColorEmission,
    boxWidthEmission:
      variantElementPolicy?.boxWidthEmission ??
      elementPolicy?.boxWidthEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.boxWidthEmission,
    marginLeftEmission:
      variantElementPolicy?.marginLeftEmission ??
      elementPolicy?.marginLeftEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.marginLeftEmission,
    paddingEmission:
      variantElementPolicy?.paddingEmission ??
      elementPolicy?.paddingEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.paddingEmission,
    shadowEmission:
      variantElementPolicy?.shadowEmission ??
      elementPolicy?.shadowEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.shadowEmission
  };
}
