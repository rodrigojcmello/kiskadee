import './Switch.structural.scss';
import './effects/thumb-shrink/SwitchThumbShrink.structural.scss';
import { HeadlessSwitch } from '@kiskadee/react-headless';
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
  resolveSwitchThumbVisualClassName,
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
    e5: join(baseClassNames.e5, ...patch('e5')) ?? ''
  };
}

function SwitchRoot(props: SwitchProps) {
  const {
    id,
    label,
    controlText,
    className,
    classNames = EMPTY_SWITCH_CLASS_NAMES,
    inputProps,
    scale = DEFAULT_SWITCH_SCALE,
    emphasis = DEFAULT_SWITCH_EMPHASIS,
    intent = DEFAULT_SWITCH_INTENT,
    radius,
    motion,
    thumbShrink,
    variant = DEFAULT_SWITCH_VARIANT,
    mode = DEFAULT_SWITCH_MODE,
    labelPosition = DEFAULT_SWITCH_LABEL_POSITION,
    disabled,
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
  const { switchClassesMap, options, effects, globalEffects } =
    useSwitchArtifactConfig(thumbShrink);
  const resolvedRadius = radius ?? options.radius;
  const elements = resolveVariantElements(switchClassesMap, variant, mode);
  const hasLabel = label !== undefined && label !== null;
  const shouldRenderControlText = useSwitchControlTextFeature({
    controlText,
    visibility: options.controlTextVisibility
  });
  const motionEffect = useSwitchRuntimeMotionEffect(motion !== false);
  const thumbShrinkEffect = effects.thumbShrinkEffect;
  const activationFeedbackEffect = useSwitchActivationFeedbackEffect(
    hasSwitchActivationFeedbackEffect(elements)
  );

  const { classNames: structuralClassNames, thumbVisualClassName } = useMemo(() => {
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
      : {
          classNames: baseClassNames,
          thumbVisualClassName: resolveSwitchThumbVisualClassName({
            elements,
            structuralBranch: 'a',
            scale,
            intent,
            emphasis,
            radius: resolvedRadius
          })
        };

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

    return {
      ...thumbShrinkStructure,
      classNames: mergeSwitchClassNames(
        thumbShrinkStructure.classNames,
        motionClassNamePatch,
        controlTextClassNamePatch
      )
    };
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

  const resolvedThumbVisualClassName = thumbVisualClassName;
  const motionController = useSwitchRuntimeMotionController({
    enabled: Boolean(motionEffect),
    controlState: controlStateProp,
    defaultControlState,
    disabled,
    readOnly,
    onControlStateChange,
    onClickCapture,
    geometryKey: `${structuralClassNames.e2}|${structuralClassNames.e3}|${resolvedThumbVisualClassName ?? ''}`
  });
  const activationFeedbackController = useSwitchActivationFeedbackController({
    enabled: Boolean(activationFeedbackEffect),
    config: globalEffects.activationFeedback,
    disabled,
    readOnly,
    inputProps,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onBlur,
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
        elements,
        isActive:
          activationFeedbackController.isActive && !activationFeedbackController.isFading
      }).classNamePatch
    );
  }, [
    activationFeedbackController.isActive,
    activationFeedbackController.isFading,
    activationFeedbackEffect,
    emphasis,
    elements,
    statefulClassNames
  ]);
  const MotionThumb = motionEffect?.SwitchRuntimeMotionThumb;
  const Thumb: ElementType = MotionThumb ?? HeadlessSwitch.Thumb;
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
  const thumbVisual = resolvedThumbVisualClassName ? (
    <span className={resolvedThumbVisualClassName} />
  ) : null;

  return (
    <HeadlessSwitch.Root
      {...rootProps}
      inputId={id}
      inputProps={activationFeedbackController.inputProps}
      disabled={disabled}
      readOnly={readOnly}
      controlState={motionController.projectedControlState}
      onControlStateChange={motionController.setControlState}
      onClickCapture={motionController.handleClickCapture}
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
        <HeadlessSwitch.Track ref={motionController.thumbProps.trackRef}>
          <Thumb {...thumbProps}>{thumbVisual}</Thumb>
        </HeadlessSwitch.Track>
      </SwitchControlSide>
      {hasLabel ? <HeadlessSwitch.Label>{label}</HeadlessSwitch.Label> : null}
    </HeadlessSwitch.Root>
  );
}

export const Switch = memo(SwitchRoot);
