import type { FontFamilyId, FontStack } from '@kiskadee/core';

export type FontFamilyPreparationResult = Readonly<{
  family: string;
  source: 'local' | 'online';
  fallbackFor?: string;
}>;

export type FontFamilyPrepare = () => unknown;

export type FontFamilyDefinitionInput =
  | {
      id: FontFamilyId;
      stack: FontStack;
      prepare?: FontFamilyPrepare;
    }
  | {
      id: FontFamilyId;
      stack?: FontStack;
      prepare: FontFamilyPrepare;
    };

export type DefinedFontFamily = Readonly<{
  id: FontFamilyId;
  stack?: FontStack;
  prepare?: FontFamilyPrepare;
}>;

export type FontFamilyPreparationStatus = 'idle' | 'preparing' | 'ready';

type PreparationRecord = {
  promise: Promise<FontFamilyPreparationResult | undefined>;
  result?: FontFamilyPreparationResult;
  status: Exclude<FontFamilyPreparationStatus, 'idle'>;
};

const FONT_FAMILY_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const preparationCache = new Map<FontFamilyId, PreparationRecord>();

function assertFontFamilyId(id: string): void {
  if (!FONT_FAMILY_ID_PATTERN.test(id)) {
    throw new TypeError(
      `Font family id "${id}" must use lowercase kebab-case (for example, "acme-sans").`
    );
  }
}

function cloneFontStack(stack: FontStack): FontStack {
  const normalized = stack.map((token) => token.trim());

  if (normalized.length === 0 || normalized.some((token) => token.length === 0)) {
    throw new TypeError('Font family stacks must contain one or more non-empty tokens.');
  }

  return Object.freeze(normalized) as FontStack;
}

function normalizePreparationResult(value: unknown): FontFamilyPreparationResult | undefined {
  if (!value || typeof value !== 'object') return undefined;

  const candidate = value as Partial<FontFamilyPreparationResult>;
  const family = typeof candidate.family === 'string' ? candidate.family.trim() : '';
  const fallbackFor =
    typeof candidate.fallbackFor === 'string' ? candidate.fallbackFor.trim() : undefined;

  if (!family || (candidate.source !== 'local' && candidate.source !== 'online')) {
    return undefined;
  }

  return Object.freeze({
    family,
    source: candidate.source,
    ...(fallbackFor ? { fallbackFor } : {})
  });
}

/**
 * What
 *     Creates an inert, immutable font-family descriptor.
 * Why
 *     Registration must never load a resource; consumers explicitly prepare selected families.
 */
export function defineFontFamily(input: FontFamilyDefinitionInput): DefinedFontFamily {
  assertFontFamilyId(input.id);

  if (!input.stack && !input.prepare) {
    throw new TypeError('A font family definition requires a stack, a prepare callback, or both.');
  }

  if (input.prepare !== undefined && typeof input.prepare !== 'function') {
    throw new TypeError('Font family prepare must be a function when provided.');
  }

  return Object.freeze({
    id: input.id,
    ...(input.stack ? { stack: cloneFontStack(input.stack) } : {}),
    ...(input.prepare ? { prepare: input.prepare } : {})
  });
}

/**
 * What
 *     Reports the process-local preparation state for a family id.
 * Why
 *     Providers use it to avoid presenting cached families as pending.
 */
export function getFontFamilyPreparationStatus(id: FontFamilyId): FontFamilyPreparationStatus {
  return preparationCache.get(id)?.status ?? 'idle';
}

/**
 * What
 *     Reports the optional outcome returned by a completed family preparation.
 * Why
 *     Consumers may explain which local or online family satisfied a selected policy.
 */
export function getFontFamilyPreparationResult(
  id: FontFamilyId
): FontFamilyPreparationResult | undefined {
  return preparationCache.get(id)?.result;
}

/**
 * What
 *     Prepares one family while deduplicating concurrent and completed work by id.
 * Why
 *     Multiple roles and providers may select the same resource without loading it repeatedly.
 */
export function prepareFontFamily(
  definition: DefinedFontFamily
): Promise<FontFamilyPreparationResult | undefined> {
  if (!definition.prepare || typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(undefined);
  }

  const cached = preparationCache.get(definition.id);
  if (cached) {
    return cached.promise;
  }

  const promise = Promise.resolve()
    .then(() => definition.prepare?.())
    .then((value) => {
      const result = normalizePreparationResult(value);
      const current = preparationCache.get(definition.id);
      if (current?.promise === promise) {
        current.status = 'ready';
        if (result) {
          current.result = result;
        } else {
          delete current.result;
        }
      }
      return result;
    })
    .catch((error: unknown) => {
      const current = preparationCache.get(definition.id);
      if (current?.promise === promise) {
        preparationCache.delete(definition.id);
      }
      throw error;
    });

  preparationCache.set(definition.id, {
    promise,
    status: 'preparing'
  });

  return promise;
}

/**
 * What
 *     Prepares independent selected families concurrently.
 * Why
 *     A role transition must not serialize unrelated font resource work.
 */
export async function prepareFontFamilies(
  definitions: readonly DefinedFontFamily[]
): Promise<void> {
  await Promise.all(definitions.map((definition) => prepareFontFamily(definition)));
}

export function resetFontFamilyPreparation(id?: FontFamilyId): void {
  if (id) {
    preparationCache.delete(id);
    return;
  }

  preparationCache.clear();
}
