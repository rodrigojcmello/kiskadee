import type { BrandPackId } from '@kiskadee/brands';
import type { ThemeMode } from '@kiskadee/core';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useKiskadee } from './KiskadeeContext.tsx';

declare const process: { env: { NODE_ENV?: string } };

export type BrandPackComponentName = 'button';

export type BrandPackLoadRequest = {
  designSystem: string;
  pack: BrandPackId;
  segment: string;
  theme: ThemeMode;
  components: readonly BrandPackComponentName[];
};

export type LoadedBrandPackResources = BrandPackLoadRequest & {
  cacheKey: string;
  stylesheetHref: string;
  stylesheetSha256: string;
  classMaps: Partial<Record<BrandPackComponentName, unknown>>;
  intents: readonly `brand.${string}`[];
};

export type BrandPackLoader = (
  request: BrandPackLoadRequest
) => Promise<LoadedBrandPackResources | undefined>;

export type BrandPackContextValue = {
  resources: LoadedBrandPackResources;
  hasComponent: (componentName: string) => componentName is BrandPackComponentName;
  hasIntent: (intent: string) => intent is `brand.${string}`;
};

const BrandPackContext = createContext<BrandPackContextValue | undefined>(undefined);
const resourcePromiseCache = new Map<string, Promise<LoadedBrandPackResources | undefined>>();
const stylesheetPromiseCache = new Map<string, Promise<void>>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isValidComponentClassMap(value: unknown, componentName: string): boolean {
  if (!isRecord(value) || Object.keys(value).length === 0) return false;
  if (!('component' in value) && !('classMap' in value)) return true;
  return (
    value.component === componentName &&
    isRecord(value.classMap) &&
    Object.keys(value.classMap).length > 0
  );
}

export function createBrandPackResourceKey(request: BrandPackLoadRequest): string {
  const components = [...new Set(request.components)].sort();
  return [
    request.designSystem,
    request.pack,
    request.segment,
    request.theme,
    components.join(',')
  ].join('|');
}

function getCompatibilityError(
  resources: LoadedBrandPackResources,
  request: BrandPackLoadRequest
): Error | undefined {
  const expectedCacheKey = createBrandPackResourceKey(request);

  if (resources.cacheKey !== expectedCacheKey) {
    return new Error(
      `Brand-pack loader returned cacheKey "${resources.cacheKey}", expected "${expectedCacheKey}".`
    );
  }

  if (!/^[0-9a-f]{64}$/.test(resources.stylesheetSha256)) {
    return new Error('Brand-pack loader returned an invalid stylesheet SHA-256.');
  }
  if (resources.stylesheetHref.trim() === '') {
    return new Error('Brand-pack loader returned an empty stylesheet URL.');
  }
  if (
    resources.intents.length === 0 ||
    new Set(resources.intents).size !== resources.intents.length ||
    resources.intents.some((intent) => !intent.startsWith('brand.'))
  ) {
    return new Error('Brand-pack loader returned an invalid intent catalog.');
  }

  for (const key of ['designSystem', 'pack', 'segment', 'theme'] as const) {
    if (resources[key] !== request[key]) {
      return new Error(
        `Brand-pack loader returned ${key} "${resources[key]}", expected "${request[key]}".`
      );
    }
  }

  const providedComponents = new Set(resources.components);
  for (const componentName of request.components) {
    if (
      !providedComponents.has(componentName) ||
      !isValidComponentClassMap(resources.classMaps[componentName], componentName)
    ) {
      return new Error(
        `Brand-pack loader did not provide the requested "${componentName}" class map.`
      );
    }
  }

  return undefined;
}

function assertCompatibleResources(
  resources: LoadedBrandPackResources,
  request: BrandPackLoadRequest
): void {
  const error = getCompatibilityError(resources, request);
  if (error) throw error;
}

function sha256HexToIntegrity(sha256: string): string {
  const pairs = sha256.match(/.{2}/g);
  if (pairs?.length !== 32) {
    throw new Error('Brand-pack stylesheet SHA-256 must contain exactly 32 bytes.');
  }

  let binary = '';
  for (const pair of pairs) binary += String.fromCharCode(Number.parseInt(pair, 16));
  return `sha256-${btoa(binary)}`;
}

function ensureStylesheet(stylesheetHref: string, stylesheetSha256: string): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();

  const cached = stylesheetPromiseCache.get(stylesheetHref);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const existing = Array.from(
      document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    ).find((link) => link.href === new URL(stylesheetHref, window.location.href).href);

    if (existing?.dataset.kLoaded === 'true' || existing?.sheet) {
      existing.dataset.kLoaded = 'true';
      resolve();
      return;
    }

    const link = existing ?? document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheetHref;
    link.integrity = sha256HexToIntegrity(stylesheetSha256);
    link.dataset.kBrandPack = 'true';
    link.addEventListener(
      'load',
      () => {
        link.dataset.kLoaded = 'true';
        resolve();
      },
      { once: true }
    );
    link.addEventListener(
      'error',
      () => {
        stylesheetPromiseCache.delete(stylesheetHref);
        if (link.dataset.kBrandPack === 'true') link.remove();
        reject(new Error(`Failed to load Kiskadee brand-pack stylesheet: ${stylesheetHref}`));
      },
      { once: true }
    );

    if (!existing) document.head.appendChild(link);
  });

  stylesheetPromiseCache.set(stylesheetHref, promise);
  return promise;
}

async function loadResources(
  loader: BrandPackLoader,
  request: BrandPackLoadRequest
): Promise<LoadedBrandPackResources | undefined> {
  const cacheKey = createBrandPackResourceKey(request);
  const cached = resourcePromiseCache.get(cacheKey);
  if (cached) return cached;

  const pending = loader(request).then(async (resources) => {
    if (!resources) {
      resourcePromiseCache.delete(cacheKey);
      return undefined;
    }
    assertCompatibleResources(resources, request);
    await ensureStylesheet(resources.stylesheetHref, resources.stylesheetSha256);
    return resources;
  });
  resourcePromiseCache.set(cacheKey, pending);
  pending.catch(() => {
    resourcePromiseCache.delete(cacheKey);
  });
  return pending;
}

export function useBrandPack(): BrandPackContextValue | undefined {
  return useContext(BrandPackContext);
}

export function BrandPackBoundary({
  pack,
  components,
  fallback = null,
  children
}: {
  pack: BrandPackId;
  components: readonly BrandPackComponentName[];
  fallback?: ReactNode;
  children?: ReactNode;
}) {
  const { brandPackLoader, preloadedBrandPacks, designSystem, segment, theme } = useKiskadee();
  const componentSignature = [...new Set(components)].sort().join(',');
  const normalizedComponents = useMemo(
    () =>
      (componentSignature.length > 0
        ? componentSignature.split(',')
        : []) as BrandPackComponentName[],
    [componentSignature]
  );
  const request = useMemo<BrandPackLoadRequest>(
    () => ({
      designSystem,
      pack,
      segment,
      theme,
      components: normalizedComponents
    }),
    [designSystem, normalizedComponents, pack, segment, theme]
  );
  const cacheKey = createBrandPackResourceKey(request);
  const preloaded = preloadedBrandPacks?.[cacheKey];
  const preloadedCompatibilityError = useMemo(
    () => (preloaded ? getCompatibilityError(preloaded, request) : undefined),
    [preloaded, request]
  );
  const compatiblePreloaded = preloadedCompatibilityError ? undefined : preloaded;
  const [loaded, setLoaded] = useState<LoadedBrandPackResources | undefined>(undefined);
  const current = compatiblePreloaded ?? (loaded?.cacheKey === cacheKey ? loaded : undefined);

  useEffect(() => {
    let cancelled = false;
    if (preloadedCompatibilityError) {
      console.error(
        '[Kiskadee] Invalid preloaded brand-pack resources.',
        preloadedCompatibilityError
      );
      setLoaded(undefined);
      return () => {
        cancelled = true;
      };
    }
    if (compatiblePreloaded) {
      setLoaded(compatiblePreloaded);
      return () => {
        cancelled = true;
      };
    }
    if (!brandPackLoader) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          `[Kiskadee] BrandPackBoundary requested "${pack}", but the provider has no brandPackLoader or matching preloaded resource.`
        );
      }
      setLoaded(undefined);
      return () => {
        cancelled = true;
      };
    }

    setLoaded(undefined);
    void loadResources(brandPackLoader, request)
      .then((resources) => {
        if (cancelled) return;
        if (!resources && process.env.NODE_ENV !== 'production') {
          console.error(
            `[Kiskadee] Brand pack "${pack}" is not available for ${designSystem}/${segment}/${theme}.`
          );
        }
        setLoaded(resources);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('[Kiskadee] Unable to load the requested brand pack.', error);
        setLoaded(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [
    brandPackLoader,
    cacheKey,
    compatiblePreloaded,
    designSystem,
    pack,
    preloadedCompatibilityError,
    request,
    segment,
    theme
  ]);

  const value = useMemo<BrandPackContextValue | undefined>(() => {
    if (!current) return undefined;
    const componentNames = new Set<string>(current.components);
    const intents = new Set<string>(current.intents);
    return {
      resources: current,
      hasComponent: (componentName): componentName is BrandPackComponentName =>
        componentNames.has(componentName),
      hasIntent: (intent): intent is `brand.${string}` => intents.has(intent)
    };
  }, [current]);

  if (!value) return fallback;
  return <BrandPackContext.Provider value={value}>{children}</BrandPackContext.Provider>;
}
