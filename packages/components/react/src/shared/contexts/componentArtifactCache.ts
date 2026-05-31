type LoadComponentArtifact = <T>(componentName: string) => Promise<T | undefined>;

const componentArtifactPromiseCache = new Map<string, Promise<unknown | undefined>>();

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
  let cached = componentArtifactPromiseCache.get(cacheKey);

  if (!cached) {
    cached = load().catch(() => {
      componentArtifactPromiseCache.delete(cacheKey);
      return undefined;
    });
    componentArtifactPromiseCache.set(cacheKey, cached);
  }

  return cached as Promise<T | undefined>;
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
