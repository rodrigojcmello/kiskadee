import {
  type ColorProperty,
  colorVariants,
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
  issues: ElementPaletteValidationIssue[],
  requireRest: boolean
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
      if (requireRest && colorEntry.rest === undefined) {
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
        if (requireRest && stateMap.rest === undefined) {
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

/** Validates required Standard palettes and sparse, independently authored Alternative leaves. */
export function getElementPaletteValidationIssues(
  value: unknown,
  allowedColorKeys: readonly ColorProperty[],
  options: { requireRest?: boolean } = {}
): ElementPaletteValidationIssue[] {
  const issues: ElementPaletteValidationIssue[] = [];
  if (!isRecord(value)) return [{ path: [], message: 'expected object' }];
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
      if (!Object.hasOwn(bySurfaceContext, 'onSubtle')) {
        issues.push({ path: [...themePath, 'onSubtle'], message: 'required surface context' });
      }
      const standards: Partial<Record<'onSubtle' | 'onVivid', Record<string, unknown>>> = {};
      for (const [context, variants] of Object.entries(bySurfaceContext)) {
        const contextPath = [...themePath, context];
        if (!surfaceContexts.includes(context as never)) {
          issues.push({ path: contextPath, message: 'unrecognized surface context' });
          continue;
        }
        if (!isRecord(variants)) {
          issues.push({ path: contextPath, message: 'expected object' });
          continue;
        }
        if (!Object.hasOwn(variants, 'standard')) {
          issues.push({ path: [...contextPath, 'standard'], message: 'required color variant' });
        }
        for (const [variant, colors] of Object.entries(variants)) {
          if (!colorVariants.includes(variant as never)) {
            issues.push({ path: [...contextPath, variant], message: 'unrecognized color variant' });
            continue;
          }
          const valid = validateColorMap(
            colors,
            allowedColorKeys,
            [...contextPath, variant],
            issues,
            options.requireRest !== false
          );
          if (valid && variant === 'standard')
            standards[context as 'onSubtle' | 'onVivid'] = colors;
        }
      }
      if (!standards.onSubtle || !standards.onVivid) continue;
      const subtle = getCoveragePairs(standards.onSubtle, allowedColorKeys);
      const vivid = getCoveragePairs(standards.onVivid, allowedColorKeys);
      for (const pair of subtle) {
        if (!vivid.has(pair))
          issues.push({
            path: [...themePath, 'onVivid', 'standard', ...pair.split('.')],
            message: 'must cover the same property, intent, and emphasis as onSubtle'
          });
      }
      for (const pair of vivid) {
        if (!subtle.has(pair))
          issues.push({
            path: [...themePath, 'onVivid', 'standard', ...pair.split('.')],
            message: 'must not add a property, intent, or emphasis absent from onSubtle'
          });
      }
    }
  }
  return issues;
}
