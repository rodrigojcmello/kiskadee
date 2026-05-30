type LoadComponentArtifact = <T>(componentName: string) => Promise<T | undefined>;

const componentArtifactPromiseCache = new Map<string, Promise<unknown | undefined>>();

export function getComponentArtifactCacheKey({
  designSystem,
  artifactVersion,
  componentName
}: {
  designSystem: string;
  artifactVersion: string | undefined;
  componentName: string;
}): string {
  return [designSystem, artifactVersion ?? 'default', componentName].join('::');
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
  let cached = componentArtifactPromiseCache.get(cacheKey);

  if (!cached) {
    cached = loadComponentArtifact<T>(componentName).catch(() => {
      componentArtifactPromiseCache.delete(cacheKey);
      return undefined;
    });
    componentArtifactPromiseCache.set(cacheKey, cached);
  }

  return cached as Promise<T | undefined>;
}
