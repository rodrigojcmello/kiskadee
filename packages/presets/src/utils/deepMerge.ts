export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Deep-merge utility used by presets to compose segment overrides.
 *
 * Rules:
 * - Plain objects are merged recursively.
 * - Arrays are replaced (not concatenated).
 * - `undefined` in the patch does not overwrite the base.
 */
export function deepMerge<T>(base: T, patch: DeepPartial<T>): T {
  if (patch === undefined) return base;

  // Arrays: replace.
  if (Array.isArray(base) || Array.isArray(patch)) {
    return patch as unknown as T;
  }

  // Plain objects: merge keys.
  if (isPlainObject(base) && isPlainObject(patch)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(patch)) {
      const patchValue = (patch as Record<string, unknown>)[key];
      if (patchValue === undefined) continue;
      const baseValue = (base as Record<string, unknown>)[key];
      out[key] = deepMerge(baseValue, patchValue as DeepPartial<unknown>);
    }
    return out as T;
  }

  // Primitives/functions/class instances/etc: replace.
  return patch as unknown as T;
}
