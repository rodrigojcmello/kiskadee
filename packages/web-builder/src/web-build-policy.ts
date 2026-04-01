export type BorderWidthEmission = 'direct' | 'mirrored';
export type BorderRadiusEmission = 'direct' | 'mirrored' | 'token';
export type PaddingEmission = 'direct' | 'compensated';
export type ShadowEmission = 'direct' | 'token';

export type ElementStyleEmissionPolicy = {
  borderWidthEmission?: BorderWidthEmission;
  borderRadiusEmission?: BorderRadiusEmission;
  paddingEmission?: PaddingEmission;
  shadowEmission?: ShadowEmission;
};

export type ResolvedElementStyleEmissionPolicy = {
  borderWidthEmission: BorderWidthEmission;
  borderRadiusEmission: BorderRadiusEmission;
  paddingEmission: PaddingEmission;
  shadowEmission: ShadowEmission;
};

export type ComponentStyleEmissionPolicy = {
  elements?: Record<string, ElementStyleEmissionPolicy>;
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
          borderRadiusEmission: 'token',
          shadowEmission: 'token'
        },
        e5: {
          borderRadiusEmission: 'token',
          shadowEmission: 'token'
        },
        e7: {
          borderRadiusEmission: 'direct'
        }
      }
    }
  }
};

export const DEFAULT_ELEMENT_STYLE_EMISSION_POLICY: ResolvedElementStyleEmissionPolicy = {
  borderRadiusEmission: 'mirrored',
  borderWidthEmission: 'direct',
  paddingEmission: 'direct',
  shadowEmission: 'direct'
};

export function resolveElementStyleEmissionPolicy(
  webStyleEmissionPolicy: WebStyleEmissionPolicy | undefined,
  componentName: string,
  elementName: string
): ResolvedElementStyleEmissionPolicy {
  const elementPolicy = webStyleEmissionPolicy?.components?.[componentName]?.elements?.[elementName];

  return {
    borderRadiusEmission:
      elementPolicy?.borderRadiusEmission ?? DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.borderRadiusEmission,
    borderWidthEmission:
      elementPolicy?.borderWidthEmission ?? DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.borderWidthEmission,
    paddingEmission:
      elementPolicy?.paddingEmission ?? DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.paddingEmission,
    shadowEmission:
      elementPolicy?.shadowEmission ?? DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.shadowEmission
  };
}
