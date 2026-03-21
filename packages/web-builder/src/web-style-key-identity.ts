import type { StyleKey } from '@kiskadee/core';
import {
  DEFAULT_BOX_MODEL_BUILD_POLICY,
  type ResolvedBoxModelBuildPolicy,
  resolveBoxModelBuildPolicy,
  type WebBuildPolicy
} from './web-build-policy';

export type WebStyleKeyIdentity = string;

const BOX_MODEL_POLICY_SEPARATOR = '@@wbp:';

function isBoxModelSensitiveStyleKey(styleKey: string): boolean {
  return (
    styleKey.startsWith('borderWidth') ||
    styleKey.startsWith('paddingTop') ||
    styleKey.startsWith('paddingRight') ||
    styleKey.startsWith('paddingBottom') ||
    styleKey.startsWith('paddingLeft')
  );
}

function serializeBoxModelBuildPolicy(policy: ResolvedBoxModelBuildPolicy): string {
  return `bw:${policy.borderWidthMode};pad:${policy.paddingMode}`;
}

export function buildWebStyleKeyIdentity(
  styleKey: StyleKey,
  boxModelPolicy: ResolvedBoxModelBuildPolicy
): WebStyleKeyIdentity {
  if (isBoxModelSensitiveStyleKey(styleKey) === false) {
    return styleKey;
  }

  const isDefaultPolicy =
    boxModelPolicy.borderWidthMode === DEFAULT_BOX_MODEL_BUILD_POLICY.borderWidthMode &&
    boxModelPolicy.paddingMode === DEFAULT_BOX_MODEL_BUILD_POLICY.paddingMode;

  if (isDefaultPolicy) {
    return styleKey;
  }

  return `${styleKey}${BOX_MODEL_POLICY_SEPARATOR}${serializeBoxModelBuildPolicy(boxModelPolicy)}`;
}

export function resolveWebStyleKeyIdentity(
  styleKey: StyleKey,
  webBuildPolicy: WebBuildPolicy | undefined,
  componentName: string,
  elementName: string
): WebStyleKeyIdentity {
  const boxModelPolicy = resolveBoxModelBuildPolicy(webBuildPolicy, componentName, elementName);
  return buildWebStyleKeyIdentity(styleKey, boxModelPolicy);
}
