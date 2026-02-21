import { Button as HeadlessButton } from '@kiskadee/react-headless';
import { type ComponentType, type LazyExoticComponent, lazy, memo, Suspense, useMemo } from 'react';
import './Button.scss';
import { useKiskadee } from '../contexts/KiskadeeContext';
import type { ButtonProps } from './Button.types';
import { ButtonCore } from './ButtonCore';
import type { ButtonWithRippleProps } from './ButtonWithRipple';
import { resolveRippleModeAvailability } from './rippleModeAvailability';

export type { ButtonProps, ButtonRippleEffect, ButtonStatus } from './Button.types';

// [RIPPLE EFFECT 20] START: Lazy-load and availability gate.
const LazyButtonWithRipple = lazy(() => import('./ButtonWithRipple')) as LazyExoticComponent<
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
  const {
    classesMap: { button: { e1 } = {} }
  } = useKiskadee();
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
