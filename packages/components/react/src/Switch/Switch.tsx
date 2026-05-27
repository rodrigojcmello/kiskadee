import { type ComponentType, type LazyExoticComponent, lazy, memo, Suspense, useMemo } from 'react';
import { useKiskadee } from '../contexts/KiskadeeContext.tsx';
import {
  DEFAULT_SWITCH_MODE,
  DEFAULT_SWITCH_SCALE,
  DEFAULT_SWITCH_VARIANT,
  hasSwitchThumbSizeEffect,
  resolveVariantElements
} from './Switch.class-names.ts';
import { SwitchCore } from './SwitchCore.tsx';
import type { SwitchProps, SwitchVariantClassesMap } from './Switch.types.ts';
import type { SwitchWithThumbSizeProps } from './SwitchWithThumbSize.tsx';

const LazySwitchWithThumbSize = lazy(
  () => import('./SwitchWithThumbSize.tsx')
) as LazyExoticComponent<ComponentType<SwitchWithThumbSizeProps>>;

function SwitchRoot(props: SwitchProps) {
  const {
    scale = DEFAULT_SWITCH_SCALE,
    variant = DEFAULT_SWITCH_VARIANT,
    mode = DEFAULT_SWITCH_MODE
  } = props;
  const { classesMap } = useKiskadee();
  const elements = resolveVariantElements(
    classesMap.switch as SwitchVariantClassesMap | undefined,
    variant,
    mode
  );
  const hasThumbSize = useMemo(
    () => hasSwitchThumbSizeEffect(elements.e3, scale),
    [elements.e3, scale]
  );

  if (hasThumbSize) {
    return (
      <Suspense fallback={<SwitchCore {...props} />}>
        <LazySwitchWithThumbSize {...props} />
      </Suspense>
    );
  }

  return <SwitchCore {...props} />;
}

export const Switch = memo(SwitchRoot);
