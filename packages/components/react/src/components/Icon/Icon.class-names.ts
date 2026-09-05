import type { ClassNameByElementJSON, IconIntent, IconScale, SurfaceContext } from '@kiskadee/core';
import {
  joinClassNames,
  resolveScaleClassName,
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
  foreground,
  surfaceContext = DEFAULT_ICON_SURFACE_CONTEXT
}: {
  e1: ClassNameByElementJSON | undefined;
  classNames: NonNullable<IconProps['classNames']>;
  scale?: IconScale;
  intent?: IconIntent;
  foreground?: 'inherit';
  surfaceContext?: SurfaceContext;
}): NonNullable<IconProps['classNames']> {
  return {
    e1:
      joinClassNames(
        foreground === 'inherit'
          ? joinClassNames(e1?.d, resolveScaleClassName(e1, scale))
          : resolveSchemaElementClassName(e1, {
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
