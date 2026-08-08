import type { ComponentStyleKeyMap, StyleKey } from '@kiskadee/core';
import type { WebStyleEmissionPolicy } from '../style-emission/web-build-policy.ts';
import { resolveWebStyleKeyIdentity } from '../style-emission/web-style-key-identity.ts';

export type StyleKeyUsageMap = Record<string, number>;

function collapseRawUsageIntoMirroredUsage(usage: StyleKeyUsageMap): StyleKeyUsageMap {
  const collapsedUsage: StyleKeyUsageMap = {};

  for (const [identity, count] of Object.entries(usage)) {
    const mirroredIdentity = `${identity}@@m`;
    const shouldCollapseIntoMirrored = !identity.includes('@@') && usage[mirroredIdentity] != null;
    const targetIdentity = shouldCollapseIntoMirrored ? mirroredIdentity : identity;

    collapsedUsage[targetIdentity] = (collapsedUsage[targetIdentity] ?? 0) + count;
  }

  return collapsedUsage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasElementStyleShape(value: Record<string, unknown>): boolean {
  return (
    'decorations' in value ||
    'effects' in value ||
    'scales' in value ||
    'radiusScales' in value ||
    'palettes' in value
  );
}

function isElementMap(value: unknown): value is Record<string, any> {
  if (!isRecord(value)) return false;
  const entries = Object.entries(value);
  if (entries.length === 0) return false;
  return entries.every(
    ([key, item]) => isRecord(item) && (/^e\d+$/.test(key) || hasElementStyleShape(item))
  );
}

function isNestedVariantModeMap(value: unknown): value is Record<string, Record<string, any>> {
  if (!isRecord(value)) return false;
  const first = Object.values(value).find(Boolean);
  if (!isRecord(first)) return false;
  return isElementMap(first);
}

export function mapStyleKeyUsage(
  styleKeysByComponent: ComponentStyleKeyMap,
  options?: {
    webStyleEmissionPolicy?: WebStyleEmissionPolicy;
    collapseDirectIntoMirrored?: boolean;
    additionalStyleKeys?: readonly StyleKey[];
  }
): StyleKeyUsageMap {
  const usage: StyleKeyUsageMap = {};

  const increment = (key: string): void => {
    usage[key] = (usage[key] ?? 0) + 1;
  };

  const consumeElements = (
    componentName: string,
    elements: Record<string, any>,
    variantName?: string
  ) => {
    for (const [elementName, element] of Object.entries(elements)) {
      if (!element) continue;
      const resolveKey = (key: StyleKey) =>
        resolveWebStyleKeyIdentity(
          key,
          options?.webStyleEmissionPolicy,
          componentName,
          elementName,
          variantName
        );

      // 1) decorations
      if (Array.isArray(element.decorations)) {
        for (const key of element.decorations) {
          if (typeof key === 'string') increment(resolveKey(key));
        }
      }

      // 2) effects (by interaction state)
      for (const keys of Object.values((element.effects ?? {}) as Record<string, unknown>)) {
        if (!Array.isArray(keys)) continue;
        for (const key of keys) {
          if (typeof key === 'string') increment(resolveKey(key));
        }
      }

      // 3) scales (by size/responsiveness)
      for (const keys of Object.values((element.scales ?? {}) as Record<string, unknown>)) {
        if (!Array.isArray(keys)) continue;
        for (const key of keys) {
          if (typeof key === 'string') increment(resolveKey(key));
        }
      }

      // 3.1) radius scales (by radius mode, size/responsiveness)
      for (const bySize of Object.values((element.radiusScales ?? {}) as Record<string, unknown>)) {
        if (!isRecord(bySize)) continue;
        for (const keys of Object.values(bySize)) {
          if (!Array.isArray(keys)) continue;
          for (const key of keys) {
            if (typeof key === 'string') increment(resolveKey(key));
          }
        }
      }

      // 4) palettes (by segment / theme / surface context / semantic color / interaction state)
      for (const themes of Object.values(element.palettes ?? {})) {
        if (!themes) continue;
        for (const surfaceContexts of Object.values(themes)) {
          if (!surfaceContexts) continue;
          for (const semanticColors of Object.values(surfaceContexts)) {
            if (!semanticColors) continue;
            for (const interactionStates of Object.values(semanticColors)) {
              if (!interactionStates) continue;
              for (const keys of Object.values(interactionStates)) {
                if (!Array.isArray(keys)) continue;
                for (const key of keys) {
                  if (typeof key === 'string') increment(resolveKey(key));
                }
              }
            }
          }
        }
      }
    }
  };

  // Iterate over each component
  for (const [componentName, elements] of Object.entries(styleKeysByComponent)) {
    if (!elements) continue;

    if (isElementMap(elements)) {
      consumeElements(componentName, elements);
      continue;
    }

    for (const [variantName, variantElements] of Object.entries(elements as Record<string, any>)) {
      if (!variantElements) continue;
      if (isElementMap(variantElements)) {
        consumeElements(componentName, variantElements, variantName);
        continue;
      }

      if (!isNestedVariantModeMap(variantElements)) continue;
      for (const modeElements of Object.values(variantElements)) {
        if (!modeElements || !isElementMap(modeElements)) continue;
        consumeElements(componentName, modeElements, variantName);
      }
    }
  }

  // Global catalogs may expose atomic utilities that are real artifact consumers even when no
  // component references a definition yet. Count each occurrence so shared values still receive
  // the shortest available class identities.
  for (const styleKey of options?.additionalStyleKeys ?? []) {
    increment(styleKey);
  }

  const collapsedUsage =
    options?.collapseDirectIntoMirrored === true ? collapseRawUsageIntoMirroredUsage(usage) : usage;

  // Sort entries: first by descending count, then by key alphabetically
  const sortedEntries = Object.entries(collapsedUsage).sort(([keyA, countA], [keyB, countB]) => {
    if (countB !== countA) {
      return countB - countA;
    }
    return keyA.localeCompare(keyB);
  });

  // Build a new object with sorted order
  const sortedUsage: StyleKeyUsageMap = {};
  for (const [key, count] of sortedEntries) {
    sortedUsage[key] = count;
  }

  return sortedUsage;
}
