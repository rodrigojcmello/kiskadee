import { acquirePointerModality } from '@kiskadee/runtime/pointer-modality';
import { type ComponentType, createElement, forwardRef, type ReactNode, useEffect } from 'react';
import { useKiskadee } from './KiskadeeContext.tsx';
import { useComponentClassMapResolution } from './useComponentClassMap.ts';
import { useLoadedComponentArtifact } from './useLoadedComponentArtifact.ts';

const isMetadata = (value: unknown): value is { component: string } =>
  Boolean(value && typeof value === 'object' && 'component' in value);

/** Keeps a component's first paint behind its metadata/map/CSS handoff, without a DOM wrapper. */
export function ComponentResourceBoundary({
  component,
  children
}: {
  component: string;
  children: ReactNode;
}) {
  useEffect(() => acquirePointerModality(), []);
  const context = useKiskadee();
  const metadata = useLoadedComponentArtifact({
    componentName: component,
    isArtifact: isMetadata,
    preservePrevious: true
  });
  const map = useComponentClassMapResolution(
    component,
    context.classesMap[component as keyof typeof context.classesMap]
  );
  if (!context.loadComponentArtifact && !context.loadComponentClassMap) return children;
  if (metadata.error || map.error)
    return (
      <span role="alert">
        Unable to load component.{' '}
        <button
          type="button"
          onClick={() => {
            metadata.retry();
            map.retry();
          }}
        >
          Retry
        </button>
      </span>
    );
  if (
    (context.loadComponentArtifact && !metadata.currentArtifact) ||
    (!map.classMap && map.pending)
  )
    return null;
  return children;
}

export function withComponentResources<T extends ComponentType<any>>(
  component: string,
  Runtime: T
): T {
  const Ready = forwardRef<unknown, Record<string, unknown>>(
    function ComponentResources(props, ref) {
      return (
        <ComponentResourceBoundary component={component}>
          {createElement(Runtime, { ...props, ref })}
        </ComponentResourceBoundary>
      );
    }
  );
  Ready.displayName = `Ready(${Runtime.displayName ?? component})`;
  return Ready as unknown as T;
}
