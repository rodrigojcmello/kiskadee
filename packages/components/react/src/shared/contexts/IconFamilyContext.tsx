'use client';

import {
  type DefinedIconFamily,
  type IconFamilyCatalogEntry,
  type IconFamilyCatalogItem,
  type IconFamilyFallbackEntry,
  type IconFamilyId,
  type IconFamilyVariant,
  type IconFamilyVariantId,
  type IconName,
  type ResolvedIconGlyph,
  resolveIconFamilyVariant,
  resolveIconGlyph
} from '@kiskadee/icons/interface';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { KiskadeeContext } from './KiskadeeContext.tsx';

declare const process: { env: { NODE_ENV?: string } };

export type IconFamilyProviderStatus = 'idle' | 'preparing' | 'ready' | 'error';

export type IconFamilyStatusValue = {
  status: IconFamilyProviderStatus;
  requestedFamilyId?: IconFamilyId;
  requestedVariantId?: IconFamilyVariantId;
  effectiveFamilyId?: IconFamilyId;
  effectiveVariantId?: IconFamilyVariantId;
  fallbackFor?: IconFamilyId;
  pendingFamilyId?: IconFamilyId;
  pendingVariantId?: IconFamilyVariantId;
  error?: Error;
  retry: () => void;
};

export type IconFamilyProviderProps = {
  children: ReactNode;
  families?: readonly DefinedIconFamily[];
  catalog?: readonly IconFamilyCatalogItem[];
  defaultFamily?: IconFamilyId;
  defaultVariant?: IconFamilyVariantId;
  family?: IconFamilyId;
  variant?: IconFamilyVariantId;
};

type IconFamilyContextValue = IconFamilyStatusValue & {
  effectiveFamily?: DefinedIconFamily;
  effectiveVariant?: IconFamilyVariant;
};

type ProviderState = Omit<IconFamilyContextValue, 'retry'>;

type RequestedSelection = {
  familyId: IconFamilyId;
  variantId?: IconFamilyVariantId;
};

type RequestResolution = {
  requestedFamilyId: IconFamilyId;
  requestedVariantId?: IconFamilyVariantId;
  targetFamilyId: IconFamilyId;
  targetVariantId: IconFamilyVariantId;
  definition?: DefinedIconFamily;
  entry?: IconFamilyCatalogEntry;
  fallbackFor?: IconFamilyId;
};

const EMPTY_FAMILIES: readonly DefinedIconFamily[] = [];
const EMPTY_CATALOG: readonly IconFamilyCatalogItem[] = [];
const IconFamilyContext = createContext<IconFamilyContextValue | undefined>(undefined);
const catalogLoadPromises = new Map<IconFamilyId, Promise<DefinedIconFamily>>();
const preparationPromises = new Map<string, Promise<void>>();

function selectionKey(familyId: IconFamilyId, variantId: IconFamilyVariantId): string {
  return `${familyId}\u0000${variantId}`;
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

function createFamilyMap(
  families: readonly DefinedIconFamily[]
): ReadonlyMap<IconFamilyId, DefinedIconFamily> {
  const definitions = new Map<IconFamilyId, DefinedIconFamily>();

  for (const family of families) {
    if (definitions.has(family.id)) {
      throw new Error(`Icon family "${family.id}" was registered more than once.`);
    }
    definitions.set(family.id, family);
  }

  return definitions;
}

function createCatalogMaps(catalog: readonly IconFamilyCatalogItem[]): {
  entries: ReadonlyMap<IconFamilyId, IconFamilyCatalogEntry>;
  fallbacks: ReadonlyMap<IconFamilyId, IconFamilyFallbackEntry>;
} {
  const entries = new Map<IconFamilyId, IconFamilyCatalogEntry>();
  const fallbacks = new Map<IconFamilyId, IconFamilyFallbackEntry>();
  const registeredIds = new Set<IconFamilyId>();

  for (const item of catalog) {
    if (registeredIds.has(item.id)) {
      throw new Error(`Icon catalog id "${item.id}" was registered more than once.`);
    }
    registeredIds.add(item.id);

    if (item.kind === 'family') {
      entries.set(item.id, item);
      continue;
    }

    fallbacks.set(item.id, item);
  }

  return { entries, fallbacks };
}

function selectRequestedSelection(options: {
  explicitFamily?: IconFamilyId;
  explicitVariant?: IconFamilyVariantId;
  presetFamily?: IconFamilyId;
  presetVariant?: IconFamilyVariantId;
  defaultFamily?: IconFamilyId;
  defaultVariant?: IconFamilyVariantId;
  definitions: ReadonlyMap<IconFamilyId, DefinedIconFamily>;
  entries: ReadonlyMap<IconFamilyId, IconFamilyCatalogEntry>;
}): RequestedSelection | undefined {
  const {
    explicitFamily,
    explicitVariant,
    presetFamily,
    presetVariant,
    defaultFamily,
    defaultVariant,
    definitions,
    entries
  } = options;
  if (explicitFamily) {
    return { familyId: explicitFamily, ...(explicitVariant ? { variantId: explicitVariant } : {}) };
  }
  if (presetFamily) {
    const variantId = explicitVariant ?? presetVariant;
    return { familyId: presetFamily, ...(variantId ? { variantId } : {}) };
  }
  if (defaultFamily) {
    const variantId = explicitVariant ?? defaultVariant;
    return { familyId: defaultFamily, ...(variantId ? { variantId } : {}) };
  }

  const registeredFamilyIds = new Set([...definitions.keys(), ...entries.keys()]);
  const familyId =
    registeredFamilyIds.size === 1 ? registeredFamilyIds.values().next().value : undefined;
  return familyId
    ? { familyId, ...(explicitVariant ? { variantId: explicitVariant } : {}) }
    : undefined;
}

function resolveTargetVariantId(options: {
  familyId: IconFamilyId;
  requestedVariantId?: IconFamilyVariantId;
  definition?: DefinedIconFamily;
  entry?: IconFamilyCatalogEntry;
}): IconFamilyVariantId {
  const { familyId, requestedVariantId, definition, entry } = options;
  const variantId = requestedVariantId ?? definition?.defaultVariant ?? entry?.defaultVariant;
  if (!variantId) {
    throw new Error(`[kiskadee/icons] Icon family "${familyId}" has no default variant.`);
  }

  const exists = definition
    ? Boolean(definition.variants[variantId])
    : entry?.variants.some((variant) => variant.id === variantId);
  if (!exists) {
    throw new Error(
      `[kiskadee/icons] Icon family "${familyId}" does not provide variant "${variantId}".`
    );
  }
  return variantId;
}

function resolveRequest(
  requested: RequestedSelection,
  definitions: ReadonlyMap<IconFamilyId, DefinedIconFamily>,
  entries: ReadonlyMap<IconFamilyId, IconFamilyCatalogEntry>,
  fallbacks: ReadonlyMap<IconFamilyId, IconFamilyFallbackEntry>
): RequestResolution {
  const definition = definitions.get(requested.familyId);
  const entry = entries.get(requested.familyId);
  if (definition || entry) {
    return {
      requestedFamilyId: requested.familyId,
      ...(requested.variantId ? { requestedVariantId: requested.variantId } : {}),
      targetFamilyId: requested.familyId,
      targetVariantId: resolveTargetVariantId({
        familyId: requested.familyId,
        requestedVariantId: requested.variantId,
        definition,
        entry
      }),
      ...(definition ? { definition } : {}),
      ...(entry ? { entry } : {})
    };
  }

  const fallback = fallbacks.get(requested.familyId);
  if (fallback) {
    const fallbackDefinition = definitions.get(fallback.fallbackTo);
    const fallbackEntry = entries.get(fallback.fallbackTo);

    if (fallbackDefinition || fallbackEntry) {
      const fallbackVariantId = fallback.fallbackVariant ?? requested.variantId;
      return {
        requestedFamilyId: requested.familyId,
        ...(requested.variantId ? { requestedVariantId: requested.variantId } : {}),
        targetFamilyId: fallback.fallbackTo,
        targetVariantId: resolveTargetVariantId({
          familyId: fallback.fallbackTo,
          requestedVariantId: fallbackVariantId,
          definition: fallbackDefinition,
          entry: fallbackEntry
        }),
        ...(fallbackDefinition ? { definition: fallbackDefinition } : {}),
        ...(fallbackEntry ? { entry: fallbackEntry } : {}),
        fallbackFor: requested.familyId
      };
    }
  }

  throw new Error(
    `[kiskadee/icons] Icon family "${requested.familyId}" is not registered and has no resolvable catalog entry.`
  );
}

function loadCatalogFamily(entry: IconFamilyCatalogEntry): Promise<DefinedIconFamily> {
  const cached = catalogLoadPromises.get(entry.id);
  if (cached) return cached;

  const promise = Promise.resolve()
    .then(() => entry.load())
    .then((family) => {
      if (family.id !== entry.id) {
        throw new Error(
          `[kiskadee/icons] Catalog entry "${entry.id}" loaded family "${family.id}".`
        );
      }
      return family;
    })
    .catch((error) => {
      catalogLoadPromises.delete(entry.id);
      throw error;
    });
  catalogLoadPromises.set(entry.id, promise);
  return promise;
}

function prepareVariant(family: DefinedIconFamily, variant: IconFamilyVariant): Promise<void> {
  if (!variant.prepare || typeof window === 'undefined') return Promise.resolve();

  const key = selectionKey(family.id, variant.id);
  const cached = preparationPromises.get(key);
  if (cached) return cached;

  const promise = Promise.resolve()
    .then(() => variant.prepare?.())
    .then(() => undefined)
    .catch((error) => {
      preparationPromises.delete(key);
      throw error;
    });
  preparationPromises.set(key, promise);
  return promise;
}

function resolveInitialSelection(options: {
  definitions: ReadonlyMap<IconFamilyId, DefinedIconFamily>;
  requested?: RequestedSelection;
  defaultFamily?: IconFamilyId;
  defaultVariant?: IconFamilyVariantId;
}): { family: DefinedIconFamily; variant: IconFamilyVariant } | undefined {
  const { definitions, requested, defaultFamily, defaultVariant } = options;

  const resolveSynchronous = (
    familyId: IconFamilyId | undefined,
    variantId?: IconFamilyVariantId
  ) => {
    const family = familyId ? definitions.get(familyId) : undefined;
    const variant = family ? resolveIconFamilyVariant(family, variantId) : undefined;
    return family && variant && !variant.prepare ? { family, variant } : undefined;
  };

  const requestedSelection = resolveSynchronous(requested?.familyId, requested?.variantId);
  if (requestedSelection) return requestedSelection;

  const defaultSelection = resolveSynchronous(defaultFamily, defaultVariant);
  if (defaultSelection) return defaultSelection;

  if (!requested && definitions.size === 1) {
    const soleFamily = definitions.values().next().value;
    const soleVariant = soleFamily ? resolveIconFamilyVariant(soleFamily) : undefined;
    if (soleFamily && soleVariant && !soleVariant.prepare) {
      return { family: soleFamily, variant: soleVariant };
    }
  }

  return undefined;
}

/**
 * Resolves preset or application icon-family and variant selections without adding a DOM wrapper.
 * The previously effective selection remains available until the next variant is fully prepared.
 */
export function IconFamilyProvider({
  children,
  families = EMPTY_FAMILIES,
  catalog = EMPTY_CATALOG,
  defaultFamily,
  defaultVariant,
  family,
  variant
}: IconFamilyProviderProps) {
  const kiskadee = useContext(KiskadeeContext);
  const definitions = useMemo(() => createFamilyMap(families), [families]);
  const catalogMaps = useMemo(() => createCatalogMaps(catalog), [catalog]);
  const presetFamily = kiskadee?.global?.icons?.family;
  const presetVariant = kiskadee?.global?.icons?.variant;
  const requested = useMemo(
    () =>
      selectRequestedSelection({
        explicitFamily: family,
        explicitVariant: variant,
        presetFamily,
        presetVariant,
        defaultFamily,
        defaultVariant,
        definitions,
        entries: catalogMaps.entries
      }),
    [
      catalogMaps.entries,
      defaultFamily,
      defaultVariant,
      definitions,
      family,
      presetFamily,
      presetVariant,
      variant
    ]
  );
  const [state, setState] = useState<ProviderState>(() => {
    const effective = resolveInitialSelection({
      definitions,
      requested,
      defaultFamily,
      defaultVariant
    });
    return effective
      ? {
          status: 'ready',
          requestedFamilyId: requested?.familyId,
          requestedVariantId: requested?.variantId,
          effectiveFamilyId: effective.family.id,
          effectiveVariantId: effective.variant.id,
          effectiveFamily: effective.family,
          effectiveVariant: effective.variant
        }
      : {
          status: 'idle',
          requestedFamilyId: requested?.familyId,
          requestedVariantId: requested?.variantId
        };
  });
  const [retryVersion, setRetryVersion] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const retry = useCallback(() => setRetryVersion((current) => current + 1), []);

  useEffect(() => {
    if (!requested) {
      setState((current) => ({
        ...current,
        status: current.effectiveFamily ? 'ready' : 'idle',
        requestedFamilyId: undefined,
        requestedVariantId: undefined,
        pendingFamilyId: undefined,
        pendingVariantId: undefined,
        error: undefined
      }));
      return;
    }

    let cancelled = false;

    const applySelection = async () => {
      let resolution: RequestResolution;
      try {
        resolution = resolveRequest(
          requested,
          definitions,
          catalogMaps.entries,
          catalogMaps.fallbacks
        );
      } catch (value) {
        setState((current) => ({
          ...current,
          status: 'error',
          requestedFamilyId: requested.familyId,
          requestedVariantId: requested.variantId,
          pendingFamilyId: undefined,
          pendingVariantId: undefined,
          error: toError(value)
        }));
        return;
      }

      const currentState = stateRef.current;
      const eagerVariant = resolution.definition
        ? resolveIconFamilyVariant(resolution.definition, resolution.targetVariantId)
        : undefined;
      if (
        eagerVariant &&
        !eagerVariant.prepare &&
        currentState.status === 'ready' &&
        currentState.requestedFamilyId === requested.familyId &&
        currentState.requestedVariantId === requested.variantId &&
        currentState.effectiveFamilyId === resolution.targetFamilyId &&
        currentState.effectiveVariantId === resolution.targetVariantId &&
        currentState.effectiveFamily === resolution.definition &&
        currentState.fallbackFor === resolution.fallbackFor
      ) {
        return;
      }

      setState((current) => ({
        ...current,
        status: 'preparing',
        requestedFamilyId: requested.familyId,
        requestedVariantId: requested.variantId,
        pendingFamilyId: resolution.targetFamilyId,
        pendingVariantId: resolution.targetVariantId,
        error: undefined
      }));

      try {
        const loadedFamily =
          resolution.definition ??
          (resolution.entry ? await loadCatalogFamily(resolution.entry) : undefined);
        if (!loadedFamily) {
          throw new Error(
            `[kiskadee/icons] Icon family "${resolution.targetFamilyId}" could not be loaded.`
          );
        }
        const loadedVariant = resolveIconFamilyVariant(loadedFamily, resolution.targetVariantId);
        if (!loadedVariant) {
          throw new Error(
            `[kiskadee/icons] Icon family "${loadedFamily.id}" loaded without variant "${resolution.targetVariantId}".`
          );
        }
        await prepareVariant(loadedFamily, loadedVariant);
        if (cancelled) return;

        setState({
          status: 'ready',
          requestedFamilyId: requested.familyId,
          requestedVariantId: requested.variantId,
          effectiveFamilyId: loadedFamily.id,
          effectiveVariantId: loadedVariant.id,
          effectiveFamily: loadedFamily,
          effectiveVariant: loadedVariant,
          ...(resolution.fallbackFor ? { fallbackFor: resolution.fallbackFor } : {})
        });
      } catch (value) {
        if (cancelled) return;
        const error = toError(value);

        if (process.env.NODE_ENV !== 'production') {
          console.warn('[kiskadee/icons] Failed to prepare the selected icon variant.', error);
        }

        setState((current) => ({
          ...current,
          status: 'error',
          requestedFamilyId: requested.familyId,
          requestedVariantId: requested.variantId,
          pendingFamilyId: undefined,
          pendingVariantId: undefined,
          error
        }));
      }
    };

    void applySelection();
    return () => {
      cancelled = true;
    };
  }, [catalogMaps.entries, catalogMaps.fallbacks, definitions, requested, retryVersion]);

  const contextValue = useMemo<IconFamilyContextValue>(
    () => ({
      ...state,
      retry
    }),
    [retry, state]
  );

  return <IconFamilyContext.Provider value={contextValue}>{children}</IconFamilyContext.Provider>;
}

export function useIconFamilyStatus(): IconFamilyStatusValue {
  const value = useContext(IconFamilyContext);
  if (!value) {
    throw new Error('useIconFamilyStatus must be used within an IconFamilyProvider');
  }

  const {
    status,
    requestedFamilyId,
    requestedVariantId,
    effectiveFamilyId,
    effectiveVariantId,
    fallbackFor,
    pendingFamilyId,
    pendingVariantId,
    error,
    retry
  } = value;
  return {
    status,
    requestedFamilyId,
    requestedVariantId,
    effectiveFamilyId,
    effectiveVariantId,
    fallbackFor,
    pendingFamilyId,
    pendingVariantId,
    error,
    retry
  };
}

export function useResolvedIconGlyph(name: IconName | undefined): {
  familyId?: IconFamilyId;
  variantId?: IconFamilyVariantId;
  glyph?: ResolvedIconGlyph;
  hasProvider: boolean;
} {
  const value = useContext(IconFamilyContext);
  return {
    hasProvider: value !== undefined,
    familyId: value?.effectiveFamilyId,
    variantId: value?.effectiveVariantId,
    glyph:
      value?.effectiveFamily && value.effectiveVariant && name !== undefined
        ? resolveIconGlyph(value.effectiveFamily, name, value.effectiveVariant.id)
        : undefined
  };
}
