import {
  type ColorProperty,
  interactionStateKeys,
  surfaceContexts
} from '../types/colors/colors.types.ts';

export type ElementPaletteValidationIssue = {
  path: string[];
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getCoveragePairs(
  colorMap: Record<string, unknown>,
  allowedColorKeys: readonly string[]
): Set<string> {
  const pairs = new Set<string>();

  for (const colorProperty of allowedColorKeys) {
    const colorEntry = colorMap[colorProperty];
    if (!isRecord(colorEntry)) continue;

    if (Object.keys(colorEntry).some((key) => interactionStateKeys.includes(key as never))) {
      pairs.add(colorProperty);
      continue;
    }

    for (const [intent, emphasisMap] of Object.entries(colorEntry)) {
      if (!isRecord(emphasisMap)) continue;
      for (const emphasis of Object.keys(emphasisMap)) {
        pairs.add(`${colorProperty}.${intent}.${emphasis}`);
      }
    }
  }

  return pairs;
}

function validateColorMap(
  value: unknown,
  allowedColorKeys: readonly string[],
  path: string[],
  issues: ElementPaletteValidationIssue[]
): value is Record<string, unknown> {
  if (!isRecord(value)) {
    issues.push({ path, message: 'expected object' });
    return false;
  }

  for (const key of Object.keys(value)) {
    if (!allowedColorKeys.includes(key)) {
      issues.push({ path: [...path, key], message: 'unrecognized key' });
    }
  }

  for (const colorProperty of allowedColorKeys) {
    const colorEntry = value[colorProperty];
    if (colorEntry === undefined) continue;
    if (!isRecord(colorEntry)) {
      issues.push({ path: [...path, colorProperty], message: 'expected object' });
      continue;
    }

    const isDirectStateMap = Object.keys(colorEntry).some((key) =>
      interactionStateKeys.includes(key as never)
    );
    if (isDirectStateMap) {
      if (colorEntry.rest === undefined) {
        issues.push({ path: [...path, colorProperty, 'rest'], message: 'required state' });
      }
      continue;
    }

    for (const [intent, emphasisMap] of Object.entries(colorEntry)) {
      if (!isRecord(emphasisMap)) {
        issues.push({ path: [...path, colorProperty, intent], message: 'expected object' });
        continue;
      }
      for (const [emphasis, stateMap] of Object.entries(emphasisMap)) {
        if (!isRecord(stateMap)) {
          issues.push({
            path: [...path, colorProperty, intent, emphasis],
            message: 'expected object'
          });
          continue;
        }
        if (stateMap.rest === undefined) {
          issues.push({
            path: [...path, colorProperty, intent, emphasis, 'rest'],
            message: 'required state'
          });
        }
      }
    }
  }

  return true;
}

/**
 * What
 *     Validates the segment, theme, and surface-context palette hierarchy.
 * Why
 *     Every component contract must reject the legacy theme-to-color shape consistently.
 */
export function getElementPaletteValidationIssues(
  value: unknown,
  allowedColorKeys: readonly ColorProperty[]
): ElementPaletteValidationIssue[] {
  const issues: ElementPaletteValidationIssue[] = [];

  if (!isRecord(value)) {
    return [{ path: [], message: 'expected object' }];
  }

  for (const [segment, byTheme] of Object.entries(value)) {
    if (!isRecord(byTheme)) {
      issues.push({ path: [segment], message: 'expected object' });
      continue;
    }

    for (const [theme, bySurfaceContext] of Object.entries(byTheme)) {
      const themePath = [segment, theme];
      if (!isRecord(bySurfaceContext)) {
        issues.push({ path: themePath, message: 'expected object' });
        continue;
      }

      for (const context of Object.keys(bySurfaceContext)) {
        if (!surfaceContexts.includes(context as never)) {
          issues.push({
            path: [...themePath, context],
            message: 'unrecognized surface context'
          });
        }
      }

      if (!Object.hasOwn(bySurfaceContext, 'onSubtle')) {
        issues.push({
          path: [...themePath, 'onSubtle'],
          message: 'required surface context'
        });
        continue;
      }

      const onSubtlePath = [...themePath, 'onSubtle'];
      const onSubtleColorMap = bySurfaceContext.onSubtle;
      const onSubtleIsValid = validateColorMap(
        onSubtleColorMap,
        allowedColorKeys,
        onSubtlePath,
        issues
      );

      if (!Object.hasOwn(bySurfaceContext, 'onVivid')) continue;

      const onVividPath = [...themePath, 'onVivid'];
      const onVividColorMap = bySurfaceContext.onVivid;
      const onVividIsValid = validateColorMap(
        onVividColorMap,
        allowedColorKeys,
        onVividPath,
        issues
      );

      if (!onSubtleIsValid || !onVividIsValid) continue;

      const onSubtlePairs = getCoveragePairs(onSubtleColorMap, allowedColorKeys);
      const onVividPairs = getCoveragePairs(onVividColorMap, allowedColorKeys);

      for (const pair of onSubtlePairs) {
        if (!onVividPairs.has(pair)) {
          issues.push({
            path: [...onVividPath, ...pair.split('.')],
            message: 'must cover the same property, intent, and emphasis as onSubtle'
          });
        }
      }

      for (const pair of onVividPairs) {
        if (!onSubtlePairs.has(pair)) {
          issues.push({
            path: [...onVividPath, ...pair.split('.')],
            message: 'must not add a property, intent, or emphasis absent from onSubtle'
          });
        }
      }
    }
  }

  return issues;
}
