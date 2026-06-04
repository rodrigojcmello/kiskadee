import './Switch.structural.css';
import { HeadlessSwitch } from '@kiskadee/react-headless';
import { type ElementType, memo, useMemo } from 'react';
import {
  DEFAULT_SWITCH_EMPHASIS,
  DEFAULT_SWITCH_INTENT,
  DEFAULT_SWITCH_LABEL_POSITION,
  DEFAULT_SWITCH_MODE,
  DEFAULT_SWITCH_SCALE,
  DEFAULT_SWITCH_VARIANT,
  elem,
  join,
  resolveRadiusClassName,
  resolveVariantElements
} from './Switch.class-names.ts';
import type { SwitchClassNames, SwitchProps } from './Switch.types.ts';
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

const EMPTY_SWITCH_CLASS_NAMES: SwitchClassNames = {};

function resolveRoundedThumbClassName(radius: NonNullable<SwitchProps['radius']>): string {
  return radius === 'rounded' ? 'k-swt-e3a-a' : '';
}

function resolveSwitchClassNames(options: {
  elements: ReturnType<typeof resolveVariantElements>;
  classNames: SwitchClassNames;
  scale: string;
  intent: NonNullable<SwitchProps['intent']>;
  emphasis: NonNullable<SwitchProps['emphasis']>;
  radius: NonNullable<SwitchProps['radius']>;
  labelPosition: NonNullable<SwitchProps['labelPosition']>;
  hasLabel: boolean;
}): Required<SwitchClassNames> {
  return {
    e1:
      join(
        'k-swt',
        'k-swt-e1-a',
        elem(options.elements.e1, options),
        options.classNames.e1
      ) ?? '',
    e2:
      join(
        'k-swt-e2-a',
        elem(options.elements.e2, options),
        resolveRadiusClassName(options.elements.e2, options.scale, options.radius),
        'k-trn',
        options.classNames.e2
      ) ?? '',
    e3:
      join(
        'k-swt-e3-a',
        elem(options.elements.e3, options),
        resolveRadiusClassName(options.elements.e3, options.scale, options.radius),
        resolveRoundedThumbClassName(options.radius),
        options.classNames.e3
      ) ?? '',
    e4: options.hasLabel
      ? (join(
          'k-swt-e4-a',
          options.labelPosition === 'start' ? 'k-swt-e4a-a' : '',
          elem(options.elements.e4, options),
          'k-trn',
          options.classNames.e4
        ) ?? '')
      : (options.classNames.e4 ?? ''),
    e5: options.classNames.e5 ?? ''
  };
}

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
    thumbSize,
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
    onPointerCancel,
    onBlur,
    ...rootProps
  } = props;
  const { switchClassesMap, options, effects, globalEffects } =
    useSwitchArtifactConfig(thumbSize);
  const resolvedRadius = radius ?? options.radius;
  const elements = resolveVariantElements(switchClassesMap, variant, mode);
  const hasLabel = label !== undefined && label !== null;
  const shouldRenderControlText = useSwitchControlTextFeature({
    controlText,
    visibility: options.controlTextVisibility
  });
  const motionEffect = useSwitchRuntimeMotionEffect(motion !== false);
  const thumbSizeEffect = effects.thumbSizeEffect;
  const activationFeedbackEffect = useSwitchActivationFeedbackEffect(
    hasSwitchActivationFeedbackEffect(elements)
  );

  const { classNames: structuralClassNames, thumbVisualClassName } = useMemo(() => {
    const baseClassNames = resolveSwitchClassNames({
      elements,
      classNames: {
        ...classNames,
        e1: join(classNames.e1, className)
      },
      scale,
      intent,
      emphasis,
      radius: resolvedRadius,
      labelPosition,
      hasLabel
    });

    const thumbSizeStructure = thumbSizeEffect
      ? thumbSizeEffect.resolveSwitchThumbSizeEffect({
          baseClassNames,
          elements,
          classNames,
          scale,
          intent,
          emphasis,
          radius: resolvedRadius
        })
      : {
          classNames: baseClassNames,
          thumbVisualClassName: undefined
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
      ...thumbSizeStructure,
      classNames: mergeSwitchClassNames(
        thumbSizeStructure.classNames,
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
    thumbSizeEffect
  ]);

  const resolvedThumbVisualClassName = join(
    thumbVisualClassName,
    thumbVisualClassName && motionEffect ? 'k-swt-x5a-a' : ''
  );
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
    onPointerCancel,
    onBlur,
    trackRef: motionController.thumbProps.trackRef
  });
  const statefulClassNames = useMemo(
    () =>
      mergeSwitchClassNames(
        structuralClassNames,
        !motionEffect && motionController.projectedControlState
          ? { e3: 'k-swt-e3e-a' }
          : undefined
      ),
    [motionController.projectedControlState, motionEffect, structuralClassNames]
  );
  const resolvedClassNames = useMemo(() => {
    if (!activationFeedbackEffect) return statefulClassNames;

    return mergeSwitchClassNames(
      statefulClassNames,
      activationFeedbackEffect.resolveSwitchActivationFeedbackEffect({
        elements,
        isActive: activationFeedbackController.isActive
      }).classNamePatch
    );
  }, [
    activationFeedbackController.isActive,
    activationFeedbackEffect,
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
