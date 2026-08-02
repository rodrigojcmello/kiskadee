import type {
  ClassNameByElementJSON,
  ProgressIntent,
  ProgressScale,
  SurfaceContext
} from '@kiskadee/core';
import {
  joinClassNames,
  resolveRadiusClassName,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import type { ProgressClassNames } from './Progress.types.ts';

export const DEFAULT_PROGRESS_INTENT: ProgressIntent = 'neutral';
export const DEFAULT_PROGRESS_SURFACE_CONTEXT: SurfaceContext = 'onSubtle';

export const DEFAULT_PROGRESS_SCALE: ProgressScale = 's:md:1';

function resolveProgressElementClassName(
  element: ClassNameByElementJSON | undefined,
  options: {
    intent: ProgressIntent;
    surfaceContext: SurfaceContext;
    scale: ProgressScale;
  }
): string {
  return resolveSchemaElementClassName(element, {
    scale: options.scale,
    intent: options.intent,
    emphasis: 'medium',
    surfaceContext: options.surfaceContext
  });
}

export function resolveProgressIndicatorClassName({
  element,
  intent = DEFAULT_PROGRESS_INTENT,
  surfaceContext = DEFAULT_PROGRESS_SURFACE_CONTEXT,
  scale = DEFAULT_PROGRESS_SCALE
}: {
  element: ClassNameByElementJSON | undefined;
  intent?: ProgressIntent;
  surfaceContext?: SurfaceContext;
  scale?: ProgressScale;
}): string {
  return resolveProgressElementClassName(element, {
    intent,
    surfaceContext,
    scale
  });
}

export function resolveProgressClassNames({
  e1,
  e2,
  e3,
  className,
  classNames,
  intent = DEFAULT_PROGRESS_INTENT,
  surfaceContext = DEFAULT_PROGRESS_SURFACE_CONTEXT,
  scale = DEFAULT_PROGRESS_SCALE
}: {
  e1: ClassNameByElementJSON | undefined;
  e2: ClassNameByElementJSON | undefined;
  e3: ClassNameByElementJSON | undefined;
  className?: string;
  classNames: ProgressClassNames;
  intent?: ProgressIntent;
  surfaceContext?: SurfaceContext;
  scale?: ProgressScale;
}): Required<ProgressClassNames> {
  const options = { intent, surfaceContext, scale };
  const trackOptions = {
    intent: DEFAULT_PROGRESS_INTENT,
    surfaceContext,
    scale
  };

  return {
    e1:
      joinClassNames(
        resolveProgressElementClassName(e1, options),
        classNames.e1,
        className,
        'k-prg',
        'k-prg-e1'
      ) ?? '',
    e2:
      joinClassNames(
        resolveProgressElementClassName(e2, trackOptions),
        resolveRadiusClassName(e2, scale, 'pill'),
        classNames.e2,
        'k-prg-e2'
      ) ?? '',
    e3:
      joinClassNames(
        resolveProgressElementClassName(e3, options),
        resolveRadiusClassName(e3, scale, 'pill'),
        classNames.e3,
        'k-prg-e3'
      ) ?? ''
  };
}
