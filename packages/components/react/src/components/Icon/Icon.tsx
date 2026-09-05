import { Icon as HeadlessIcon } from '@kiskadee/react-headless';
import { forwardRef, useMemo } from 'react';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { resolveIconClassNames } from './Icon.class-names.ts';
import type { IconClassesMap, IconProps } from './Icon.types.ts';

export type { IconClassesMap, IconElementName, IconProps, IconVisualProps } from './Icon.types.ts';

export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { classNames = {}, scale, intent, surfaceContext, children, ...headlessProps },
  ref
) {
  const { classesMap } = useKiskadee();
  const resolvedSurfaceContext = useSurfaceContext(surfaceContext);
  const iconClassesMap = useComponentClassMap(
    'icon',
    classesMap.icon as IconClassesMap | undefined
  );
  const resolvedClassNames = useMemo(
    () =>
      resolveIconClassNames({
        e1: iconClassesMap?.e1,
        classNames,
        scale,
        intent,
        surfaceContext: resolvedSurfaceContext
      }),
    [classNames, iconClassesMap?.e1, intent, resolvedSurfaceContext, scale]
  );

  return (
    <HeadlessIcon {...headlessProps} ref={ref} classNames={resolvedClassNames}>
      {children}
    </HeadlessIcon>
  );
});

export default Icon;
