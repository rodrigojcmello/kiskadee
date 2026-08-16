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
    return styleEmissionPolicy.boxWidthEmission === 'mirrored'
      ? 'm'
      : styleEmissionPolicy.boxWidthEmission === 'token'
        ? 't'
        : undefined;
  }

  if (styleKey.startsWith('boxHeight')) {
    return styleEmissionPolicy.boxHeightEmission === 'mirrored'
      ? 'm'
      : styleEmissionPolicy.boxHeightEmission === 'token'
        ? 't'
        : undefined;
  }

  if (styleKey.startsWith('marginTop')) {
    return styleEmissionPolicy.marginTopEmission === 'mirrored'
      ? 'm'
      : styleEmissionPolicy.marginTopEmission === 'token'
        ? 't'
        : undefined;
  }

  if (styleKey.startsWith('marginRight')) {
    return styleEmissionPolicy.marginRightEmission === 'mirrored'
      ? 'm'
      : styleEmissionPolicy.marginRightEmission === 'token'
        ? 't'
        : undefined;
  }

  if (styleKey.startsWith('marginBottom')) {
    return styleEmissionPolicy.marginBottomEmission === 'mirrored'
      ? 'm'
      : styleEmissionPolicy.marginBottomEmission === 'token'
        ? 't'
        : undefined;
  }

  if (styleKey.startsWith('marginLeft')) {
    return styleEmissionPolicy.marginLeftEmission === 'mirrored'
      ? 'm'
      : styleEmissionPolicy.marginLeftEmission === 'token'
        ? 't'
        : undefined;
  }

  if (styleKey.startsWith('paddingTop') || styleKey.startsWith('paddingBottom')) {
    return styleEmissionPolicy.paddingEmission === 'token'
      ? 't'
      : styleEmissionPolicy.paddingEmission === 'mirrored'
        ? 'm'
        : styleEmissionPolicy.paddingEmission === 'compensated'
          ? 'c'
          : undefined;
  }

  if (styleKey.startsWith('paddingLeft')) {
    const paddingLeftEmission =
      styleEmissionPolicy.paddingLeftEmission ?? styleEmissionPolicy.paddingEmission;
    return paddingLeftEmission === 'token'
      ? 't'
      : paddingLeftEmission === 'mirrored'
        ? 'm'
        : paddingLeftEmission === 'compensated'
          ? 'c'
          : undefined;
  }

  if (styleKey.startsWith('paddingRight')) {
    const paddingRightEmission =
      styleEmissionPolicy.paddingRightEmission ?? styleEmissionPolicy.paddingEmission;
    return paddingRightEmission === 'token'
      ? 't'
      : paddingRightEmission === 'mirrored'
        ? 'm'
        : paddingRightEmission === 'compensated'
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
  | 'boxWidth'
  | 'boxHeight'
  | 'marginTop'
  | 'marginRight'
  | 'marginBottom'
  | 'marginLeft'
  | 'paddingLeft'
  | 'paddingRight'
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

  if (styleKey.startsWith('boxWidth')) {
    return 'boxWidth';
  }

  if (styleKey.startsWith('boxHeight')) {
    return 'boxHeight';
  }

  if (styleKey.startsWith('marginTop')) {
    return 'marginTop';
  }

  if (styleKey.startsWith('marginRight')) {
    return 'marginRight';
  }

  if (styleKey.startsWith('marginBottom')) {
    return 'marginBottom';
  }

  if (styleKey.startsWith('marginLeft')) {
    return 'marginLeft';
  }

  if (styleKey.startsWith('paddingRight')) {
    return 'paddingRight';
  }

  if (styleKey.startsWith('paddingLeft')) {
    return 'paddingLeft';
  }

  if (styleKey.startsWith('paddingTop') || styleKey.startsWith('paddingBottom')) {
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

  if (family === 'boxWidth') {
    return { ...styleEmissionPolicy, boxWidthEmission: 'mirrored' };
  }

  if (family === 'boxHeight') {
    return { ...styleEmissionPolicy, boxHeightEmission: 'mirrored' };
  }

  if (family === 'marginTop') {
    return { ...styleEmissionPolicy, marginTopEmission: 'mirrored' };
  }

  if (family === 'marginRight') {
    return { ...styleEmissionPolicy, marginRightEmission: 'mirrored' };
  }

  if (family === 'marginBottom') {
    return { ...styleEmissionPolicy, marginBottomEmission: 'mirrored' };
  }

  if (family === 'marginLeft') {
    return { ...styleEmissionPolicy, marginLeftEmission: 'mirrored' };
  }

  if (family === 'padding') {
    return { ...styleEmissionPolicy, paddingEmission: 'mirrored' };
  }

  if (family === 'paddingRight') {
    return { ...styleEmissionPolicy, paddingRightEmission: 'mirrored' };
  }

  if (family === 'paddingLeft') {
    return { ...styleEmissionPolicy, paddingLeftEmission: 'mirrored' };
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
