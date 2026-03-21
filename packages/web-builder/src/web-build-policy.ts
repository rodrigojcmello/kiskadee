export type BorderWidthMode = 'raw' | 'var';
export type PaddingMode = 'raw' | 'compensated';

export type BoxModelBuildPolicy = {
  borderWidthMode?: BorderWidthMode;
  paddingMode?: PaddingMode;
};

export type ResolvedBoxModelBuildPolicy = {
  borderWidthMode: BorderWidthMode;
  paddingMode: PaddingMode;
};

export type ComponentWebBuildPolicy = {
  elements?: Record<string, BoxModelBuildPolicy>;
};

export type WebBuildPolicy = {
  components?: Record<string, ComponentWebBuildPolicy>;
};

export const DEFAULT_WEB_BUILD_POLICY: WebBuildPolicy = {
  components: {
    button: {
      elements: {
        e1: {
          borderWidthMode: 'var',
          paddingMode: 'compensated'
        }
      }
    }
  }
};

export const DEFAULT_BOX_MODEL_BUILD_POLICY: ResolvedBoxModelBuildPolicy = {
  borderWidthMode: 'raw',
  paddingMode: 'raw'
};

export function resolveBoxModelBuildPolicy(
  webBuildPolicy: WebBuildPolicy | undefined,
  componentName: string,
  elementName: string
): ResolvedBoxModelBuildPolicy {
  const elementPolicy = webBuildPolicy?.components?.[componentName]?.elements?.[elementName];

  return {
    borderWidthMode:
      elementPolicy?.borderWidthMode ?? DEFAULT_BOX_MODEL_BUILD_POLICY.borderWidthMode,
    paddingMode:
      elementPolicy?.paddingMode ?? DEFAULT_BOX_MODEL_BUILD_POLICY.paddingMode
  };
}
