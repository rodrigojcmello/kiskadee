import './Button.css';
import './ButtonActivationFeedback.css';
import { Button as HeadlessButton } from '@kiskadee/react-headless';
import { type ComponentType, type LazyExoticComponent, lazy, memo, Suspense, useMemo } from 'react';
import type { ButtonProps } from './Button.types.ts';
import { ButtonCore } from './ButtonCore.tsx';
import type { ButtonWithActivationFeedbackProps } from './ButtonWithActivationFeedback.tsx';
import type { ButtonWithRippleProps } from './ButtonWithRipple.tsx';
import { resolveActivationFeedbackProfileAvailability } from '../../hooks/effects/activation-feedback/activationFeedbackProfileAvailability.ts';
import { resolveRippleModeAvailability } from './rippleModeAvailability.ts';
import { useButtonArtifactConfig } from './useButtonArtifactConfig.ts';

export type {
  ButtonActivationFeedbackEffect,
  ButtonProps,
  ButtonRippleEffect,
  ButtonStatus
} from './Button.types.ts';

// [RIPPLE EFFECT 20] START: Lazy-load and availability gate.
const LazyButtonWithActivationFeedback = lazy(
  () => import('./ButtonWithActivationFeedback.tsx')
) as LazyExoticComponent<ComponentType<ButtonWithActivationFeedbackProps>>;

const LazyButtonWithRipple = lazy(() => import('./ButtonWithRipple.tsx')) as LazyExoticComponent<
  ComponentType<ButtonWithRippleProps>
>;

function shouldRenderActivationFeedbackButton(
  availableProfiles: ReturnType<typeof resolveActivationFeedbackProfileAvailability>,
  activationFeedback: ButtonProps['activationFeedback'],
  rippleEffect: ButtonProps['rippleEffect']
): boolean {
  if (availableProfiles.length === 0) return false;
  if (activationFeedback === false) return false;
  if (rippleEffect === false) return false;
  return true;
}

function shouldRenderRippleButton(
  availableModes: ReturnType<typeof resolveRippleModeAvailability>,
  activationFeedback: ButtonProps['activationFeedback'],
  rippleEffect: ButtonProps['rippleEffect']
): boolean {
  if (availableModes.length === 0) return false;
  // Explicit activationFeedback=false opts out of both the modern and legacy feedback paths.
  if (activationFeedback === false) return false;
  if (rippleEffect === false) return false;
  return true;
}
// [RIPPLE EFFECT 20] END: Lazy-load and availability gate.

function Button(props: ButtonProps) {
  const { buttonClassesMap } = useButtonArtifactConfig();
  const e1 = buttonClassesMap?.e1;
  const availableActivationFeedbackProfiles = useMemo(
    () => resolveActivationFeedbackProfileAvailability(e1),
    [e1]
  );
  const availableRippleModes = useMemo(() => resolveRippleModeAvailability(e1), [e1]);

  const hasActivationFeedback = useMemo(() => {
    return shouldRenderActivationFeedbackButton(
      availableActivationFeedbackProfiles,
      props.activationFeedback,
      props.rippleEffect
    );
  }, [availableActivationFeedbackProfiles, props.activationFeedback, props.rippleEffect]);

  // [RIPPLE EFFECT 21] START: Runtime path selection (Core vs. WithRipple).
  const hasRipple = useMemo(() => {
    return shouldRenderRippleButton(
      availableRippleModes,
      props.activationFeedback,
      props.rippleEffect
    );
  }, [availableRippleModes, props.activationFeedback, props.rippleEffect]);

  if (hasActivationFeedback) {
    return (
      <Suspense fallback={<ButtonCore {...props} />}>
        <LazyButtonWithActivationFeedback
          {...props}
          availableActivationFeedbackProfiles={availableActivationFeedbackProfiles}
        />
      </Suspense>
    );
  }

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
