export type BorderWidthEmission = 'direct' | 'mirrored';
export type BorderRadiusEmission = 'direct' | 'mirrored' | 'token';
export type BoxWidthEmission = 'direct' | 'token';
export type PaddingEmission = 'direct' | 'mirrored' | 'token' | 'compensated';
export type ShadowEmission = 'direct' | 'token';

export type ElementStyleEmissionPolicy = {
  borderWidthEmission?: BorderWidthEmission;
  borderRadiusEmission?: BorderRadiusEmission;
  boxWidthEmission?: BoxWidthEmission;
  paddingEmission?: PaddingEmission;
  shadowEmission?: ShadowEmission;
};

export type ResolvedElementStyleEmissionPolicy = {
  borderWidthEmission: BorderWidthEmission;
  borderRadiusEmission: BorderRadiusEmission;
  boxWidthEmission?: BoxWidthEmission;
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
          borderRadiusEmission: 'mirrored',
          borderWidthEmission: 'mirrored',
          paddingEmission: 'compensated'
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
              borderWidthEmission: 'mirrored',
              borderRadiusEmission: 'mirrored',
              paddingEmission: 'compensated'
            }
          }
        }
      }
    }
  }
};

export const DEFAULT_ELEMENT_STYLE_EMISSION_POLICY: ResolvedElementStyleEmissionPolicy = {
  borderRadiusEmission: 'mirrored',
  borderWidthEmission: 'direct',
  boxWidthEmission: 'direct',
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
    borderRadiusEmission:
      variantElementPolicy?.borderRadiusEmission ??
      elementPolicy?.borderRadiusEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.borderRadiusEmission,
    borderWidthEmission:
      variantElementPolicy?.borderWidthEmission ??
      elementPolicy?.borderWidthEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.borderWidthEmission,
    boxWidthEmission:
      variantElementPolicy?.boxWidthEmission ??
      elementPolicy?.boxWidthEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.boxWidthEmission,
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
