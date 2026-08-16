import { useEffect, useState, useSyncExternalStore } from 'react';

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export type LazyModuleCache<TModule> = {
  load: () => Promise<TModule>;
  read: () => TModule | null;
};

export function createLazyModuleCache<TModule>(
  importModule: () => Promise<TModule>
): LazyModuleCache<TModule> {
  let cachedModule: TModule | null = null;
  let cachedPromise: Promise<TModule> | null = null;

  const load = () => {
    if (cachedModule) return Promise.resolve(cachedModule);

    cachedPromise ??= importModule().then((module) => {
      cachedModule = module;
      return module;
    });

    return cachedPromise;
  };

  return {
    load,
    read: () => cachedModule
  };
}

export function useLazyModule<TModule>(
  cache: LazyModuleCache<TModule>,
  enabled: boolean
): TModule | null {
  const canReadCache = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  );
  const [module, setModule] = useState<TModule | null>(null);
  const resolvedModule = module ?? (canReadCache ? cache.read() : null);

  useEffect(() => {
    if (!enabled || resolvedModule) return;

    const cachedModule = cache.read();
    if (cachedModule) {
      setModule(cachedModule);
      return;
    }

    let isCurrent = true;

    cache.load().then((loadedModule) => {
      if (isCurrent) setModule(loadedModule);
    });

    return () => {
      isCurrent = false;
    };
  }, [cache, enabled, resolvedModule]);

  return enabled ? resolvedModule : null;
}
