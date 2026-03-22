export type BorderWidthMode = 'raw' | 'var';
export type BorderRadiusMode = 'raw' | 'var';
export type PaddingMode = 'raw' | 'compensated';

export type BoxModelBuildPolicy = {
  borderWidthMode?: BorderWidthMode;
  borderRadiusMode?: BorderRadiusMode;
  paddingMode?: PaddingMode;
};

export type ResolvedBoxModelBuildPolicy = {
  borderWidthMode: BorderWidthMode;
  borderRadiusMode: BorderRadiusMode;
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
          borderRadiusMode: 'var',
          borderWidthMode: 'var',
          paddingMode: 'compensated'
        }
      }
    }
  }
};

export const DEFAULT_BOX_MODEL_BUILD_POLICY: ResolvedBoxModelBuildPolicy = {
  borderRadiusMode: 'raw',
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
    borderRadiusMode:
      elementPolicy?.borderRadiusMode ?? DEFAULT_BOX_MODEL_BUILD_POLICY.borderRadiusMode,
    borderWidthMode:
      elementPolicy?.borderWidthMode ?? DEFAULT_BOX_MODEL_BUILD_POLICY.borderWidthMode,
    paddingMode:
      elementPolicy?.paddingMode ?? DEFAULT_BOX_MODEL_BUILD_POLICY.paddingMode
  };
}
