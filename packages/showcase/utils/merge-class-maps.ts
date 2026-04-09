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

// Deep merge: preserve core baseline (d/e/s) and overlay palette colors (c) and selected (cs)
export const mergeMaps = (
  coreMap: ComponentClassNameMapJSON,
  paletteMap: ComponentClassNameMapJSON
): ComponentClassNameMapJSON => {
  const out: Record<string, Record<string, unknown>> = {};
  const compKeys = new Set<string>([
    ...Object.keys(coreMap || {}),
    ...Object.keys(paletteMap || {})
  ]);
  for (const comp of compKeys) {
    if (comp === '$schema') continue;
    const cComp = (coreMap as unknown as Record<string, unknown>)?.[comp] as
      | Record<string, unknown>
      | undefined;
    const pComp = (paletteMap as unknown as Record<string, unknown>)?.[comp] as
      | Record<string, unknown>
      | undefined;

    const cIsElement = isElementMap(cComp);
    const pIsElement = isElementMap(pComp);

    if (cIsElement && pIsElement) {
      out[comp] = mergeElementMaps(
        cComp as Record<string, Record<string, unknown>>,
        pComp as Record<string, Record<string, unknown>>
      ) as Record<string, unknown>;
      continue;
    }

    const cVariants = cIsElement ? {} : (cComp as Record<string, Record<string, unknown>> | undefined);
    const pVariants = pIsElement ? {} : (pComp as Record<string, Record<string, unknown>> | undefined);
    const variantKeys = new Set<string>([
      ...Object.keys(cVariants || {}),
      ...Object.keys(pVariants || {})
    ]);
    out[comp] = {};
    for (const variant of variantKeys) {
      const cVariant = cIsElement
        ? (cComp as Record<string, Record<string, unknown>>)
        : (cVariants?.[variant] as Record<string, Record<string, unknown>> | undefined);
      const pVariant = pIsElement
        ? (pComp as Record<string, Record<string, unknown>>)
        : (pVariants?.[variant] as Record<string, Record<string, unknown>> | undefined);
      (out[comp] as Record<string, unknown>)[variant] = mergeElementMaps(cVariant, pVariant);
    }
  }
  return out as unknown as ComponentClassNameMapJSON;
};
