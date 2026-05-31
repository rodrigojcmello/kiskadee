import './Button.css';
import { Button as HeadlessButton } from '@kiskadee/react-headless';
import { type ComponentType, type LazyExoticComponent, lazy, memo, Suspense, useMemo } from 'react';
import type { ButtonProps } from './Button.types.ts';
import { ButtonCore } from './ButtonCore.tsx';
import type { ButtonWithRippleProps } from './ButtonWithRipple.tsx';
import { resolveRippleModeAvailability } from './rippleModeAvailability.ts';
import { useButtonArtifactConfig } from './useButtonArtifactConfig.ts';

export type { ButtonProps, ButtonRippleEffect, ButtonStatus } from './Button.types.ts';

// [RIPPLE EFFECT 20] START: Lazy-load and availability gate.
const LazyButtonWithRipple = lazy(() => import('./ButtonWithRipple.tsx')) as LazyExoticComponent<
  ComponentType<ButtonWithRippleProps>
>;

function shouldRenderRippleButton(
  availableModes: ReturnType<typeof resolveRippleModeAvailability>,
  rippleEffect: ButtonProps['rippleEffect']
): boolean {
  if (availableModes.length === 0) return false;
  if (rippleEffect === false) return false;
  return true;
}
// [RIPPLE EFFECT 20] END: Lazy-load and availability gate.

function Button(props: ButtonProps) {
  const { buttonClassesMap } = useButtonArtifactConfig();
  const e1 = buttonClassesMap?.e1;
  const availableRippleModes = useMemo(() => resolveRippleModeAvailability(e1), [e1]);

  // [RIPPLE EFFECT 21] START: Runtime path selection (Core vs. WithRipple).
  const hasRipple = useMemo(() => {
    return shouldRenderRippleButton(availableRippleModes, props.rippleEffect);
  }, [availableRippleModes, props.rippleEffect]);

  if (hasRipple) {
    return (
      <Suspense fallback={<ButtonCore {...props} />}>
        <LazyButtonWithRipple {...props} availableRippleModes={availableRippleModes} />
      </Suspense>
    );
  }
  // [RIPPLE EFFECT 21] END: Runtime path selection (Core vs WithRipple).

  return <ButtonCore {...props} />;
}

const MemoButton = memo(Button);
const CompoundButton = Object.assign(MemoButton, {
  Label: HeadlessButton.Label,
  Icon: HeadlessButton.Icon
});

export { CompoundButton as Button };
