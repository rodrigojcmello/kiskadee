'use client';

import {
  type DefinedIconFamily,
  type IconFamilyCatalogEntry,
  type IconFamilyCatalogItem,
  type IconFamilyFallbackEntry,
  type IconFamilyId,
  type IconName,
  type ResolvedIconGlyph,
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
  effectiveFamilyId?: IconFamilyId;
  fallbackFor?: IconFamilyId;
  pendingFamilyId?: IconFamilyId;
  error?: Error;
  retry: () => void;
};

export type IconFamilyProviderProps = {
  children: ReactNode;
  families?: readonly DefinedIconFamily[];
  catalog?: readonly IconFamilyCatalogItem[];
  defaultFamily?: IconFamilyId;
  family?: IconFamilyId;
};

type IconFamilyContextValue = IconFamilyStatusValue & {
  effectiveFamily?: DefinedIconFamily;
};

type ProviderState = Omit<IconFamilyContextValue, 'retry'>;

type RequestResolution = {
  requestedFamilyId: IconFamilyId;
  targetFamilyId: IconFamilyId;
  definition?: DefinedIconFamily;
  entry?: IconFamilyCatalogEntry;
  fallbackFor?: IconFamilyId;
};

const EMPTY_FAMILIES: readonly DefinedIconFamily[] = [];
const EMPTY_CATALOG: readonly IconFamilyCatalogItem[] = [];
const IconFamilyContext = createContext<IconFamilyContextValue | undefined>(undefined);
const catalogLoadPromises = new Map<IconFamilyId, Promise<DefinedIconFamily>>();
const preparationPromises = new Map<IconFamilyId, Promise<void>>();

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

function selectRequestedFamilyId(options: {
  explicitFamily?: IconFamilyId;
  presetFamily?: IconFamilyId;
  defaultFamily?: IconFamilyId;
  definitions: ReadonlyMap<IconFamilyId, DefinedIconFamily>;
  entries: ReadonlyMap<IconFamilyId, IconFamilyCatalogEntry>;
}): IconFamilyId | undefined {
  const { explicitFamily, presetFamily, defaultFamily, definitions, entries } = options;
  if (explicitFamily) return explicitFamily;
  if (presetFamily) return presetFamily;
  if (defaultFamily) return defaultFamily;

  const registeredFamilyIds = new Set([...definitions.keys(), ...entries.keys()]);
  if (registeredFamilyIds.size === 1) return registeredFamilyIds.values().next().value;
  return undefined;
}

function resolveRequest(
  requestedFamilyId: IconFamilyId,
  definitions: ReadonlyMap<IconFamilyId, DefinedIconFamily>,
  entries: ReadonlyMap<IconFamilyId, IconFamilyCatalogEntry>,
  fallbacks: ReadonlyMap<IconFamilyId, IconFamilyFallbackEntry>
): RequestResolution {
  const definition = definitions.get(requestedFamilyId);
  if (definition) {
    return { requestedFamilyId, targetFamilyId: requestedFamilyId, definition };
  }

  const entry = entries.get(requestedFamilyId);
  if (entry) {
    return { requestedFamilyId, targetFamilyId: requestedFamilyId, entry };
  }

  const fallback = fallbacks.get(requestedFamilyId);
  if (fallback) {
    const fallbackDefinition = definitions.get(fallback.fallbackTo);
    const fallbackEntry = entries.get(fallback.fallbackTo);

    if (fallbackDefinition || fallbackEntry) {
      return {
        requestedFamilyId,
        targetFamilyId: fallback.fallbackTo,
        ...(fallbackDefinition ? { definition: fallbackDefinition } : {}),
        ...(fallbackEntry ? { entry: fallbackEntry } : {}),
        fallbackFor: requestedFamilyId
      };
    }
  }

  throw new Error(
    `[kiskadee/icons] Icon family "${requestedFamilyId}" is not registered and has no resolvable catalog entry.`
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

function prepareFamily(family: DefinedIconFamily): Promise<void> {
  if (!family.prepare || typeof window === 'undefined') return Promise.resolve();

  const cached = preparationPromises.get(family.id);
  if (cached) return cached;

  const promise = Promise.resolve()
    .then(() => family.prepare?.())
    .then(() => undefined)
    .catch((error) => {
      preparationPromises.delete(family.id);
      throw error;
    });
  preparationPromises.set(family.id, promise);
  return promise;
}

function resolveInitialFamily(options: {
  definitions: ReadonlyMap<IconFamilyId, DefinedIconFamily>;
  requestedFamilyId?: IconFamilyId;
  defaultFamily?: IconFamilyId;
}): DefinedIconFamily | undefined {
  const { definitions, requestedFamilyId, defaultFamily } = options;
  const requested = requestedFamilyId ? definitions.get(requestedFamilyId) : undefined;
  if (requested && !requested.prepare) return requested;

  const defaultDefinition = defaultFamily ? definitions.get(defaultFamily) : undefined;
  if (defaultDefinition && !defaultDefinition.prepare) return defaultDefinition;

  if (!requestedFamilyId && definitions.size === 1) {
    const soleDefinition = definitions.values().next().value;
    if (soleDefinition && !soleDefinition.prepare) return soleDefinition;
  }

  return undefined;
}

/**
 * Resolves a preset or application icon-family selection without adding a DOM wrapper.
 * The previously effective family remains available until the next family is fully prepared.
 */
export function IconFamilyProvider({
  children,
  families = EMPTY_FAMILIES,
  catalog = EMPTY_CATALOG,
  defaultFamily,
  family
}: IconFamilyProviderProps) {
  const kiskadee = useContext(KiskadeeContext);
  const definitions = useMemo(() => createFamilyMap(families), [families]);
  const catalogMaps = useMemo(() => createCatalogMaps(catalog), [catalog]);
  const presetFamily = kiskadee?.global?.icons?.family;
  const requestedFamilyId = selectRequestedFamilyId({
    explicitFamily: family,
    presetFamily,
    defaultFamily,
    definitions,
    entries: catalogMaps.entries
  });
  const [state, setState] = useState<ProviderState>(() => {
    const effectiveFamily = resolveInitialFamily({
      definitions,
      requestedFamilyId,
      defaultFamily
    });
    return effectiveFamily
      ? {
          status: 'ready',
          requestedFamilyId,
          effectiveFamilyId: effectiveFamily.id,
          effectiveFamily
        }
      : { status: 'idle', requestedFamilyId };
  });
  const [retryVersion, setRetryVersion] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const retry = useCallback(() => setRetryVersion((current) => current + 1), []);

  useEffect(() => {
    if (!requestedFamilyId) {
      setState((current) => ({
        ...current,
        status: current.effectiveFamily ? 'ready' : 'idle',
        requestedFamilyId: undefined,
        pendingFamilyId: undefined,
        error: undefined
      }));
      return;
    }

    let cancelled = false;

    const applySelection = async () => {
      let resolution: RequestResolution;
      try {
        resolution = resolveRequest(
          requestedFamilyId,
          definitions,
          catalogMaps.entries,
          catalogMaps.fallbacks
        );
      } catch (value) {
        const error = toError(value);
        setState((current) => ({
          ...current,
          status: 'error',
          requestedFamilyId,
          pendingFamilyId: undefined,
          error
        }));
        return;
      }

      const currentState = stateRef.current;
      if (
        resolution.definition &&
        !resolution.definition.prepare &&
        currentState.status === 'ready' &&
        currentState.requestedFamilyId === requestedFamilyId &&
        currentState.effectiveFamilyId === resolution.targetFamilyId &&
        currentState.effectiveFamily === resolution.definition &&
        currentState.fallbackFor === resolution.fallbackFor
      ) {
        return;
      }

      setState((current) => ({
        ...current,
        status: 'preparing',
        requestedFamilyId,
        pendingFamilyId: resolution.targetFamilyId,
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
        await prepareFamily(loadedFamily);
        if (cancelled) return;

        setState({
          status: 'ready',
          requestedFamilyId,
          effectiveFamilyId: loadedFamily.id,
          effectiveFamily: loadedFamily,
          ...(resolution.fallbackFor ? { fallbackFor: resolution.fallbackFor } : {})
        });
      } catch (value) {
        if (cancelled) return;
        const error = toError(value);

        if (process.env.NODE_ENV !== 'production') {
          console.warn('[kiskadee/icons] Failed to prepare the selected icon family.', error);
        }

        setState((current) => ({
          ...current,
          status: 'error',
          requestedFamilyId,
          pendingFamilyId: undefined,
          error
        }));
      }
    };

    void applySelection();
    return () => {
      cancelled = true;
    };
  }, [catalogMaps.entries, catalogMaps.fallbacks, definitions, requestedFamilyId, retryVersion]);

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
    effectiveFamilyId,
    fallbackFor,
    pendingFamilyId,
    error,
    retry
  } = value;
  return {
    status,
    requestedFamilyId,
    effectiveFamilyId,
    fallbackFor,
    pendingFamilyId,
    error,
    retry
  };
}

export function useResolvedIconGlyph(name: IconName | undefined): {
  familyId?: IconFamilyId;
  glyph?: ResolvedIconGlyph;
  hasProvider: boolean;
} {
  const value = useContext(IconFamilyContext);
  return {
    hasProvider: value !== undefined,
    familyId: value?.effectiveFamilyId,
    glyph:
      value?.effectiveFamily && name !== undefined
        ? resolveIconGlyph(value.effectiveFamily, name)
        : undefined
  };
}
