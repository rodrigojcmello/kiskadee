import { useKiskadee, useShowcase } from '@kiskadee/react-components/resources';
import type { ComponentResourceArtifact, Manifest } from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';

/** Inspection metadata is requested only by the route that actually inspects those components. */
export function useShowcaseMetadata(names: readonly string[]) {
  const showcase = useShowcase();
  const {
    loadComponentArtifact,
    artifactVersion,
    segment,
    theme,
    registerComponent,
    componentArtifacts
  } = useKiskadee();
  const key = [...names].sort().join('|');
  useEffect(() => {
    const releases = key.split('|').map((name) => registerComponent?.(name));
    return () => {
      for (const release of releases) release?.();
    };
  }, [registerComponent, key]);
  const selectionKey = [artifactVersion, segment, theme, key].join('|');
  const [loaded, setLoaded] = useState<{
    key: string;
    values: Record<string, ComponentResourceArtifact>;
  }>({ key: '', values: {} });
  const metadata = {
    ...(loaded.key === selectionKey ? loaded.values : {}),
    ...componentArtifacts
  } as Record<string, ComponentResourceArtifact>;
  useEffect(() => {
    let cancelled = false;
    if (!loadComponentArtifact) return;
    void Promise.all(
      key
        .split('|')
        .map(
          async (name) =>
            [name, await loadComponentArtifact<ComponentResourceArtifact>(name)] as const
        )
    )
      .then((entries) => {
        if (!cancelled)
          setLoaded({
            key: selectionKey,
            values: Object.fromEntries(
              entries.filter(
                (entry): entry is readonly [string, ComponentResourceArtifact] =>
                  entry[1] !== undefined
              )
            )
          });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ key: selectionKey, values: {} });
      });
    return () => {
      cancelled = true;
    };
  }, [loadComponentArtifact, artifactVersion, segment, theme, key, selectionKey]);
  const manifest: Manifest | undefined = showcase.manifest
    ? {
        ...showcase.manifest,
        components: Object.fromEntries(
          Object.entries(showcase.manifest.components ?? {}).map(([name, entry]) => [
            name,
            { ...entry, ...metadata[name]?.capabilities }
          ])
        )
      }
    : undefined;
  return { ...showcase, manifest };
}
