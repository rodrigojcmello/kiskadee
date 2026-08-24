import './Progress.structural.scss';
import { HeadlessProgress } from '@kiskadee/react-headless';
import { forwardRef, useMemo } from 'react';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { useSurfaceContext } from '../../shared/contexts/SurfaceContext.tsx';
import { resolveProgressClassNames } from './Progress.class-names.ts';
import type { ProgressClassesMap, ProgressProps } from './Progress.types.ts';

function useResolvedProgressClassNames(props: ProgressProps) {
  const { className, classNames = {}, intent, scale, surfaceContext } = props;
  const { classesMap } = useKiskadee();
  const resolvedSurfaceContext = useSurfaceContext(surfaceContext);
  const progressClassesMap = useComponentClassMap(
    'progress',
    classesMap.progress as ProgressClassesMap | undefined
  );
  const resolvedClassNames = useMemo(
    () =>
      resolveProgressClassNames({
        e1: progressClassesMap?.e1,
        e2: progressClassesMap?.e2,
        e3: progressClassesMap?.e3,
        className,
        classNames,
        intent,
        scale,
        surfaceContext: resolvedSurfaceContext
      }),
    [
      className,
      classNames,
      intent,
      progressClassesMap?.e1,
      progressClassesMap?.e2,
      progressClassesMap?.e3,
      scale,
      resolvedSurfaceContext
    ]
  );
  return resolvedClassNames;
}

export const Progress = forwardRef<HTMLSpanElement, ProgressProps>(function Progress(props, ref) {
  const {
    className: _className,
    classNames: _classNames,
    intent: _intent,
    scale: _scale,
    surfaceContext: _surfaceContext,
    ...headlessProps
  } = props;
  const resolvedClassNames = useResolvedProgressClassNames(props);

  return (
    <HeadlessProgress.Root
      {...headlessProps}
      ref={ref}
      classNames={resolvedClassNames}
      decorative={false}
    >
      <HeadlessProgress.Track>
        <HeadlessProgress.Indicator />
      </HeadlessProgress.Track>
    </HeadlessProgress.Root>
  );
});

export default Progress;
