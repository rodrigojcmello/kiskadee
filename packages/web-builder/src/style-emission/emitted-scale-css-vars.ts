import type { ScaleProperty } from '@kiskadee/core';

/**
 * Canonical CSS custom properties emitted from scale properties for structural consumption.
 */
export const EMITTED_SCALE_CSS_VARS = {
  borderWidth: '--k-bdw',
  borderRadius: '--k-bdr',
  boxWidth: '--k-bxw',
  boxHeight: '--k-bxh',
  marginTop: '--k-mgt',
  marginRight: '--k-mgr',
  marginBottom: '--k-mgb',
  marginLeft: '--k-mgl',
  paddingTop: '--k-pdt',
  paddingRight: '--k-pdr',
  paddingBottom: '--k-pdb',
  paddingLeft: '--k-pdl'
} as const;

const EMITTED_SCALE_CSS_VAR_BY_PROPERTY = {
  borderWidth: EMITTED_SCALE_CSS_VARS.borderWidth,
  borderRadius: EMITTED_SCALE_CSS_VARS.borderRadius,
  borderRadiusRounded: EMITTED_SCALE_CSS_VARS.borderRadius,
  borderRadiusPill: EMITTED_SCALE_CSS_VARS.borderRadius,
  borderRadiusSquare: EMITTED_SCALE_CSS_VARS.borderRadius,
  boxWidth: EMITTED_SCALE_CSS_VARS.boxWidth,
  boxHeight: EMITTED_SCALE_CSS_VARS.boxHeight,
  marginTop: EMITTED_SCALE_CSS_VARS.marginTop,
  marginRight: EMITTED_SCALE_CSS_VARS.marginRight,
  marginBottom: EMITTED_SCALE_CSS_VARS.marginBottom,
  marginLeft: EMITTED_SCALE_CSS_VARS.marginLeft,
  paddingTop: EMITTED_SCALE_CSS_VARS.paddingTop,
  paddingRight: EMITTED_SCALE_CSS_VARS.paddingRight,
  paddingBottom: EMITTED_SCALE_CSS_VARS.paddingBottom,
  paddingLeft: EMITTED_SCALE_CSS_VARS.paddingLeft
} as const satisfies Partial<Record<ScaleProperty, string>>;

/**
 * What
 *     Resolves the canonical CSS custom property emitted for one scale property.
 * Why
 *     CSS generation and structural projection validation must share one collision identity.
 */
export function resolveEmittedScaleCssVar(property: ScaleProperty): string | undefined {
  return EMITTED_SCALE_CSS_VAR_BY_PROPERTY[
    property as keyof typeof EMITTED_SCALE_CSS_VAR_BY_PROPERTY
  ];
}
