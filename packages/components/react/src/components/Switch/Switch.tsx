import './Switch.structural.scss';
import './effects/thumb-shrink/SwitchThumbShrink.structural.scss';
import { HeadlessSwitch } from '@kiskadee/react-headless';
import { resolveActivationFeedbackSetting } from '@kiskadee/core';
import { type ElementType, memo, useMemo } from 'react';
import {
  hasSwitchActivationFeedbackEffect,
  useSwitchActivationFeedbackController,
  useSwitchActivationFeedbackEffect
} from './effects/activation-feedback/index.ts';
import {
  useSwitchRuntimeMotionController,
  useSwitchRuntimeMotionEffect
} from './effects/motion/index.ts';
import {
  resolveSwitchControlTextFeature,
  SwitchControlSide,
  useSwitchControlTextFeature
} from './features/control-text/index.ts';
import { useSwitchArtifactConfig } from './hooks/useSwitchArtifactConfig.ts';
import {
  DEFAULT_SWITCH_EMPHASIS,
  DEFAULT_SWITCH_INTENT,
  DEFAULT_SWITCH_LABEL_POSITION,
  DEFAULT_SWITCH_MODE,
  DEFAULT_SWITCH_SCALE,
  DEFAULT_SWITCH_VARIANT,
  join,
  resolveSwitchClassNames as resolveSwitchStructuralClassNames,
  resolveVariantElements
} from './Switch.class-names.ts';
import type { SwitchClassNames, SwitchProps } from './Switch.types.ts';

const EMPTY_SWITCH_CLASS_NAMES: SwitchClassNames = {};

function mergeSwitchClassNames(
  baseClassNames: Required<SwitchClassNames>,
  ...classNamePatches: Array<SwitchClassNames | null | undefined>
): Required<SwitchClassNames> {
  const patch = (elementName: keyof Required<SwitchClassNames>) =>
    classNamePatches.map((classNamePatch) => classNamePatch?.[elementName]);

  return {
    e1: join(baseClassNames.e1, ...patch('e1')) ?? '',
    e2: join(baseClassNames.e2, ...patch('e2')) ?? '',
    e3: join(baseClassNames.e3, ...patch('e3')) ?? '',
    e4: join(baseClassNames.e4, ...patch('e4')) ?? '',
    e5: join(baseClassNames.e5, ...patch('e5')) ?? '',
    e6: join(baseClassNames.e6, ...patch('e6')) ?? ''
  };
}

function SwitchRoot(props: SwitchProps) {
  const {
    id,
    label,
    controlText,
    icons,
    className,
    classNames = EMPTY_SWITCH_CLASS_NAMES,
    inputProps,
    scale = DEFAULT_SWITCH_SCALE,
    emphasis = DEFAULT_SWITCH_EMPHASIS,
    intent = DEFAULT_SWITCH_INTENT,
    radius,
    motion,
    thumbShrink,
    activationFeedback,
    variant = DEFAULT_SWITCH_VARIANT,
    mode = DEFAULT_SWITCH_MODE,
    labelPosition = DEFAULT_SWITCH_LABEL_POSITION,
    disabled,
    interactionLocked,
    readOnly,
    controlState: controlStateProp,
    defaultControlState,
    onControlStateChange,
    onClickCapture,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onBlur,
    ...rootProps
  } = props;
  const { switchClassesMap, componentEffects, options, effects, globalEffects } =
    useSwitchArtifactConfig(thumbShrink);
  const resolvedRadius = radius ?? options.radius;
  const elements = resolveVariantElements(switchClassesMap, variant, mode);
  const hasLabel = label !== undefined && label !== null;
  const hasIconSlot = Boolean(elements.e6 || classNames.e6);
  const hasIcons = hasIconSlot && Boolean(icons?.rest || icons?.selected);
  const shouldRenderControlText = useSwitchControlTextFeature({
    controlText,
    visibility: options.controlTextVisibility
  });
  const motionEffect = useSwitchRuntimeMotionEffect(motion !== false);
  const thumbShrinkEffect = effects.thumbShrinkEffect;
  const activationFeedbackConfig = useMemo(
    () =>
      resolveActivationFeedbackSetting(
        globalEffects.activationFeedback,
        componentEffects.activationFeedback
      ),
    [componentEffects.activationFeedback, globalEffects.activationFeedback]
  );
  const activationFeedbackProfile = activationFeedbackConfig?.profile ?? 'halo';
  const shouldUseActivationFeedback =
    activationFeedback !== false &&
    hasSwitchActivationFeedbackEffect(elements, activationFeedbackProfile);
  const activationFeedbackEffect = useSwitchActivationFeedbackEffect(
    shouldUseActivationFeedback
  );

  const structuralClassNames = useMemo(() => {
    const classNamesWithRoot = {
      ...classNames,
      e1: join(classNames.e1, className)
    };
    const baseClassNames = resolveSwitchStructuralClassNames({
      elements,
      classNames: classNamesWithRoot,
      structuralBranch: 'a',
      scale,
      intent,
      emphasis,
      radius: resolvedRadius,
      activationMotion: options.activationMotion,
      labelPosition,
      hasLabel,
      hasControlText: false
    });

    const thumbShrinkStructure = thumbShrinkEffect
      ? thumbShrinkEffect.resolveSwitchThumbShrinkEffect({
          baseClassNames,
          elements,
          classNames: classNamesWithRoot,
          scale,
          intent,
          emphasis,
          radius: resolvedRadius,
          activationMotion: options.activationMotion,
          labelPosition,
          hasLabel
        })
      : { classNames: baseClassNames };

    const motionClassNamePatch = motionEffect
      ? motionEffect.resolveSwitchRuntimeMotionEffect({
          activationMotion: options.activationMotion
        }).classNamePatch
      : undefined;
    const controlTextClassNamePatch = shouldRenderControlText
      ? resolveSwitchControlTextFeature({
          elements,
          classNames,
          scale,
          intent,
          emphasis
        }).classNamePatch
      : undefined;

    return mergeSwitchClassNames(
      thumbShrinkStructure.classNames,
      motionClassNamePatch,
      controlTextClassNamePatch
    );
  }, [
    className,
    classNames,
    elements,
    emphasis,
    hasLabel,
    intent,
    shouldRenderControlText,
    labelPosition,
    motionEffect,
    options.activationMotion,
    resolvedRadius,
    scale,
    thumbShrinkEffect
  ]);

  const switchGeometryKey = `${resolvedRadius}|${structuralClassNames.e2}|${structuralClassNames.e3}`;
  const motionController = useSwitchRuntimeMotionController({
    enabled: Boolean(motionEffect),
    controlState: controlStateProp,
    defaultControlState,
    disabled,
    interactionLocked,
    readOnly,
    onControlStateChange,
    onClickCapture,
    geometryKey: switchGeometryKey
  });
  const activationFeedbackController = useSwitchActivationFeedbackController({
    enabled: Boolean(activationFeedbackEffect),
    config: activationFeedbackConfig,
    disabled,
    forcedActive: activationFeedback === 'active',
    geometryKey: switchGeometryKey,
    interactionLocked,
    readOnly,
    onClickCapture: motionController.handleClickCapture,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onBlur,
    profile: activationFeedbackProfile,
    thumbRef: motionController.thumbProps.thumbRef,
    trackRef: motionController.thumbProps.trackRef
  });
  const statefulClassNames = useMemo(
    () =>
      mergeSwitchClassNames(
        structuralClassNames,
        !motionEffect && motionController.projectedControlState ? { e3: 'k-swt-e3e-a' } : undefined
      ),
    [motionController.projectedControlState, motionEffect, structuralClassNames]
  );
  const resolvedClassNames = useMemo(() => {
    if (!activationFeedbackEffect) return statefulClassNames;

    return mergeSwitchClassNames(
      statefulClassNames,
      activationFeedbackEffect.resolveSwitchActivationFeedbackEffect({
        emphasis,
        config: activationFeedbackConfig,
        elements,
        isActive:
          activationFeedbackController.isActive && !activationFeedbackController.isFading,
        profile: activationFeedbackProfile
      }).classNamePatch
    );
  }, [
    activationFeedbackController.isActive,
    activationFeedbackController.isFading,
    activationFeedbackEffect,
    activationFeedbackConfig,
    emphasis,
    activationFeedbackProfile,
    elements,
    statefulClassNames
  ]);
  const MotionThumb = motionEffect?.SwitchRuntimeMotionThumb;
  const Thumb: ElementType = MotionThumb ?? HeadlessSwitch.Thumb;
  const iconNodes = hasIcons ? (
    <>
      {icons?.rest ? (
        <HeadlessSwitch.Icon className="k-swt-e6a-a">{icons.rest}</HeadlessSwitch.Icon>
      ) : null}
      {icons?.selected ? (
        <HeadlessSwitch.Icon className="k-swt-e6b-a">{icons.selected}</HeadlessSwitch.Icon>
      ) : null}
    </>
  ) : null;
  const thumbProps = MotionThumb
    ? {
        activationMotion: options.activationMotion,
        thumbClassName: resolvedClassNames.e3,
        onActivationFeedbackCancel: activationFeedbackController.cancel,
        ...motionController.thumbProps
      }
    : {
        ref: motionController.thumbProps.thumbRef
      };

  return (
    <HeadlessSwitch.Root
      {...rootProps}
      inputId={id}
      inputProps={inputProps}
      disabled={disabled}
      interactionLocked={interactionLocked}
      readOnly={readOnly}
      controlState={motionController.projectedControlState}
      onControlStateChange={motionController.setControlState}
      onClickCapture={activationFeedbackController.rootHandlers.onClickCapture}
      onPointerDown={activationFeedbackController.rootHandlers.onPointerDown}
      onPointerUp={activationFeedbackController.rootHandlers.onPointerUp}
      onPointerCancel={activationFeedbackController.rootHandlers.onPointerCancel}
      onBlur={activationFeedbackController.rootHandlers.onBlur}
      classNames={resolvedClassNames}
    >
      <SwitchControlSide
        controlText={controlText}
        controlState={motionController.projectedControlState}
        shouldRenderControlText={shouldRenderControlText}
      >
        <HeadlessSwitch.Track ref={motionController.thumbProps.trackRefCallback}>
          <Thumb {...thumbProps}>{iconNodes}</Thumb>
        </HeadlessSwitch.Track>
      </SwitchControlSide>
      {hasLabel ? <HeadlessSwitch.Label>{label}</HeadlessSwitch.Label> : null}
    </HeadlessSwitch.Root>
  );
}

export const Switch = memo(SwitchRoot);
