import type { StyleKey } from '@kiskadee/core';
import {
  type ResolvedElementStyleEmissionPolicy,
  resolveElementStyleEmissionPolicy,
  type WebStyleEmissionPolicy
} from './web-build-policy.ts';

export type WebStyleKeyIdentity = string;
export type WebStyleIdentityOptimizationOptions = {
  collapseDirectIntoMirrored?: boolean;
};

const STYLE_KEY_MODE_SEPARATOR = '@@';
const MIRRORED_STYLE_KEY_IDENTITY_SUFFIX = `${STYLE_KEY_MODE_SEPARATOR}m`;

function resolveStyleKeyEmissionMode(
  styleKey: string,
  styleEmissionPolicy: ResolvedElementStyleEmissionPolicy
): 'm' | 't' | 'c' | 'i' | 'mi' | undefined {
  if (styleKey.startsWith('boxColor')) {
    const isMirrored = styleEmissionPolicy.boxColorEmission === 'mirrored';
    const isToken = styleEmissionPolicy.boxColorEmission === 'token';
    const isInterpolated = styleEmissionPolicy.boxColorGradientEmission === 'interpolated';
    if (isMirrored && isInterpolated) return 'mi';
    if (isMirrored) return 'm';
    if (isToken) return 't';
    return isInterpolated ? 'i' : undefined;
  }

  if (styleKey.startsWith('textColor')) {
    return styleEmissionPolicy.textColorEmission === 'mirrored' ? 'm' : undefined;
  }

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
    return styleEmissionPolicy.borderWidthEmission === 'mirrored'
      ? 'm'
      : styleEmissionPolicy.borderWidthEmission === 'token'
        ? 't'
        : undefined;
  }

  if (styleKey.startsWith('borderColor')) {
    return styleEmissionPolicy.borderColorEmission === 'mirrored'
      ? 'm'
      : styleEmissionPolicy.borderColorEmission === 'token'
        ? 't'
        : undefined;
  }

  if (styleKey.startsWith('boxWidth')) {
    return styleEmissionPolicy.boxWidthEmission === 'token' ? 't' : undefined;
  }

  if (styleKey.startsWith('marginLeft')) {
    return styleEmissionPolicy.marginLeftEmission === 'mirrored' ? 'm' : undefined;
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

function resolveStyleKeyEmissionFamily(
  styleKey: string
):
  | 'boxColor'
  | 'textColor'
  | 'borderRadius'
  | 'borderWidth'
  | 'borderColor'
  | 'marginLeft'
  | 'padding'
  | undefined {
  if (styleKey.startsWith('boxColor')) {
    return 'boxColor';
  }

  if (styleKey.startsWith('textColor')) {
    return 'textColor';
  }

  if (styleKey.startsWith('borderRadius')) {
    return 'borderRadius';
  }

  if (styleKey.startsWith('borderWidth')) {
    return 'borderWidth';
  }

  if (styleKey.startsWith('borderColor')) {
    return 'borderColor';
  }

  if (styleKey.startsWith('marginLeft')) {
    return 'marginLeft';
  }

  if (
    styleKey.startsWith('paddingTop') ||
    styleKey.startsWith('paddingRight') ||
    styleKey.startsWith('paddingBottom') ||
    styleKey.startsWith('paddingLeft')
  ) {
    return 'padding';
  }

  return undefined;
}

function hasIdentity(
  knownIdentities: Iterable<string> | Record<string, unknown>,
  identity: string
): boolean {
  if (knownIdentities instanceof Set) {
    return knownIdentities.has(identity);
  }

  if (Array.isArray(knownIdentities)) {
    return knownIdentities.includes(identity);
  }

  return identity in knownIdentities;
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

export function canonicalizeWebStyleKeyIdentity(
  localIdentity: WebStyleKeyIdentity,
  knownIdentities: Iterable<string> | Record<string, unknown>,
  options?: WebStyleIdentityOptimizationOptions
): WebStyleKeyIdentity {
  if (options?.collapseDirectIntoMirrored !== true) {
    return localIdentity;
  }

  if (hasIdentity(knownIdentities, localIdentity)) {
    return localIdentity;
  }

  if (localIdentity.includes(STYLE_KEY_MODE_SEPARATOR)) {
    return localIdentity;
  }

  const mirroredIdentity = `${localIdentity}${MIRRORED_STYLE_KEY_IDENTITY_SUFFIX}`;
  if (hasIdentity(knownIdentities, mirroredIdentity)) {
    return mirroredIdentity;
  }

  return localIdentity;
}

export function applyCanonicalStyleEmissionPolicy(
  styleKey: StyleKey,
  styleEmissionPolicy: ResolvedElementStyleEmissionPolicy,
  canonicalIdentity: WebStyleKeyIdentity,
  options?: WebStyleIdentityOptimizationOptions
): ResolvedElementStyleEmissionPolicy {
  if (options?.collapseDirectIntoMirrored !== true) {
    return styleEmissionPolicy;
  }

  if (canonicalIdentity !== `${styleKey}${MIRRORED_STYLE_KEY_IDENTITY_SUFFIX}`) {
    return styleEmissionPolicy;
  }

  const family = resolveStyleKeyEmissionFamily(styleKey);
  if (family === 'borderRadius') {
    return { ...styleEmissionPolicy, borderRadiusEmission: 'mirrored' };
  }

  if (family === 'boxColor') {
    return { ...styleEmissionPolicy, boxColorEmission: 'mirrored' };
  }

  if (family === 'textColor') {
    return { ...styleEmissionPolicy, textColorEmission: 'mirrored' };
  }

  if (family === 'borderWidth') {
    return { ...styleEmissionPolicy, borderWidthEmission: 'mirrored' };
  }

  if (family === 'borderColor') {
    return { ...styleEmissionPolicy, borderColorEmission: 'mirrored' };
  }

  if (family === 'marginLeft') {
    return { ...styleEmissionPolicy, marginLeftEmission: 'mirrored' };
  }

  if (family === 'padding') {
    return { ...styleEmissionPolicy, paddingEmission: 'mirrored' };
  }

  return styleEmissionPolicy;
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
