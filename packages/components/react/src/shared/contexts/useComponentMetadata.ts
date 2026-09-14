import type { ComponentResourceArtifact } from '@kiskadee/web-builder/types';
import type { KiskadeeComponentConfigs } from './KiskadeeContext.tsx';
import { useLoadedComponentArtifact } from './useLoadedComponentArtifact.ts';

type Config<K extends string> = K extends keyof KiskadeeComponentConfigs
  ? KiskadeeComponentConfigs[K]
  : Record<string, unknown>;
export type ComponentMetadata<K extends string = string> = ComponentResourceArtifact &
  NonNullable<Config<K>>;
const isMetadata = (value: unknown): value is ComponentMetadata =>
  Boolean(value && typeof value === 'object' && 'component' in value);

export function useComponentMetadata<K extends string>(
  component: K
): ComponentMetadata<K> | undefined {
  const result = useLoadedComponentArtifact({
    componentName: component,
    isArtifact: isMetadata,
    preservePrevious: true
  });
  return (result.currentArtifact ?? result.previousArtifact) as ComponentMetadata<K> | undefined;
}
