import type { ComponentClassNameMapJSON } from '@kiskadee/core';

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
    const elKeys = new Set<string>([...Object.keys(cComp || {}), ...Object.keys(pComp || {})]);
    out[comp] = {};
    for (const el of elKeys) {
      const cEl = (cComp?.[el] as Record<string, unknown> | undefined) ?? {};
      const pEl = (pComp?.[el] as Record<string, unknown> | undefined) ?? {};
      // start from core element so we don't lose d/e/s/scales
      const mergedEl: Record<string, unknown> = { ...(cEl as object) };
      // colors: merge semantics, palette takes precedence per semantic key
      if (pEl.c) {
        const cElC = (cEl.c as Record<string, unknown> | undefined) ?? {};
        const pElC = (pEl.c as Record<string, unknown> | undefined) ?? {};
        mergedEl.c = { ...cElC, ...pElC };
      }
      // selected state class from palette if provided
      if (pEl.cs !== undefined) mergedEl.cs = pEl.cs;
      // if core didn't have d/e/s, allow palette to define them
      if (mergedEl.d === undefined && pEl.d !== undefined) mergedEl.d = pEl.d;
      if (mergedEl.e === undefined && pEl.e !== undefined) mergedEl.e = pEl.e;
      if (mergedEl.s === undefined && pEl.s !== undefined) mergedEl.s = pEl.s;
      (out[comp] as Record<string, unknown>)[el] = mergedEl;
    }
  }
  return out as unknown as ComponentClassNameMapJSON;
};
