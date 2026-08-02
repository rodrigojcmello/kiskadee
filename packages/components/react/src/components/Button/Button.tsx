import './Button.structural.scss';
import { Button as HeadlessButton, HeadlessProgress } from '@kiskadee/react-headless';
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  memo,
  type ReactNode,
  useContext,
  useEffect,
  useMemo
} from 'react';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { resolveProgressIndicatorClassName } from '../Progress/Progress.class-names.ts';
import type { ProgressClassesMap } from '../Progress/Progress.types.ts';
import { join, mergeButtonClassNames } from './Button.class-names.ts';
import type { ButtonClassesMap, ButtonProgressProps, ButtonProps } from './Button.types.ts';
import {
  resolveButtonFeedbackClassNamePatch,
  resolveButtonFeedbackEffectAvailability,
  useButtonActivationFeedbackController,
  useButtonFeedbackEffect
} from './effects/activation-feedback/index.ts';
import { useButtonClassNamesFromCommon, useButtonCommonProps } from './hooks/useButtonBase.ts';

declare const process: { env: { NODE_ENV?: string } };

export type {
  ButtonActivationFeedbackEffect,
  ButtonProgressProps,
  ButtonProps,
  ButtonStatus
} from './Button.types.ts';

type ButtonRuntimeContextValue = {
  progressAllowed: boolean;
  progressWarningRequired: boolean;
};

const ButtonRuntimeContext = createContext<ButtonRuntimeContextValue | null>(null);

function useButtonRuntimeContext(): ButtonRuntimeContextValue {
  const context = useContext(ButtonRuntimeContext);
  if (!context) {
    throw new Error('Button.Progress must be used within a Button');
  }
  return context;
}

const ButtonProgress = forwardRef<HTMLSpanElement, ButtonProgressProps>(function ButtonProgress(
  { className, intent, surfaceContext, value, min, max },
  ref
) {
  const { progressAllowed, progressWarningRequired } = useButtonRuntimeContext();
  const { classesMap } = useKiskadee();
  const progressClassesMap = useComponentClassMap(
    'progress',
    classesMap.progress as ProgressClassesMap | undefined
  );
  const indicatorPaintClassName = resolveProgressIndicatorClassName({
    element: progressClassesMap?.e3,
    intent,
    surfaceContext
  });

  useEffect(() => {
    if (!progressAllowed && progressWarningRequired && process.env.NODE_ENV !== 'production') {
      console.warn(
        '[Kiskadee] Button.Progress can only be rendered while Button is pending or status="pending".'
      );
    }
    if (
      progressAllowed &&
      progressClassesMap !== undefined &&
      !indicatorPaintClassName &&
      process.env.NODE_ENV !== 'production'
    ) {
      console.warn(
        '[Kiskadee] Button.Progress requires the active preset to publish Progress indicator paint.'
      );
    }
  }, [indicatorPaintClassName, progressAllowed, progressClassesMap, progressWarningRequired]);

  if (!progressAllowed || !indicatorPaintClassName) {
    return null;
  }

  return (
    <HeadlessProgress.Root
      ref={ref}
      mode="determinate"
      value={value}
      min={min}
      max={max}
      decorative
      classNames={{
        e1: join(className, 'k-prg', 'k-prg-e1', 'k-btn-x1'),
        e3: join(indicatorPaintClassName, 'k-prg-e3', 'k-btn-x2')
      }}
    >
      <HeadlessProgress.Indicator />
    </HeadlessProgress.Root>
  );
});

function normalizeButtonChildren(
  children: ReactNode,
  legacyIcon: ReactNode,
  legacyLabel: ReactNode
): ReactNode {
  const progressChildren: ReactNode[] = [];
  const contentChildren: ReactNode[] = [];

  for (const [index, child] of Children.toArray(children).entries()) {
    if (isValidElement(child) && child.type === ButtonProgress) {
      progressChildren.push(child);
      continue;
    }

    if (typeof child === 'string') {
      if (child.trim().length === 0) continue;
      contentChildren.push(
        <HeadlessButton.Label key={`button-text-${index}`}>{child}</HeadlessButton.Label>
      );
      continue;
    }

    if (typeof child === 'number' || typeof child === 'bigint') {
      contentChildren.push(
        <HeadlessButton.Label key={`button-text-${index}`}>{child}</HeadlessButton.Label>
      );
      continue;
    }

    contentChildren.push(child);
  }

  if (contentChildren.length === 0) {
    const hasLegacyIcon =
      Boolean(legacyIcon) && (typeof legacyIcon !== 'string' || legacyIcon.trim().length > 0);
    const hasLegacyLabel =
      Boolean(legacyLabel) && (typeof legacyLabel !== 'string' || legacyLabel.trim().length > 0);

    if (hasLegacyIcon) {
      contentChildren.push(
        <HeadlessButton.Icon key="button-legacy-icon">{legacyIcon}</HeadlessButton.Icon>
      );
    }
    if (hasLegacyLabel) {
      contentChildren.push(
        <HeadlessButton.Label key="button-legacy-label">{legacyLabel}</HeadlessButton.Label>
      );
    }
  }

  const normalizedChildren = [...progressChildren, ...contentChildren];
  return normalizedChildren.length > 0 ? normalizedChildren : undefined;
}

function ButtonRoot(props: ButtonProps) {
  const common = useButtonCommonProps(props);
  const normalizedChildren = useMemo(
    () => normalizeButtonChildren(props.children, common.icon, common.label),
    [props.children, common.icon, common.label]
  );
  const feedbackEffectAvailability = useMemo(
    () =>
      resolveButtonFeedbackEffectAvailability({
        activationFeedback: common.activationFeedback,
        element: common.e1
      }),
    [common.activationFeedback, common.e1]
  );
  const feedbackEffect = useButtonFeedbackEffect(feedbackEffectAvailability);
  const activationFeedbackController = useButtonActivationFeedbackController(common, {
    feedbackEnabled: Boolean(feedbackEffect.loadedFeedbackKind)
  });
  const elements = useMemo<ButtonClassesMap>(
    () => ({
      e1: common.e1,
      e2: common.e2,
      e3: common.e3
    }),
    [common.e1, common.e2, common.e3]
  );
  const feedbackClassNamePatch = useMemo(
    () =>
      resolveButtonFeedbackClassNamePatch({
        activationFeedbackEffect: feedbackEffect.activationFeedbackEffect,
        activationFeedbackConfig: activationFeedbackController.activationFeedbackConfig,
        activationFeedbackProfile: activationFeedbackController.activationFeedbackProfile,
        controlState: common.controlState,
        elements,
        emphasis: common.emphasis,
        feedbackKind: activationFeedbackController.feedbackKind,
        isActive: activationFeedbackController.isFeedbackActive,
        isFading: activationFeedbackController.isFeedbackFading,
        shouldForceOverlayPressed: activationFeedbackController.shouldForceOverlayPressed,
        shouldUsePressedProfile: activationFeedbackController.shouldUsePressedProfile
      }),
    [
      activationFeedbackController.activationFeedbackConfig,
      activationFeedbackController.activationFeedbackProfile,
      activationFeedbackController.feedbackKind,
      activationFeedbackController.isFeedbackActive,
      activationFeedbackController.isFeedbackFading,
      activationFeedbackController.shouldForceOverlayPressed,
      activationFeedbackController.shouldUsePressedProfile,
      common.controlState,
      common.emphasis,
      elements,
      feedbackEffect.activationFeedbackEffect
    ]
  );
  const baseClassNames = useButtonClassNamesFromCommon(common, {
    statusOverride: activationFeedbackController.shouldForceOverlayPressed
      ? 'rest'
      : activationFeedbackController.visualStatus
  });
  const computedClassNames = useMemo(
    () =>
      mergeButtonClassNames(
        baseClassNames,
        feedbackClassNamePatch,
        activationFeedbackController.shouldUsePressedFeedback ? { e1: 'k-pressed' } : undefined
      ),
    [feedbackClassNamePatch, activationFeedbackController.shouldUsePressedFeedback, baseClassNames]
  );
  const runtimeContextValue = useMemo<ButtonRuntimeContextValue>(
    () => ({
      progressAllowed: activationFeedbackController.visualStatus === 'pending',
      progressWarningRequired: common.pending !== true && common.status !== 'pending'
    }),
    [activationFeedbackController.visualStatus, common.pending, common.status]
  );

  return (
    <ButtonRuntimeContext.Provider value={runtimeContextValue}>
      <HeadlessButton
        {...common.restProps}
        disabled={activationFeedbackController.nativeDisabled}
        pending={activationFeedbackController.pending}
        interactionLocked={common.interactionLocked}
        aria-busy={activationFeedbackController.ariaBusy}
        aria-disabled={activationFeedbackController.ariaDisabled}
        aria-pressed={activationFeedbackController.ariaPressed}
        classNames={computedClassNames}
        ref={activationFeedbackController.hostRef}
        onClick={activationFeedbackController.handlers.onClick}
        onPointerDown={activationFeedbackController.handlers.onPointerDown}
        onPointerUp={activationFeedbackController.handlers.onPointerUp}
        onPointerCancel={activationFeedbackController.handlers.onPointerCancel}
        onKeyDown={activationFeedbackController.handlers.onKeyDown}
        onKeyUp={activationFeedbackController.handlers.onKeyUp}
        onBlur={activationFeedbackController.handlers.onBlur}
        tabIndex={common.tabIndex ?? 0}
      >
        {normalizedChildren}
      </HeadlessButton>
    </ButtonRuntimeContext.Provider>
  );
}

const MemoButton = memo(ButtonRoot);
const CompoundButton = Object.assign(MemoButton, {
  Label: HeadlessButton.Label,
  Icon: HeadlessButton.Icon,
  Progress: ButtonProgress
});

export { CompoundButton as Button };
