import type { ColorProperty } from '../types/colors/colors.types.ts';
import { getElementPaletteValidationIssues } from './palettes.ts';

export const isContractRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function validateContractKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
  issues: string[]
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) issues.push(`${path}.${key}: unrecognized key`);
  }
}

export function validateNamedElement(
  value: unknown,
  allowedKeys: readonly string[],
  path: string,
  issues: string[]
): value is Record<string, unknown> {
  if (!isContractRecord(value)) {
    issues.push(`${path}: expected object`);
    return false;
  }
  validateContractKeys(value, allowedKeys, path, issues);
  if (typeof value.name !== 'string' || value.name.trim().length === 0) {
    issues.push(`${path}.name: expected non-empty string`);
  }
  return true;
}

export function validateComponentScales(
  value: unknown,
  options: {
    allowedProperties: readonly string[];
    allowedScales: readonly string[];
    radiusModes?: readonly string[];
  },
  path: string,
  issues: string[]
): void {
  if (!isContractRecord(value)) {
    issues.push(`${path}: expected object`);
    return;
  }
  validateContractKeys(value, options.allowedProperties, path, issues);

  for (const [property, scaleMap] of Object.entries(value)) {
    if (property === 'borderRadius') {
      if (!isContractRecord(scaleMap)) {
        issues.push(`${path}.${property}: expected object`);
        continue;
      }
      validateContractKeys(scaleMap, options.radiusModes ?? [], `${path}.${property}`, issues);
      for (const [radius, radiusValue] of Object.entries(scaleMap)) {
        validateScaleValue(
          radiusValue,
          options.allowedScales,
          `${path}.${property}.${radius}`,
          issues
        );
      }
      continue;
    }
    validateScaleValue(scaleMap, options.allowedScales, `${path}.${property}`, issues);
  }
}

function validateScaleValue(
  value: unknown,
  allowedScales: readonly string[],
  path: string,
  issues: string[]
): void {
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (!isContractRecord(value)) {
    issues.push(`${path}: expected finite number or scale map`);
    return;
  }
  validateContractKeys(value, allowedScales, path, issues);
  for (const [scale, resolved] of Object.entries(value)) {
    if (typeof resolved === 'number' && Number.isFinite(resolved)) continue;
    if (!isContractRecord(resolved)) {
      issues.push(`${path}.${scale}: expected finite number or breakpoint map`);
      continue;
    }
    for (const [breakpoint, numberValue] of Object.entries(resolved)) {
      if (typeof numberValue !== 'number' || !Number.isFinite(numberValue)) {
        issues.push(`${path}.${scale}.${breakpoint}: expected finite number`);
      }
    }
  }
}

export function validateComponentPalettes(
  value: unknown,
  options: {
    allowedColors: readonly ColorProperty[];
    allowedIntents: readonly string[];
    allowedEmphases: readonly string[];
    allowedStates: readonly string[];
  },
  path: string,
  issues: string[]
): void {
  for (const issue of getElementPaletteValidationIssues(value, options.allowedColors)) {
    issues.push(
      `${issue.path.length > 0 ? `${path}.${issue.path.join('.')}` : path}: ${issue.message}`
    );
  }
  if (!isContractRecord(value)) return;

  for (const [segment, themes] of Object.entries(value)) {
    if (!isContractRecord(themes)) continue;
    for (const [theme, contexts] of Object.entries(themes)) {
      if (!isContractRecord(contexts)) continue;
      for (const [context, colors] of Object.entries(contexts)) {
        if (!isContractRecord(colors)) continue;
        for (const [colorProperty, intents] of Object.entries(colors)) {
          if (!isContractRecord(intents)) continue;
          for (const [intent, emphases] of Object.entries(intents)) {
            const intentPath = `${path}.${segment}.${theme}.${context}.${colorProperty}.${intent}`;
            if (!options.allowedIntents.includes(intent)) {
              issues.push(`${intentPath}: unrecognized intent`);
            }
            if (!isContractRecord(emphases)) continue;
            for (const [emphasis, states] of Object.entries(emphases)) {
              const statePath = `${intentPath}.${emphasis}`;
              if (!options.allowedEmphases.includes(emphasis)) {
                issues.push(`${statePath}: unrecognized emphasis`);
              }
              if (!isContractRecord(states)) continue;
              for (const state of Object.keys(states)) {
                if (!options.allowedStates.includes(state)) {
                  issues.push(`${statePath}.${state}: unrecognized state`);
                }
              }
              if (!Object.hasOwn(states, 'rest')) issues.push(`${statePath}.rest: required state`);
            }
          }
        }
      }
    }
  }
}
