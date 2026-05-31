import { type ComponentType, type LazyExoticComponent, lazy, memo, Suspense, useMemo } from 'react';
import {
  DEFAULT_SWITCH_MODE,
  DEFAULT_SWITCH_VARIANT,
  hasSwitchActivationFeedbackEffect,
  resolveVariantElements
} from './Switch.class-names.ts';
import type { SwitchProps } from './Switch.types.ts';
import { SwitchCore } from './SwitchCore.tsx';
import type { SwitchWithEffectsProps } from './SwitchWithEffects.tsx';
import { useSwitchArtifactConfig } from './useSwitchArtifactConfig.ts';

const LazySwitchWithEffects = lazy(() => import('./SwitchWithEffects.tsx')) as LazyExoticComponent<
  ComponentType<SwitchWithEffectsProps>
>;

function SwitchRoot(props: SwitchProps) {
  const { variant = DEFAULT_SWITCH_VARIANT, mode = DEFAULT_SWITCH_MODE, thumbSize } = props;
  const { switchClassesMap, effects } = useSwitchArtifactConfig();
  const elements = resolveVariantElements(switchClassesMap, variant, mode);
  const shouldUseThumbSize = thumbSize !== false && effects.thumbSize;
  const hasActivationFeedback = useMemo(
    () => hasSwitchActivationFeedbackEffect(elements.e3),
    [elements.e3]
  );

  if (shouldUseThumbSize || hasActivationFeedback) {
    return (
      <Suspense fallback={<SwitchCore {...props} />}>
        <LazySwitchWithEffects {...props} />
      </Suspense>
    );
  }

  return <SwitchCore {...props} />;
}

export const Switch = memo(SwitchRoot);
