import type { ComponentClassNameMapJSON } from '@kiskadee/core';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isElementMap = (value: unknown): value is Record<string, Record<string, unknown>> => {
  if (!isRecord(value)) return false;
  const first = Object.values(value).find(Boolean);
  if (!isRecord(first)) return false;
  const elementKeys = ['d', 'e', 's', 'c', 'l', 'r', 'rp', 'rs'];
  return elementKeys.some((key) => key in first);
};

const mergeElementMaps = (
  cComp: Record<string, Record<string, unknown>> | undefined,
  pComp: Record<string, Record<string, unknown>> | undefined
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  const elKeys = new Set<string>([
    ...Object.keys(cComp || {}),
    ...Object.keys(pComp || {})
  ]);
  for (const el of elKeys) {
    const cEl = (cComp?.[el] as Record<string, unknown> | undefined) ?? {};
    const pEl = (pComp?.[el] as Record<string, unknown> | undefined) ?? {};
    const mergedEl: Record<string, unknown> = { ...(cEl as object) };
    if (pEl.c) {
      const cElC = (cEl.c as Record<string, unknown> | undefined) ?? {};
      const pElC = (pEl.c as Record<string, unknown> | undefined) ?? {};
      mergedEl.c = { ...cElC, ...pElC };
    }
    if (pEl.cs !== undefined) mergedEl.cs = pEl.cs;
    if (mergedEl.d === undefined && pEl.d !== undefined) mergedEl.d = pEl.d;
    if (mergedEl.e === undefined && pEl.e !== undefined) mergedEl.e = pEl.e;
    if (mergedEl.s === undefined && pEl.s !== undefined) mergedEl.s = pEl.s;
    out[el] = mergedEl;
  }
  return out;
};

const mergeClassMapNode = (coreNode: unknown, paletteNode: unknown): Record<string, unknown> => {
  const cIsElement = isElementMap(coreNode);
  const pIsElement = isElementMap(paletteNode);

  if (cIsElement || pIsElement) {
    return mergeElementMaps(
      cIsElement ? coreNode : undefined,
      pIsElement ? paletteNode : undefined
    );
  }

  const cNode = isRecord(coreNode) ? coreNode : {};
  const pNode = isRecord(paletteNode) ? paletteNode : {};
  const keys = new Set<string>([
    ...Object.keys(cNode),
    ...Object.keys(pNode)
  ]);
  const out: Record<string, unknown> = {};

  for (const key of keys) {
    if (key === '$schema') continue;
    out[key] = mergeClassMapNode(cNode[key], pNode[key]);
  }

  return out;
};

// Deep merge: preserve core baseline (d/e/s) and overlay palette colors (c) and selected (cs).
// The recursion supports components with plain elements, variants, or variant modes.
export const mergeMaps = (
  coreMap: ComponentClassNameMapJSON,
  paletteMap: ComponentClassNameMapJSON
): ComponentClassNameMapJSON => {
  return mergeClassMapNode(coreMap, paletteMap) as unknown as ComponentClassNameMapJSON;
};
