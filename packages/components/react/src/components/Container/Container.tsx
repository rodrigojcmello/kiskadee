'use client';

import type { ComponentEmphasis, ContainerIntent } from '@kiskadee/core';
import { forwardRef } from 'react';
import {
  joinClassNames,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import { withComponentResources } from '../../shared/contexts/ComponentResourceBoundary.tsx';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { SurfaceContextProvider } from '../../shared/contexts/SurfaceContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { useComponentMetadata } from '../../shared/contexts/useComponentMetadata.ts';
import { useProducedSurfaceContext } from '../../shared/contexts/useProducedSurfaceContext.ts';
import type { ContainerClassesMap, ContainerProps } from './Container.types.ts';

export type { ContainerClassesMap, ContainerProps } from './Container.types.ts';

const DEFAULT_CONTAINER_INTENT: ContainerIntent = 'neutral';
const DEFAULT_CONTAINER_EMPHASIS: ComponentEmphasis = 'medium';

const ContainerRoot = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  {
    children,
    className,
    intent = DEFAULT_CONTAINER_INTENT,
    emphasis = DEFAULT_CONTAINER_EMPHASIS,
    surfaceContext,
    ...restProps
  },
  ref
) {
  const { classesMap } = useKiskadee();
  const containerClassesMap = useComponentClassMap(
    'container',
    classesMap.container as ContainerClassesMap | undefined
  );
  const containerMetadata = useComponentMetadata('container');
  const { consumedSurfaceContext, resolveProducedSurfaceContext } = useProducedSurfaceContext({
    map: containerMetadata?.contentSurfaceContext,
    surfaceContext,
    intent,
    emphasis
  });
  const resolvedClassName = joinClassNames(
    resolveSchemaElementClassName(containerClassesMap?.e1, {
      intent,
      emphasis,
      surfaceContext: consumedSurfaceContext
    }),
    className,
    'k-cnt',
    'k-trn'
  );

  return (
    <div {...restProps} ref={ref} className={resolvedClassName}>
      <SurfaceContextProvider value={resolveProducedSurfaceContext()}>
        {children}
      </SurfaceContextProvider>
    </div>
  );
});

export const Container = withComponentResources('container', ContainerRoot);
