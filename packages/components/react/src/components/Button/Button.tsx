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
  useCallback,
  useContext,
  useEffect,
  useMemo
} from 'react';
import { useResolvedIconGlyph } from '../../shared/contexts/IconFamilyContext.tsx';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../shared/contexts/useComponentClassMap.ts';
import { flattenFragmentChildren } from '../../shared/utils/flattenFragmentChildren.ts';
import { IconGlyph } from '../Icon/IconGlyph.tsx';
import { resolveProgressIndicatorClassName } from '../Progress/Progress.class-names.ts';
import type { ProgressClassesMap } from '../Progress/Progress.types.ts';
import {
  DEFAULT_BUTTON_EMPHASIS,
  DEFAULT_BUTTON_INTENT,
  DEFAULT_BUTTON_RADIUS,
  DEFAULT_BUTTON_SCALE,
  DEFAULT_BUTTON_SURFACE_CONTEXT,
  join,
  mergeButtonClassNames,
  resolveButtonDividerClassName,
  resolveButtonGroupClassName
} from './Button.class-names.ts';
import type {
  ButtonClassesMap,
  ButtonDisclosureProps,
  ButtonGroupProps,
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
import { useButtonArtifactConfig } from './hooks/useButtonArtifactConfig.ts';
import { useButtonClassNamesFromCommon, useButtonCommonProps } from './hooks/useButtonBase.ts';

declare const process: { env: { NODE_ENV?: string } };

export type {
  ButtonActivationFeedbackEffect,
  ButtonDisclosureProps,
  ButtonGroupProps,
  ButtonIconProps,
  ButtonIconSurfaceCorners,
  ButtonIconTreatment,
  ButtonProgressProps,
  ButtonProps,
  ButtonStatus
} from './Button.types.ts';

type ButtonRuntimeContextValue = {
  disclosureDividerClassName: string | undefined;
  iconRegionClassName: string | undefined;
  iconTreatment: ButtonIconTreatment;
  progressAllowed: boolean;
  progressWarningRequired: boolean;
};

const ButtonRuntimeContext = createContext<ButtonRuntimeContextValue | null>(null);

type ButtonGroupRuntimeContextValue = {
  emphasis: NonNullable<ButtonGroupProps['emphasis']>;
  intent: NonNullable<ButtonGroupProps['intent']>;
  radius: NonNullable<ButtonGroupProps['radius']>;
  scale: NonNullable<ButtonGroupProps['scale']>;
  surfaceContext: NonNullable<ButtonGroupProps['surfaceContext']>;
};

const ButtonGroupRuntimeContext = createContext<ButtonGroupRuntimeContextValue | null>(null);

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

const ButtonDisclosure = forwardRef<HTMLSpanElement, ButtonDisclosureProps>(
  function ButtonDisclosure({ name = 'chevron-down', fallback, children, ...props }, ref) {
    const { disclosureDividerClassName } = useButtonRuntimeContext('Button.Disclosure');
    const resolvedNamedGlyph = useResolvedIconGlyph(name);

    if (name !== undefined && !resolvedNamedGlyph.glyph && fallback === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          resolvedNamedGlyph.hasProvider
            ? `[kiskadee/icons] Button.Disclosure "${name}" is not mapped by family "${
                resolvedNamedGlyph.familyId ?? 'unknown'
              }".`
            : `[kiskadee/icons] Button.Disclosure "${name}" requires an IconFamilyProvider or an explicit fallback.`
        );
      }
      return null;
    }

    return (
      <HeadlessButton.Disclosure {...props} ref={ref}>
        {disclosureDividerClassName ? (
          <span aria-hidden="true" className={join(disclosureDividerClassName, 'k-btn-e6b')} />
        ) : null}
        {name !== undefined ? <IconGlyph name={name} fallback={fallback} /> : children}
      </HeadlessButton.Disclosure>
    );
  }
);

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
  hasDisclosure: boolean;
  hasIcon: boolean;
  hasLabel: boolean;
} {
  let hasDisclosure = false;
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
    if (child.type === ButtonDisclosure) {
      hasDisclosure = true;
    }
  }

  return { hasDisclosure, hasIcon, hasLabel };
}

const ButtonRoot = forwardRef<HTMLButtonElement, ButtonProps>(function ButtonRoot(props, ref) {
  const group = useContext(ButtonGroupRuntimeContext);
  const groupedProps: ButtonProps = group
    ? {
        ...props,
        scale: group.scale,
        radius: group.radius,
        emphasis: group.emphasis,
        intent: group.intent,
        surfaceContext: group.surfaceContext,
        shadow: false,
        radiusEffect: false
      }
    : props;
  const common = useButtonCommonProps(groupedProps);

  useEffect(() => {
    if (!group || process.env.NODE_ENV === 'production') return;

    const ignoredProps: string[] = [];
    if (props.scale !== undefined && props.scale !== group.scale) ignoredProps.push('scale');
    if (props.radius !== undefined && props.radius !== group.radius) ignoredProps.push('radius');
    if (props.emphasis !== undefined && props.emphasis !== group.emphasis) {
      ignoredProps.push('emphasis');
    }
    if (props.intent !== undefined && props.intent !== group.intent) ignoredProps.push('intent');
    if (props.surfaceContext !== undefined && props.surfaceContext !== group.surfaceContext) {
      ignoredProps.push('surfaceContext');
    }
    if (props.shadow === true) ignoredProps.push('shadow');
    if (props.radiusEffect === true) ignoredProps.push('radiusEffect');

    if (ignoredProps.length > 0) {
      console.warn(
        `[Kiskadee] Button inside Button.Group inherits its shared visual contract. Ignored child props: ${ignoredProps.join(', ')}.`
      );
    }
  }, [
    group,
    props.emphasis,
    props.intent,
    props.radius,
    props.radiusEffect,
    props.scale,
    props.shadow,
    props.surfaceContext
  ]);
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
      e3: common.e3,
      e5: common.e5
    }),
    [common.e1, common.e2, common.e3, common.e5]
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
      disclosureDividerClassName:
        common.options.disclosureDivider === true &&
        contentSlots.hasDisclosure &&
        contentSlots.hasLabel
          ? baseClassNames.e6
          : undefined,
      iconRegionClassName: baseClassNames.e4,
      iconTreatment: activeIconTreatment,
      progressAllowed: activationFeedbackController.visualStatus === 'pending',
      progressWarningRequired: common.pending !== true && common.status !== 'pending'
    }),
    [
      activationFeedbackController.visualStatus,
      activeIconTreatment,
      baseClassNames.e6,
      baseClassNames.e4,
      common.options.disclosureDivider,
      common.pending,
      common.status,
      contentSlots.hasDisclosure,
      contentSlots.hasLabel
    ]
  );

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' ||
      common.buttonClassesMapPending ||
      common.options.disclosureDivider !== true ||
      !contentSlots.hasDisclosure ||
      !contentSlots.hasLabel ||
      baseClassNames.e6
    ) {
      return;
    }

    console.warn(
      '[Kiskadee] Button disclosureDivider requires compatible Button.e6 paint from the active preset.'
    );
  }, [
    common.buttonClassesMapPending,
    baseClassNames.e6,
    common.options.disclosureDivider,
    contentSlots.hasDisclosure,
    contentSlots.hasLabel
  ]);
  const hostRef = useCallback(
    (node: HTMLButtonElement | null) => {
      activationFeedbackController.hostRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [activationFeedbackController.hostRef, ref]
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
        ref={hostRef}
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
});

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  {
    children,
    className,
    scale = DEFAULT_BUTTON_SCALE,
    radius,
    emphasis = DEFAULT_BUTTON_EMPHASIS,
    intent = DEFAULT_BUTTON_INTENT,
    surfaceContext = DEFAULT_BUTTON_SURFACE_CONTEXT,
    shadow = false,
    ...props
  },
  ref
) {
  const { buttonClassesMap, buttonClassesMapPending, options } = useButtonArtifactConfig();
  const { e1, e6 } = buttonClassesMap ?? {};
  const resolvedRadius = radius ?? options.radius ?? DEFAULT_BUTTON_RADIUS;
  const contextValue = useMemo<ButtonGroupRuntimeContextValue>(
    () => ({ emphasis, intent, radius: resolvedRadius, scale, surfaceContext }),
    [emphasis, intent, resolvedRadius, scale, surfaceContext]
  );
  const groupClassName = useMemo(
    () =>
      resolveButtonGroupClassName({
        e1,
        className,
        scale,
        shadow,
        radius: resolvedRadius,
        globalRadius: options.radius
      }),
    [className, e1, options.radius, resolvedRadius, scale, shadow]
  );
  const dividerClassName = useMemo(
    () =>
      resolveButtonDividerClassName({
        e6,
        scale,
        emphasis,
        intent,
        surfaceContext
      }),
    [e6, emphasis, intent, scale, surfaceContext]
  );
  const childArray = flattenFragmentChildren(children);
  const hasGroupDivider =
    options.groupDivider === true && dividerClassName.length > 0 && childArray.length > 1;

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' ||
      !shadow ||
      buttonClassesMapPending ||
      groupClassName.hasShadow
    ) {
      return;
    }

    console.warn(
      '[Kiskadee] Button.Group shadow requires the active preset to publish a Button.e1 Rest shadow.'
    );
  }, [buttonClassesMapPending, groupClassName.hasShadow, shadow]);

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' ||
      buttonClassesMapPending ||
      options.groupDivider !== true ||
      childArray.length < 2 ||
      dividerClassName.length > 0
    ) {
      return;
    }

    console.warn(
      '[Kiskadee] Button groupDivider requires compatible Button.e6 paint from the active preset.'
    );
  }, [buttonClassesMapPending, childArray.length, dividerClassName, options.groupDivider]);

  return (
    <ButtonGroupRuntimeContext.Provider value={contextValue}>
      <div
        {...props}
        ref={ref}
        className={join(groupClassName.className, hasGroupDivider ? 'k-btn-x3a' : undefined)}
      >
        {hasGroupDivider
          ? childArray.flatMap((child, index) =>
              index === 0
                ? [child]
                : [
                    <span
                      aria-hidden="true"
                      className={join(dividerClassName, 'k-btn-e6a')}
                      // biome-ignore lint/suspicious/noArrayIndexKey: divider identity is the positional seam between siblings.
                      key={`button-group-divider-${index}`}
                    />,
                    child
                  ]
            )
          : childArray}
      </div>
    </ButtonGroupRuntimeContext.Provider>
  );
});

const MemoButton = memo(ButtonRoot);
const CompoundButton = Object.assign(MemoButton, {
  Group: ButtonGroup,
  Label: HeadlessButton.Label,
  Icon: ButtonIcon,
  Disclosure: ButtonDisclosure,
  Progress: ButtonProgress
});

export { CompoundButton as Button };
