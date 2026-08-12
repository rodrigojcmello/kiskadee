import './Button.structural.scss';
import type { ButtonIconTreatment } from '@kiskadee/core';
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
import { useResolvedIconGlyph } from '../../shared/contexts/IconFamilyContext.tsx';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { IconGlyph } from '../Icon/IconGlyph.tsx';
import { resolveProgressIndicatorClassName } from '../Progress/Progress.class-names.ts';
import type { ProgressClassesMap } from '../Progress/Progress.types.ts';
import { join, mergeButtonClassNames } from './Button.class-names.ts';
import type {
  ButtonClassesMap,
  ButtonIconProps,
  ButtonProgressProps,
  ButtonProps
} from './Button.types.ts';
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
  ButtonIconProps,
  ButtonIconSurfaceCorners,
  ButtonIconTreatment,
  ButtonProgressProps,
  ButtonProps,
  ButtonStatus
} from './Button.types.ts';

type ButtonRuntimeContextValue = {
  iconRegionClassName: string | undefined;
  iconTreatment: ButtonIconTreatment;
  progressAllowed: boolean;
  progressWarningRequired: boolean;
};

const ButtonRuntimeContext = createContext<ButtonRuntimeContextValue | null>(null);

const ButtonIcon = forwardRef<HTMLSpanElement, ButtonIconProps>(function ButtonIcon(
  { name, fallback, children, ...props },
  ref
) {
  const { iconRegionClassName, iconTreatment } = useButtonRuntimeContext('Button.Icon');
  const resolvedNamedGlyph = useResolvedIconGlyph(name);

  if (name !== undefined && !resolvedNamedGlyph.glyph && fallback === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        resolvedNamedGlyph.hasProvider
          ? `[kiskadee/icons] Button.Icon "${name}" is not mapped by family "${
              resolvedNamedGlyph.familyId ?? 'unknown'
            }".`
          : `[kiskadee/icons] Button.Icon "${name}" requires an IconFamilyProvider or an explicit fallback.`
      );
    }
    return null;
  }

  const icon = (
    <HeadlessButton.Icon {...props} ref={ref}>
      {name !== undefined ? <IconGlyph name={name} fallback={fallback} /> : children}
    </HeadlessButton.Icon>
  );

  if (iconTreatment === 'plain') {
    return icon;
  }

  return <span className={iconRegionClassName}>{icon}</span>;
});

function useButtonRuntimeContext(componentName = 'Button.Progress'): ButtonRuntimeContextValue {
  const context = useContext(ButtonRuntimeContext);
  if (!context) {
    throw new Error(`${componentName} must be used within a Button`);
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
      contentChildren.push(<ButtonIcon key="button-legacy-icon">{legacyIcon}</ButtonIcon>);
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

function getButtonContentSlots(children: ReactNode): {
  hasIcon: boolean;
  hasLabel: boolean;
} {
  let hasIcon = false;
  let hasLabel = false;

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;
    if (child.type === ButtonIcon) {
      hasIcon = true;
    }
    if (child.type === HeadlessButton.Label) {
      hasLabel = true;
    }
  }

  return { hasIcon, hasLabel };
}

function ButtonRoot(props: ButtonProps) {
  const common = useButtonCommonProps(props);
  const normalizedChildren = useMemo(
    () => normalizeButtonChildren(props.children, common.icon, common.label),
    [props.children, common.icon, common.label]
  );
  const contentSlots = useMemo(
    () => getButtonContentSlots(normalizedChildren),
    [normalizedChildren]
  );
  const requestedSurfacedIconTreatment = common.iconTreatment !== 'plain';
  const surfacedIconTreatmentSupported = !common.buttonClassesMapPending && Boolean(common.e4);
  const activeIconTreatment: ButtonIconTreatment =
    requestedSurfacedIconTreatment &&
    surfacedIconTreatmentSupported &&
    contentSlots.hasIcon &&
    contentSlots.hasLabel
      ? common.iconTreatment
      : 'plain';
  const activeIconLayout = activeIconTreatment === 'plain' ? common.iconLayout : 'edge';

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !requestedSurfacedIconTreatment) return;

    if (common.buttonClassesMapPending) return;

    if (!surfacedIconTreatmentSupported) {
      console.warn(
        `[Kiskadee] Button iconTreatment="${common.iconTreatment}" requires icon-region support from the active preset. Falling back to "plain".`
      );
      return;
    }

    if (!contentSlots.hasIcon || !contentSlots.hasLabel) {
      console.warn(
        `[Kiskadee] Button iconTreatment="${common.iconTreatment}" requires both Button.Icon and Button.Label. Falling back to "plain".`
      );
      return;
    }

    if (common.iconLayoutWasExplicit && common.iconLayout === 'inline') {
      console.warn(
        `[Kiskadee] Button iconTreatment="${common.iconTreatment}" requires iconLayout="edge". The explicit inline layout was converted to edge.`
      );
    }
  }, [
    common.iconLayout,
    common.iconLayoutWasExplicit,
    common.iconTreatment,
    common.buttonClassesMapPending,
    contentSlots.hasIcon,
    contentSlots.hasLabel,
    requestedSurfacedIconTreatment,
    surfacedIconTreatmentSupported
  ]);
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
    iconLayoutOverride: activeIconLayout,
    iconTreatmentOverride: activeIconTreatment,
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
      iconRegionClassName: baseClassNames.e4,
      iconTreatment: activeIconTreatment,
      progressAllowed: activationFeedbackController.visualStatus === 'pending',
      progressWarningRequired: common.pending !== true && common.status !== 'pending'
    }),
    [
      activationFeedbackController.visualStatus,
      activeIconTreatment,
      baseClassNames.e4,
      common.pending,
      common.status
    ]
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
  Icon: ButtonIcon,
  Progress: ButtonProgress
});

export { CompoundButton as Button };
