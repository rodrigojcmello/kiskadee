import { validateElementSeparatorContract } from '../separator.contract.zod.ts';
import type { ElementSeparator } from '../separator.ts';

/**
 * Separator elements canonical mapping:
 * - e1: neutral line and generated thickness/color owner
 */
export type SeparatorElementName = 'e1';

export type SeparatorLineElementStyle = {
  name: string;
  separator: ElementSeparator;
};

export type SeparatorElements = {
  e1: SeparatorLineElementStyle;
};

const SEPARATOR_COMPONENT_KEYS = ['elements'] as const;
const SEPARATOR_ELEMENTS_KEYS = ['e1'] as const;
const SEPARATOR_ELEMENT_KEYS = ['name', 'separator'] as const;

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

export function validateSeparatorComponentContract(
  value: unknown,
  path = 'components.separator'
): string[] {
  const issues: string[] = [];
  if (!isRecord(value)) return [`${path}: expected object`];

  validateAllowedKeys(value, SEPARATOR_COMPONENT_KEYS, path, issues);
  if (!isRecord(value.elements)) {
    issues.push(`${path}.elements: expected object`);
    return issues;
  }

  validateAllowedKeys(value.elements, SEPARATOR_ELEMENTS_KEYS, `${path}.elements`, issues);
  const element = value.elements.e1;
  if (!isRecord(element)) {
    issues.push(`${path}.elements.e1: expected object`);
    return issues;
  }

  validateAllowedKeys(element, SEPARATOR_ELEMENT_KEYS, `${path}.elements.e1`, issues);
  if (typeof element.name !== 'string' || element.name.trim().length === 0) {
    issues.push(`${path}.elements.e1.name: expected non-empty string`);
  }
  issues.push(
    ...validateElementSeparatorContract(element.separator, `${path}.elements.e1.separator`)
  );

  return issues;
}
