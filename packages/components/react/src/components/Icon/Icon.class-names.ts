import type { ClassNameByElementJSON, IconIntent, IconScale, SurfaceContext } from '@kiskadee/core';
import {
  joinClassNames,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import type { IconProps } from './Icon.types.ts';

export const DEFAULT_ICON_SCALE: IconScale = 's:md:1';
export const DEFAULT_ICON_INTENT: IconIntent = 'neutral';
export const DEFAULT_ICON_SURFACE_CONTEXT: SurfaceContext = 'onSubtle';

export function resolveIconClassNames({
  e1,
  classNames,
  scale = DEFAULT_ICON_SCALE,
  intent = DEFAULT_ICON_INTENT,
  surfaceContext = DEFAULT_ICON_SURFACE_CONTEXT
}: {
  e1: ClassNameByElementJSON | undefined;
  classNames: NonNullable<IconProps['classNames']>;
  scale?: IconScale;
  intent?: IconIntent;
  surfaceContext?: SurfaceContext;
}): NonNullable<IconProps['classNames']> {
  return {
    e1:
      joinClassNames(
        resolveSchemaElementClassName(e1, {
          scale,
          intent,
          emphasis: 'medium',
          surfaceContext
        }),
        classNames.e1,
        'k-icn',
        'k-icn-e1'
      ) ?? ''
  };
}
