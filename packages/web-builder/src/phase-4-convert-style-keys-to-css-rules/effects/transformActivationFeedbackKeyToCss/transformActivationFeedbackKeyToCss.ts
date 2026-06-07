import {
  type ActivationFeedbackEffectSchema,
  type ActivationFeedbackMotionCurveToken,
  resolveActivationFeedbackConfig,
  resolveActivationFeedbackDurationMs
} from '@kiskadee/core';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';

const CURVE_TOKEN_TO_CSS: Record<ActivationFeedbackMotionCurveToken, string> = {
  'motion.standard.out': 'ease-out',
  'motion.emphasized.out': 'cubic-bezier(0.2, 0, 0.2, 1)'
};

function parseActivationFeedbackValue(styleKey: string): ActivationFeedbackEffectSchema {
  const match = styleKey.match(/^activationFeedback__(.+)$/);

  if (!match) {
    throw new Error(UNSUPPORTED_PROPERTY_NAME('activationFeedback', styleKey));
  }

  const rawValue = match[1];
  if (!rawValue.startsWith('{')) {
    throw new Error(UNSUPPORTED_VALUE('activationFeedback', rawValue, styleKey));
  }

  try {
    return JSON.parse(rawValue) as ActivationFeedbackEffectSchema;
  } catch {
    throw new Error(UNSUPPORTED_VALUE('activationFeedback', rawValue, styleKey));
  }
}

function toCssCurve(token: ActivationFeedbackMotionCurveToken): string {
  return CURVE_TOKEN_TO_CSS[token] ?? 'ease-out';
}

export function transformActivationFeedbackKeyToCss(styleKey: string, className: string): string {
  const resolved = resolveActivationFeedbackConfig(parseActivationFeedbackValue(styleKey));
  const fadeDuration = resolveActivationFeedbackDurationMs(resolved.fadeDurationToken, 360);

  return `.${className} { --k-af-color: var(--k-af-token-color, var(--k-focus-color, currentColor)); --k-af-opacity: var(--k-af-token-opacity, 0.16); --k-af-thickness: ${resolved.thickness}px; --k-af-fade-duration: ${fadeDuration}ms; --k-af-ease: ${toCssCurve(resolved.curveToken)}; }`;
}
