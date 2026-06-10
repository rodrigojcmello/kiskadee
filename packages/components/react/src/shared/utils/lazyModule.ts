import { useEffect, useState } from 'react';

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
  const [module, setModule] = useState<TModule | null>(cache.read());

  useEffect(() => {
    if (!enabled || module) return;

    let isCurrent = true;

    cache.load().then((loadedModule) => {
      if (isCurrent) setModule(loadedModule);
    });

    return () => {
      isCurrent = false;
    };
  }, [cache, enabled, module]);

  return enabled ? module : null;
}
