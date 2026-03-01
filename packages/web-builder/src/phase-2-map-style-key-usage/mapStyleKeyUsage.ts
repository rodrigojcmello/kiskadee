import type { ComponentStyleKeyMap, StyleKey } from '@kiskadee/core';

export type StyleKeyUsageMap = Record<StyleKey, number>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isElementMap(value: unknown): value is Record<string, any> {
  if (!isRecord(value)) return false;
  const first = Object.values(value).find(Boolean);
  if (!isRecord(first)) return false;
  const elementKeys = ['decorations', 'effects', 'scales', 'radiusScales', 'palettes'];
  return elementKeys.some((key) => key in first);
}

export function mapStyleKeyUsage(styleKeysByComponent: ComponentStyleKeyMap): StyleKeyUsageMap {
  const usage: StyleKeyUsageMap = {};

  const increment = (key: StyleKey): void => {
    usage[key] = (usage[key] ?? 0) + 1;
  };

  const consumeElements = (elements: Record<string, any>) => {
    for (const element of Object.values(elements)) {
      if (!element) continue;
      // 1) decorations
      if (Array.isArray(element.decorations)) {
        for (const key of element.decorations) {
          if (typeof key === 'string') increment(key);
        }
      }

      // 2) effects (by interaction state)
      for (const keys of Object.values((element.effects ?? {}) as Record<string, unknown>)) {
        if (!Array.isArray(keys)) continue;
        for (const key of keys) {
          if (typeof key === 'string') increment(key);
        }
      }

      // 3) scales (by size/responsiveness)
      for (const keys of Object.values((element.scales ?? {}) as Record<string, unknown>)) {
        if (!Array.isArray(keys)) continue;
        for (const key of keys) {
          if (typeof key === 'string') increment(key);
        }
      }

      // 3.1) radius scales (by radius mode, size/responsiveness)
      for (const bySize of Object.values((element.radiusScales ?? {}) as Record<string, unknown>)) {
        if (!isRecord(bySize)) continue;
        for (const keys of Object.values(bySize)) {
          if (!Array.isArray(keys)) continue;
          for (const key of keys) {
            if (typeof key === 'string') increment(key);
          }
        }
      }

      // 4) palettes (by segment / theme / semantic color / interaction state)
      for (const themes of Object.values(element.palettes ?? {})) {
        if (!themes) continue;
        for (const semanticColors of Object.values(themes)) {
          if (!semanticColors) continue;
          for (const interactionStates of Object.values(semanticColors)) {
            if (!interactionStates) continue;
            for (const keys of Object.values(interactionStates)) {
              if (!Array.isArray(keys)) continue;
              for (const key of keys) {
                if (typeof key === 'string') increment(key);
              }
            }
          }
        }
      }
    }
  };

  // Iterate over each component
  for (const elements of Object.values(styleKeysByComponent)) {
    if (!elements) continue;

    if (isElementMap(elements)) {
      consumeElements(elements);
      continue;
    }

    for (const variantElements of Object.values(elements as Record<string, any>)) {
      if (!variantElements) continue;
      if (isElementMap(variantElements)) {
        consumeElements(variantElements);
      }
    }
  }

  // Sort entries: first by descending count, then by key alphabetically
  const sortedEntries = Object.entries(usage).sort(([keyA, countA], [keyB, countB]) => {
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
