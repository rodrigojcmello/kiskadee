import { validateElementForegroundContract } from '../foreground.contract.zod.ts';
import { type TextElementForeground, textForegroundValues } from '../foreground.ts';

export type TextElementName = 'e1';

export type TextForegroundElementStyle = {
  name: string;
  foreground: TextElementForeground;
};

export type TextElements = {
  e1: TextForegroundElementStyle;
};

const TEXT_COMPONENT_KEYS = ['elements'] as const;
const TEXT_ELEMENTS_KEYS = ['e1'] as const;
const TEXT_ELEMENT_KEYS = ['name', 'foreground'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateAllowedKeys(
  target: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  issues: string[]
): void {
  for (const key of Object.keys(target)) {
    if (!allowed.includes(key)) issues.push(`${path}.${key}: unrecognized key`);
  }
}

export function validateTextComponentContract(value: unknown, path = 'components.text'): string[] {
  const issues: string[] = [];
  if (!isRecord(value)) return [`${path}: expected object`];

  validateAllowedKeys(value, TEXT_COMPONENT_KEYS, path, issues);
  if (!isRecord(value.elements)) {
    issues.push(`${path}.elements: expected object`);
    return issues;
  }

  validateAllowedKeys(value.elements, TEXT_ELEMENTS_KEYS, `${path}.elements`, issues);
  const element = value.elements.e1;
  if (!isRecord(element)) {
    issues.push(`${path}.elements.e1: expected object`);
    return issues;
  }

  validateAllowedKeys(element, TEXT_ELEMENT_KEYS, `${path}.elements.e1`, issues);
  if (typeof element.name !== 'string' || element.name.trim().length === 0) {
    issues.push(`${path}.elements.e1.name: expected non-empty string`);
  }

  issues.push(
    ...validateElementForegroundContract(element.foreground, `${path}.elements.e1.foreground`)
  );
  if (isRecord(element.foreground)) {
    validateAllowedKeys(
      element.foreground,
      textForegroundValues,
      `${path}.elements.e1.foreground`,
      issues
    );
    if (typeof element.foreground.neutral !== 'string') {
      issues.push(`${path}.elements.e1.foreground.neutral: required reference`);
    }
  }

  return issues;
}
