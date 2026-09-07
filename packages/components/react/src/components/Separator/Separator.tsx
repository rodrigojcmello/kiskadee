'use client';

import './Separator.structural.scss';
import { forwardRef } from 'react';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { resolveSeparatorClassName } from './Separator.class-names.ts';
import type { SeparatorClassesMap, SeparatorProps } from './Separator.types.ts';

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(function Separator(
  { className, orientation = 'horizontal', emphasis = 'medium', surfaceContext, ...props },
  ref
) {
  const resolvedSurfaceContext = useSurfaceContext(surfaceContext);
  const { classesMap } = useKiskadee();
  const separatorClassesMap = useComponentClassMap(
    'separator',
    classesMap.separator as SeparatorClassesMap | undefined
  );

  return (
    <hr
      {...props}
      ref={ref}
      aria-orientation={orientation}
      className={resolveSeparatorClassName(
        separatorClassesMap?.e1,
        className,
        emphasis,
        resolvedSurfaceContext
      )}
    />
  );
});

export default Separator;
