type LoadComponentArtifact = <T>(componentName: string) => Promise<T | undefined>;

const componentArtifactPromiseCache = new Map<string, Promise<unknown | undefined>>();

function getOrCreateCachedArtifactPromise<T>({
  cacheKey,
  load
}: {
  cacheKey: string;
  load: () => Promise<T | undefined>;
}): Promise<T | undefined> {
  let cached = componentArtifactPromiseCache.get(cacheKey);

  if (!cached) {
    const pending = Promise.resolve().then(load);
    componentArtifactPromiseCache.set(cacheKey, pending);
    void pending.catch(() => {
      if (componentArtifactPromiseCache.get(cacheKey) === pending) {
        componentArtifactPromiseCache.delete(cacheKey);
      }
    });
    cached = pending;
  }

  return cached as Promise<T | undefined>;
}

export function getComponentArtifactCacheKey({
  designSystem,
  artifactVersion,
  artifactKind = 'metadata',
  segment,
  theme,
  componentName
}: {
  designSystem: string;
  artifactVersion: string | undefined;
  artifactKind?: string;
  segment?: string;
  theme?: string;
  componentName: string;
}): string {
  return [
    designSystem,
    artifactVersion ?? 'default',
    artifactKind,
    segment ?? 'global',
    theme ?? 'global',
    componentName
  ].join('::');
}

export function loadCachedArtifact<T>({
  cacheKey,
  load
}: {
  cacheKey: string;
  load: () => Promise<T | undefined>;
}): Promise<T | undefined> {
  return getOrCreateCachedArtifactPromise({ cacheKey, load }).catch(() => undefined);
}

export function loadCachedArtifactOrThrow<T>({
  cacheKey,
  load
}: {
  cacheKey: string;
  load: () => Promise<T | undefined>;
}): Promise<T | undefined> {
  return getOrCreateCachedArtifactPromise({ cacheKey, load });
}

export function loadCachedComponentArtifact<T>({
  cacheKey,
  componentName,
  loadComponentArtifact
}: {
  cacheKey: string;
  componentName: string;
  loadComponentArtifact: LoadComponentArtifact;
}): Promise<T | undefined> {
  return loadCachedArtifact({
    cacheKey,
    load: () => loadComponentArtifact<T>(componentName)
  });
}
