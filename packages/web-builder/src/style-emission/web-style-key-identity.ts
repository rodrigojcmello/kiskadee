import type { StyleKey } from '@kiskadee/core';
import {
  type ResolvedElementStyleEmissionPolicy,
  resolveElementStyleEmissionPolicy,
  type WebStyleEmissionPolicy
} from './web-build-policy';

export type WebStyleKeyIdentity = string;

const STYLE_KEY_MODE_SEPARATOR = '@@';

function resolveStyleKeyEmissionMode(
  styleKey: string,
  styleEmissionPolicy: ResolvedElementStyleEmissionPolicy
): 'm' | 't' | 'c' | undefined {
  if (styleKey.startsWith('shadow')) {
    return styleEmissionPolicy.shadowEmission === 'token' ? 't' : undefined;
  }

  if (styleKey.startsWith('borderRadius')) {
    return styleEmissionPolicy.borderRadiusEmission === 'mirrored'
      ? 'm'
      : styleEmissionPolicy.borderRadiusEmission === 'token'
        ? 't'
        : undefined;
  }

  if (styleKey.startsWith('borderWidth')) {
    return styleEmissionPolicy.borderWidthEmission === 'mirrored' ? 'm' : undefined;
  }

  if (styleKey.startsWith('borderColor')) {
    return styleEmissionPolicy.borderColorEmission === 'mirrored' ? 'm' : undefined;
  }

  if (styleKey.startsWith('boxWidth')) {
    return styleEmissionPolicy.boxWidthEmission === 'token' ? 't' : undefined;
  }

  if (
    styleKey.startsWith('paddingTop') ||
    styleKey.startsWith('paddingRight') ||
    styleKey.startsWith('paddingBottom') ||
    styleKey.startsWith('paddingLeft')
  ) {
    return styleEmissionPolicy.paddingEmission === 'token'
      ? 't'
      : styleEmissionPolicy.paddingEmission === 'mirrored'
      ? 'm'
      : styleEmissionPolicy.paddingEmission === 'compensated'
        ? 'c'
        : undefined;
  }

  return undefined;
}

export function buildWebStyleKeyIdentity(
  styleKey: StyleKey,
  styleEmissionPolicy: ResolvedElementStyleEmissionPolicy
): WebStyleKeyIdentity {
  const emissionMode = resolveStyleKeyEmissionMode(styleKey, styleEmissionPolicy);
  if (!emissionMode) {
    return styleKey;
  }

  return `${styleKey}${STYLE_KEY_MODE_SEPARATOR}${emissionMode}`;
}

export function resolveWebStyleKeyIdentity(
  styleKey: StyleKey,
  webStyleEmissionPolicy: WebStyleEmissionPolicy | undefined,
  componentName: string,
  elementName: string,
  variantName?: string
): WebStyleKeyIdentity {
  const styleEmissionPolicy = resolveElementStyleEmissionPolicy(
    webStyleEmissionPolicy,
    componentName,
    elementName,
    variantName
  );
  return buildWebStyleKeyIdentity(styleKey, styleEmissionPolicy);
}
