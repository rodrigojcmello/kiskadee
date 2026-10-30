import { resolveIntentClassName } from '../../shared/class-resolution/classNames.ts';
import { resolveStructuralUtilityProjectionClassName } from '../../shared/class-resolution/structuralUtilityProjection.ts';
import { withComponentResources } from '../../shared/contexts/ComponentResourceBoundary.tsx';
import {
  useComponentScale,
  useResolvedComponentScale
} from '../../shared/contexts/DensityContext.tsx';
import { useControlCursorStyle } from '../../shared/contexts/useControlCursorStyle.ts';
import './Button.structural.scss';
import {
  type ButtonIconTreatment,
  resolveButtonStackedRadiusMode,
  type SurfaceContext
} from '@kiskadee/core';
import { Button as HeadlessButton, HeadlessProgress } from '@kiskadee/react-headless';
import {
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
import { useEssentialIcon } from '../../shared/contexts/EssentialIconContext.tsx';
import { useKiskadee } from '../../shared/contexts/KiskadeeContext.tsx';
import {
  resolveContentSurfaceContext,
  SurfaceContextProvider,
  useSurfaceContext
} from '../../shared/contexts/SurfaceContext.tsx';
import { useComponentClassMapResolution } from '../../shared/contexts/useComponentClassMap.ts';
import { flattenFragmentChildren } from '../../shared/utils/flattenFragmentChildren.ts';
import { FamilyResolvedIcon } from '../Icon/FamilyResolvedIcon.tsx';
import { resolveProgressIndicatorClassName } from '../Progress/Progress.class-names.ts';
import type { ProgressClassesMap } from '../Progress/Progress.types.ts';
import {
  DEFAULT_BUTTON_EMPHASIS,
  DEFAULT_BUTTON_INDICATOR_PLACEMENT,
  DEFAULT_BUTTON_INTENT,
  DEFAULT_BUTTON_RADIUS,
  join,
  mergeButtonClassNames,
  normalizeButtonScaleKey,
  resolveButtonDividerClassName,
  resolveButtonGroupClassName,
  resolveButtonGroupFrameClassName,
  resolveButtonIndicatorClassName,
  supportsButtonStackedLayout
} from './Button.class-names.ts';
import { resolveButtonPaintElement, resolveButtonSelectionPaint } from './Button.selection.ts';
import type {
  ButtonBadgePlacement,
  ButtonBadgeProps,
  ButtonClassesMap,
  ButtonDisclosureProps,
  ButtonGroupProps,
  ButtonIconProps,
  ButtonProgressProps,
  ButtonProps
} from './Button.types.ts';

declare const process: { env: { NODE_ENV?: string } };

import {
  resolveButtonFeedbackClassNamePatch,
  resolveButtonFeedbackEffectAvailability,
  useButtonActivationFeedbackController,
  useButtonFeedbackEffect
} from './effects/activation-feedback/index.ts';
import { useButtonArtifactConfig } from './hooks/useButtonArtifactConfig.ts';
import {
  resolveButtonAccessibilityFromCommon,
  useButtonClassNamesFromCommon,
  useButtonCommonProps
} from './hooks/useButtonBase.ts';

export type {
  ButtonActivationFeedbackEffect,
  ButtonBadgePlacement,
  ButtonBadgeProps,
  ButtonClassesMap,
  ButtonDisclosureProps,
  ButtonElementName,
  ButtonGroupProps,
  ButtonIconProps,
  ButtonIconSurfaceCorners,
  ButtonIconTreatment,
  ButtonIndicatorPlacement,
  ButtonProgressProps,
  ButtonProps,
  ButtonSelectionEmphasis,
  ButtonStatus
} from './Button.types.ts';

const ButtonBadge = forwardRef<HTMLSpanElement, ButtonBadgeProps>(function ButtonBadge(
  { className, placement = 'block-start-inline-end', ...props },
  ref
) {
  const { badgeRelationClassName, inlineBadgeAllowed, overlaySurfaceContext } =
    useButtonRuntimeContext('Button.Badge');
  const inline = isInlineBadgePlacement(placement);

  if (inline && (!badgeRelationClassName || !inlineBadgeAllowed)) return null;

  const relation = (
    <span
      {...props}
      ref={ref}
      className={join(
        inline ? badgeRelationClassName : 'k-btn-x4',
        inline ? `k-btn-e7-${placement}` : `k-btn-x4-${placement}`,
        className
      )}
    />
  );

  return inline ? (
    relation
  ) : (
    <SurfaceContextProvider value={overlaySurfaceContext}>{relation}</SurfaceContextProvider>
  );
});

type ButtonRuntimeContextValue = {
  badgeRelationClassName: string | undefined;
  disclosureDividerClassName: string | undefined;
  iconRegionClassName: string | undefined;
  iconTreatment: ButtonIconTreatment;
  progressAllowed: boolean;
  progressWarningRequired: boolean;
  inlineBadgeAllowed: boolean;
  overlaySurfaceContext: SurfaceContext;
};

const ButtonRuntimeContext = createContext<ButtonRuntimeContextValue | null>(null);

type ButtonGroupRuntimeContextValue = {
  continuousFrame: boolean;
  column?: number;
  dividerThicknessProjectionClassName: string;
  emphasis: NonNullable<ButtonGroupProps['emphasis']>;
  intent: NonNullable<ButtonGroupProps['intent']>;
  radius: NonNullable<ButtonGroupProps['radius']>;
  size: ButtonGroupProps['size'];
  surfaceContext: NonNullable<ButtonGroupProps['surfaceContext']>;
};

const ButtonGroupRuntimeContext = createContext<ButtonGroupRuntimeContextValue | null>(null);

const ButtonIcon = forwardRef<HTMLSpanElement, ButtonIconProps>(function ButtonIcon(
  { children, ...props },
  ref
) {
  const { iconRegionClassName, iconTreatment } = useButtonRuntimeContext('Button.Icon');

  const icon = (
    <HeadlessButton.Icon {...props} ref={ref}>
      {children}
    </HeadlessButton.Icon>
  );

  if (iconTreatment === 'plain') {
    return icon;
  }

  return <span className={iconRegionClassName}>{icon}</span>;
});

const ButtonDisclosure = forwardRef<HTMLSpanElement, ButtonDisclosureProps>(
  function ButtonDisclosure({ children, ...props }, ref) {
    const { disclosureDividerClassName } = useButtonRuntimeContext('Button.Disclosure');
    const essentialName = useEssentialIcon('chevron-down');

    const content =
      children !== undefined ? (
        children
      ) : essentialName !== undefined ? (
        <FamilyResolvedIcon name={essentialName} />
      ) : null;

    if (content == null) return null;

    return (
      <HeadlessButton.Disclosure {...props} ref={ref}>
        {disclosureDividerClassName ? (
          <span aria-hidden="true" className={join(disclosureDividerClassName, 'k-btn-e6b')} />
        ) : null}
        {content}
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
  const resolvedSurfaceContext = useSurfaceContext(surfaceContext);
  const { classMap: progressClassesMap } = useComponentClassMapResolution(
    'progress',
    classesMap.progress as ProgressClassesMap | undefined,
    progressAllowed
  );
  const indicatorPaintClassName = resolveProgressIndicatorClassName({
    element: progressClassesMap?.e3,
    intent,
    surfaceContext: resolvedSurfaceContext
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

  for (const [index, child] of flattenFragmentChildren(children).entries()) {
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

function isInlineBadgePlacement(placement: ButtonBadgePlacement | undefined): boolean {
  return placement === 'inline-start' || placement === 'inline-end';
}

function getButtonBadgePlacement(child: ReactNode): ButtonBadgePlacement | undefined {
  if (!isValidElement<ButtonBadgeProps>(child) || child.type !== ButtonBadge) return undefined;
  return child.props.placement ?? 'block-start-inline-end';
}

function composeInlineButtonBadges(children: ReactNode, enabled: boolean): ReactNode {
  if (!enabled) return children;

  const childArray = flattenFragmentChildren(children);
  const labels = childArray.filter(
    (child) => isValidElement(child) && child.type === HeadlessButton.Label
  );
  const inlineStartBadges = childArray.filter(
    (child) => getButtonBadgePlacement(child) === 'inline-start'
  );
  const inlineEndBadges = childArray.filter(
    (child) => getButtonBadgePlacement(child) === 'inline-end'
  );
  const grouped = new Set([...labels, ...inlineStartBadges, ...inlineEndBadges]);
  let inserted = false;

  return childArray.flatMap<ReactNode>((child) => {
    if (!grouped.has(child)) return [child];
    if (inserted) return [];
    inserted = true;
    return [
      <span className="k-btn-x5" key="button-inline-badge-group">
        {inlineStartBadges}
        {labels}
        {inlineEndBadges}
      </span>
    ];
  });
}

function getButtonContentSlots(children: ReactNode): {
  hasInlineBadge: boolean;
  hasOverlayBadge: boolean;
  hasDisclosure: boolean;
  hasIcon: boolean;
  hasLabel: boolean;
} {
  let hasInlineBadge = false;
  let hasOverlayBadge = false;
  let hasDisclosure = false;
  let hasIcon = false;
  let hasLabel = false;

  for (const child of flattenFragmentChildren(children)) {
    if (!isValidElement(child)) continue;
    if (child.type === ButtonBadge) {
      if (isInlineBadgePlacement(getButtonBadgePlacement(child))) hasInlineBadge = true;
      else hasOverlayBadge = true;
    }
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

  return { hasInlineBadge, hasOverlayBadge, hasDisclosure, hasIcon, hasLabel };
}

const ButtonRoot = forwardRef<HTMLButtonElement, ButtonProps>(function ButtonRoot(props, ref) {
  const cursorStyle = useControlCursorStyle();
  const { segment, theme } = useKiskadee();
  const group = useContext(ButtonGroupRuntimeContext);
  const groupedProps: ButtonProps = group
    ? {
        ...props,
        size: group.size,
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
    if (props.size !== undefined && props.size !== group.size) ignoredProps.push('size');
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
    props.size,
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
  const requestedStackedLayout = common.iconLayout === 'stacked';
  const requestedRadius = common.radius ?? common.options.radius ?? DEFAULT_BUTTON_RADIUS;
  const stackedRadius = resolveButtonStackedRadiusMode(requestedRadius);
  const stackedScale = normalizeButtonScaleKey(common.scale);
  const stackedLayoutSupported =
    group?.radius !== 'pill' &&
    !common.buttonClassesMapPending &&
    Boolean(common.stackedSizesByRadius?.[stackedRadius]?.includes(stackedScale)) &&
    supportsButtonStackedLayout(common, common.scale, stackedRadius);
  const activeIconLayout =
    activeIconTreatment !== 'plain'
      ? 'edge'
      : requestedStackedLayout &&
          (requestedSurfacedIconTreatment ||
            !stackedLayoutSupported ||
            !contentSlots.hasIcon ||
            !contentSlots.hasLabel ||
            contentSlots.hasDisclosure ||
            contentSlots.hasInlineBadge)
        ? 'inline'
        : common.iconLayout;
  const effectiveRadius = activeIconLayout === 'stacked' ? stackedRadius : requestedRadius;
  const selectionEmphasis =
    common.selectionEmphasis ?? common.options.selectionEmphasis ?? 'lowest';
  const memberRecipe = group?.continuousFrame ? common.buttonClassesMap?.group : undefined;
  const selectionPaint = resolveButtonSelectionPaint({
    elements: common.buttonClassesMap,
    groupPaint: memberRecipe,
    controlState: common.controlState,
    selectionEmphasis,
    emphasis: common.emphasis ?? DEFAULT_BUTTON_EMPHASIS,
    intent: common.intent,
    selectionIntent: common.selectionIntent,
    supportsSelectionIntent: common.supportsSelectionIntent,
    surfaceContext: common.surfaceContext,
    hasIcon: contentSlots.hasIcon,
    hasLabel: contentSlots.hasLabel,
    hasDisclosure: contentSlots.hasDisclosure,
    surfaced: activeIconTreatment !== 'plain'
  });
  const memberRoot = useMemo(
    () =>
      memberRecipe
        ? {
            ...common.e1,
            d: join(common.e1?.d, memberRecipe.member?.d),
            c: memberRecipe.member?.c
          }
        : common.e1,
    [common.e1, memberRecipe]
  );
  const paintProjection = useMemo(
    () =>
      memberRecipe && selectionPaint.projection
        ? {
            ...selectionPaint.projection,
            e1: {
              ...selectionPaint.projection.e1,
              c: memberRecipe.selectionRestMember?.c
            }
          }
        : selectionPaint.projection,
    [memberRecipe, selectionPaint.projection]
  );
  const paintElements = useMemo<ButtonClassesMap>(
    () => ({
      e1: resolveButtonPaintElement(memberRoot, paintProjection?.e1, Boolean(paintProjection)),
      e2: resolveButtonPaintElement(
        common.e2,
        selectionPaint.projection?.e2,
        Boolean(selectionPaint.projection)
      ),
      e3: resolveButtonPaintElement(
        common.e3,
        selectionPaint.projection?.e3,
        Boolean(selectionPaint.projection)
      ),
      e5: resolveButtonPaintElement(
        common.e5,
        selectionPaint.projection?.e5,
        Boolean(selectionPaint.projection)
      )
    }),
    [memberRoot, paintProjection, common.e2, common.e3, common.e5, selectionPaint.projection]
  );
  const indicatorPlacement =
    common.indicatorPlacement ??
    common.options.indicatorPlacement ??
    DEFAULT_BUTTON_INDICATOR_PLACEMENT;
  const indicatorElement = indicatorPlacement === 'outside' ? common.e12 : common.e11;
  const indicatorSizesByRadius =
    indicatorPlacement === 'outside'
      ? activeIconLayout === 'stacked'
        ? common.stackedOutsideIndicatorSizesByRadius
        : common.outsideIndicatorSizesByRadius
      : activeIconLayout === 'stacked'
        ? common.stackedIndicatorSizesByRadius
        : common.indicatorSizesByRadius;
  const indicatorEnabled = selectionPaint.indicatorEnabled;
  const indicatorScale = useResolvedComponentScale(
    'button',
    indicatorEnabled && indicatorElement && indicatorSizesByRadius?.[effectiveRadius]?.length
      ? groupedProps.size
      : (groupedProps.size ?? 'md')
  );

  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      !common.buttonClassesMapPending &&
      selectionPaint.highUnavailable
    ) {
      console.warn(
        '[Kiskadee] Button selectionEmphasis requires a published High Rest paint projection for the active intent, surface and content. Keeping the base Selected recipe.'
      );
    }
  }, [common.buttonClassesMapPending, selectionPaint.highUnavailable]);

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' ||
      common.buttonClassesMapPending ||
      !selectionPaint.intentUnavailable
    )
      return;

    if (common.selectionIntent.startsWith('brand.')) {
      console.error(
        `[Kiskadee] Button selectionIntent="${common.selectionIntent}" requires a compatible BrandPackBoundary and complete paint coverage. No system intent was substituted.`
      );
    } else {
      console.warn(
        `[Kiskadee] Button selectionIntent="${common.selectionIntent}" requires a complete paint recipe for the active surface and content. Keeping the base intent.`
      );
    }
  }, [common.buttonClassesMapPending, common.selectionIntent, selectionPaint.intentUnavailable]);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      !group &&
      common.radius === 'pill' &&
      activeIconLayout === 'stacked'
    ) {
      console.warn(
        '[Kiskadee] Button iconLayout="stacked" supports Rounded and Square corners. The explicit Pill radius was converted to Rounded.'
      );
    }
  }, [activeIconLayout, common.radius, group]);

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' ||
      common.buttonClassesMapPending ||
      !requestedStackedLayout ||
      activeIconLayout === 'stacked'
    )
      return;

    console.warn(
      '[Kiskadee] Button iconLayout="stacked" requires icon and label, a complete preset recipe for the effective size and radius, and plain content without Disclosure or inline Badge. Falling back to horizontal layout.'
    );
  }, [activeIconLayout, common.buttonClassesMapPending, requestedStackedLayout]);

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
  const { visualStatus } = resolveButtonAccessibilityFromCommon(common);
  const feedbackLoadingBlocked = visualStatus === 'disabled' || visualStatus === 'pending';
  const feedbackEffectAvailability = useMemo(
    () =>
      resolveButtonFeedbackEffectAvailability({
        activationFeedback: feedbackLoadingBlocked ? false : common.activationFeedback,
        element: paintElements.e1
      }),
    [common.activationFeedback, paintElements.e1, feedbackLoadingBlocked]
  );
  const feedbackEffect = useButtonFeedbackEffect(feedbackEffectAvailability);
  const activationFeedbackController = useButtonActivationFeedbackController(common, {
    feedbackEnabled: Boolean(feedbackEffect.loadedFeedbackKind),
    paintSelected: selectionPaint.selectedPaint,
    paintElement: paintElements.e1
  });
  const producedSurfaceContext = resolveContentSurfaceContext({
    map: common.contentSurfaceContext,
    segment,
    theme,
    consumedSurfaceContext: common.surfaceContext,
    intent: selectionPaint.intent,
    emphasis: selectionPaint.emphasis,
    selected: selectionPaint.selectedPaint,
    pending: activationFeedbackController.pending,
    disabled: activationFeedbackController.nativeDisabled
  });
  const indicatorClassName =
    indicatorEnabled && !common.buttonClassesMapPending
      ? resolveButtonIndicatorClassName({
          element: indicatorElement,
          sizesByRadius: indicatorSizesByRadius,
          scale: indicatorScale,
          radius: effectiveRadius,
          placement: indicatorPlacement,
          intent: selectionPaint.intent,
          emphasis: selectionPaint.emphasis,
          surfaceContext: common.surfaceContext
        })
      : undefined;
  const indicatorActive =
    common.controlState === true &&
    !activationFeedbackController.activationBlocked &&
    activationFeedbackController.visualStatus !== 'disabled' &&
    activationFeedbackController.visualStatus !== 'pending';
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      !common.buttonClassesMapPending &&
      common.buttonClassesMap &&
      indicatorActive &&
      indicatorEnabled &&
      !indicatorClassName
    ) {
      console.warn(
        '[Kiskadee] Button selectionEmphasis indicator requires a complete recipe for the effective paint, placement, size and radius. The indicator was omitted.'
      );
    }
  }, [
    common.buttonClassesMapPending,
    common.buttonClassesMap,
    indicatorActive,
    indicatorEnabled,
    indicatorClassName
  ]);
  const feedbackClassNamePatch = useMemo(
    () =>
      resolveButtonFeedbackClassNamePatch({
        surfaceContext: common.surfaceContext,
        activationFeedbackEffect: feedbackEffect.activationFeedbackEffect,
        activationFeedbackConfig: activationFeedbackController.activationFeedbackConfig,
        activationFeedbackProfile: activationFeedbackController.activationFeedbackProfile,
        controlState: selectionPaint.selectedPaint,
        elements: paintElements,
        emphasis: selectionPaint.emphasis,
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
      common.surfaceContext,
      selectionPaint.selectedPaint,
      selectionPaint.emphasis,
      paintElements,
      feedbackEffect.activationFeedbackEffect
    ]
  );
  const baseClassNames = useButtonClassNamesFromCommon(
    { ...common, e1: memberRoot },
    {
      paintEmphasis: selectionPaint.emphasis,
      paintIntent: selectionPaint.intent,
      selectionRest: paintProjection,
      iconLayoutOverride: activeIconLayout,
      iconTreatmentOverride: activeIconTreatment,
      statusOverride: activationFeedbackController.shouldForceOverlayPressed
        ? 'rest'
        : activationFeedbackController.visualStatus
    }
  );
  const computedClassNames = useMemo(
    () =>
      mergeButtonClassNames(
        baseClassNames,
        feedbackClassNamePatch,
        group?.continuousFrame ? { e1: group.dividerThicknessProjectionClassName } : undefined,
        activationFeedbackController.shouldUsePressedFeedback ? { e1: 'k-pressed' } : undefined
      ),
    [
      activationFeedbackController.shouldUsePressedFeedback,
      baseClassNames,
      feedbackClassNamePatch,
      group
    ]
  );
  const runtimeContextValue = useMemo<ButtonRuntimeContextValue>(
    () => ({
      badgeRelationClassName: baseClassNames.e7,
      disclosureDividerClassName:
        common.options.disclosureDivider === true &&
        contentSlots.hasDisclosure &&
        contentSlots.hasLabel
          ? baseClassNames.e6
          : undefined,
      iconRegionClassName: baseClassNames.e4,
      iconTreatment: activeIconTreatment,
      inlineBadgeAllowed: contentSlots.hasLabel,
      overlaySurfaceContext: common.surfaceContext,
      progressAllowed: activationFeedbackController.visualStatus === 'pending',
      progressWarningRequired: common.pending !== true && common.status !== 'pending'
    }),
    [
      activationFeedbackController.visualStatus,
      activeIconTreatment,
      baseClassNames.e6,
      baseClassNames.e4,
      baseClassNames.e7,
      common.options.disclosureDivider,
      common.pending,
      common.status,
      common.surfaceContext,
      contentSlots.hasDisclosure,
      contentSlots.hasLabel
    ]
  );
  const inlineBadgesSupported = Boolean(baseClassNames.e7) && contentSlots.hasLabel;
  const composedChildren = useMemo(
    () =>
      composeInlineButtonBadges(
        normalizedChildren,
        inlineBadgesSupported && contentSlots.hasInlineBadge
      ),
    [inlineBadgesSupported, contentSlots.hasInlineBadge, normalizedChildren]
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
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' ||
      common.buttonClassesMapPending ||
      !contentSlots.hasInlineBadge ||
      inlineBadgesSupported
    ) {
      return;
    }

    console.warn(
      contentSlots.hasLabel
        ? '[Kiskadee] Inline Button.Badge requires Button.e7 support from the active preset.'
        : '[Kiskadee] Inline Button.Badge requires a Button.Label sibling.'
    );
  }, [
    common.buttonClassesMapPending,
    contentSlots.hasInlineBadge,
    contentSlots.hasLabel,
    inlineBadgesSupported
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
        style={{
          ...cursorStyle,
          ...common.restProps.style,
          ...(group?.continuousFrame ? { gridColumn: group.column, gridRow: 1 } : undefined)
        }}
        disabled={activationFeedbackController.nativeDisabled}
        pending={activationFeedbackController.pending}
        interactionLocked={common.interactionLocked}
        aria-busy={activationFeedbackController.ariaBusy}
        aria-disabled={activationFeedbackController.ariaDisabled}
        aria-pressed={activationFeedbackController.ariaPressed}
        classNames={{
          ...computedClassNames,
          e1: join(
            computedClassNames.e1,
            memberRecipe && selectionPaint.projection ? 'k-btn-e1l' : undefined,
            contentSlots.hasOverlayBadge ? 'k-btn-e1j' : undefined,
            indicatorClassName ? 'k-btn-e1k' : undefined
          )
        }}
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
        {indicatorClassName && feedbackEffect.loadedFeedbackKind ? (
          <span className="k-btn-x6" aria-hidden="true" />
        ) : null}
        <SurfaceContextProvider value={producedSurfaceContext}>
          {composedChildren}
        </SurfaceContextProvider>
        {indicatorClassName ? (
          <span
            className={join(indicatorClassName, indicatorActive ? 'k-btn-e11b' : undefined)}
            aria-hidden="true"
          />
        ) : null}
      </HeadlessButton>
    </ButtonRuntimeContext.Provider>
  );
});

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  {
    children,
    className,
    size,
    radius,
    emphasis = DEFAULT_BUTTON_EMPHASIS,
    intent = DEFAULT_BUTTON_INTENT,
    surfaceContext: surfaceContextProp,
    shadow = false,
    ...props
  },
  ref
) {
  const scale = useComponentScale('button', size);
  const surfaceContext = useSurfaceContext(surfaceContextProp);
  const { buttonClassesMap, buttonClassesMapPending, options } = useButtonArtifactConfig();
  const { e1, e6 } = buttonClassesMap ?? {};
  const childArray = flattenFragmentChildren(children);
  const requestedRadius = radius ?? options.radius ?? DEFAULT_BUTTON_RADIUS;
  const hasStackedMember = childArray.some(
    (child) =>
      isValidElement<ButtonProps>(child) &&
      (child.type === MemoButton || child.type === ButtonRoot) &&
      (child.props.iconLayout ?? options.iconLayout) === 'stacked'
  );
  const resolvedRadius = hasStackedMember
    ? resolveButtonStackedRadiusMode(requestedRadius)
    : requestedRadius;
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
  const hasDividerGeometry = Boolean(e6?.s?.all || e6?.s?.[normalizeButtonScaleKey(scale)]);
  const dividerThicknessProjectionClassName = resolveStructuralUtilityProjectionClassName(
    e1,
    'gd',
    scale
  );
  const frameClassName = resolveButtonGroupFrameClassName({
    element: buttonClassesMap?.group?.frame,
    scale,
    radius: resolvedRadius,
    globalRadius: options.radius,
    emphasis,
    intent,
    surfaceContext
  });
  const hasMemberPaint = Boolean(
    buttonClassesMap?.group?.member?.d &&
      resolveIntentClassName(buttonClassesMap.group.member, intent, emphasis, { surfaceContext })
  );
  const hasContinuousFrame = Boolean(
    frameClassName && hasMemberPaint && dividerThicknessProjectionClassName
  );
  const hasGroupDivider =
    options.groupDivider === true &&
    dividerClassName.length > 0 &&
    hasDividerGeometry &&
    hasContinuousFrame &&
    childArray.length > 1;
  const contextValue = useMemo<ButtonGroupRuntimeContextValue>(
    () => ({
      continuousFrame: hasGroupDivider,
      dividerThicknessProjectionClassName,
      emphasis,
      intent,
      radius: resolvedRadius,
      size,
      surfaceContext
    }),
    [
      hasGroupDivider,
      dividerThicknessProjectionClassName,
      emphasis,
      intent,
      resolvedRadius,
      size,
      surfaceContext
    ]
  );

  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      radius === 'pill' &&
      resolvedRadius === 'rounded'
    ) {
      console.warn(
        '[Kiskadee] Button.Group containing a Stacked Button uses Rounded corners instead of the explicit Pill radius for its shared visual contract.'
      );
    }
  }, [radius, resolvedRadius]);

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
      (dividerClassName.length > 0 && hasDividerGeometry && hasContinuousFrame)
    ) {
      return;
    }

    console.warn(
      '[Kiskadee] Button groupDivider requires compatible divider geometry and a published Group Rest frame/member paint projection from the active preset.'
    );
  }, [
    buttonClassesMapPending,
    childArray.length,
    dividerClassName,
    hasDividerGeometry,
    hasContinuousFrame,
    options.groupDivider
  ]);

  return (
    <ButtonGroupRuntimeContext.Provider value={contextValue}>
      <div
        {...props}
        ref={ref}
        className={join(groupClassName.className, hasGroupDivider ? 'k-btn-x3a' : undefined)}
      >
        {childArray.map((child, index) => (
          <ButtonGroupRuntimeContext.Provider
            value={{ ...contextValue, column: hasGroupDivider ? index + 1 : undefined }}
            key={isValidElement(child) ? (child.key ?? index) : index}
          >
            {hasGroupDivider && index > 0 ? (
              <span
                aria-hidden="true"
                className={join(dividerClassName, 'k-btn-e6a')}
                style={{ gridColumn: `${index + 1} / ${index + 2}`, gridRow: '1 / 2' }}
              />
            ) : null}
            {child}
            {hasGroupDivider ? (
              <span
                aria-hidden="true"
                className={join(frameClassName, dividerThicknessProjectionClassName, 'k-btn-x3b')}
                style={{ gridColumn: `${index + 1} / ${index + 2}`, gridRow: '1 / 2' }}
              />
            ) : null}
          </ButtonGroupRuntimeContext.Provider>
        ))}
      </div>
    </ButtonGroupRuntimeContext.Provider>
  );
});

const MemoButton = withComponentResources('button', memo(ButtonRoot));
const CompoundButton = Object.assign(MemoButton, {
  Badge: ButtonBadge,
  Group: withComponentResources('button', ButtonGroup),
  Label: HeadlessButton.Label,
  Icon: ButtonIcon,
  Disclosure: ButtonDisclosure,
  Progress: ButtonProgress
});

export { CompoundButton as Button };
