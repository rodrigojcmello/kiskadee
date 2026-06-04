import './SwitchV2.structural.css';
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
} from '../Switch/Switch.class-names.ts';
import type { SwitchClassNames, SwitchProps } from '../Switch/Switch.types.ts';
import {
  hasSwitchV2ActivationFeedbackEffect,
  useSwitchV2ActivationFeedbackController,
  useSwitchV2ActivationFeedbackEffect
} from './effects/activation-feedback/index.ts';
import { useSwitchV2MotionController, useSwitchV2MotionEffect } from './effects/motion/index.ts';
import {
  resolveSwitchV2ControlTextFeature,
  SwitchV2ControlSide,
  useSwitchV2ControlTextFeature
} from './features/control-text/index.ts';
import { useSwitchV2ArtifactConfig } from './hooks/useSwitchV2ArtifactConfig.ts';

export type SwitchV2Props = SwitchProps & {
  motion?: false;
};

const EMPTY_SWITCH_V2_CLASS_NAMES: SwitchClassNames = {};

function resolveSwitchV2ClassNames(options: {
  elements: ReturnType<typeof resolveVariantElements>;
  classNames: SwitchClassNames;
  scale: string;
  intent: NonNullable<SwitchV2Props['intent']>;
  emphasis: NonNullable<SwitchV2Props['emphasis']>;
  radius: NonNullable<SwitchV2Props['radius']>;
  labelPosition: NonNullable<SwitchV2Props['labelPosition']>;
  hasLabel: boolean;
}): Required<SwitchClassNames> {
  return {
    e1:
      join(
        'k-sw2',
        'k-sw2-e1-a',
        options.labelPosition === 'start' ? 'k-sw2-e1a-a' : '',
        elem(options.elements.e1, options),
        options.classNames.e1
      ) ?? '',
    e2:
      join(
        'k-sw2-e2-a',
        elem(options.elements.e2, options),
        resolveRadiusClassName(options.elements.e2, options.scale, options.radius),
        'k-trn',
        options.classNames.e2
      ) ?? '',
    e3:
      join(
        'k-sw2-e3-a',
        elem(options.elements.e3, options),
        resolveRadiusClassName(options.elements.e3, options.scale, options.radius),
        options.classNames.e3
      ) ?? '',
    e4: options.hasLabel
      ? (join('k-sw2-e4-a', elem(options.elements.e4, options), 'k-trn', options.classNames.e4) ??
        '')
      : (options.classNames.e4 ?? ''),
    e5: options.classNames.e5 ?? ''
  };
}

function mergeSwitchV2ClassNames(
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

function SwitchV2Root(props: SwitchV2Props) {
  const {
    id,
    label,
    controlText,
    className,
    classNames = EMPTY_SWITCH_V2_CLASS_NAMES,
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
    useSwitchV2ArtifactConfig(thumbSize);
  const resolvedRadius = radius ?? options.radius;
  const elements = resolveVariantElements(switchClassesMap, variant, mode);
  const hasLabel = label !== undefined && label !== null;
  const shouldRenderControlText = useSwitchV2ControlTextFeature({
    controlText,
    visibility: options.controlTextVisibility
  });
  const motionEffect = useSwitchV2MotionEffect(motion !== false);
  const thumbSizeEffect = effects.thumbSizeEffect;
  const activationFeedbackEffect = useSwitchV2ActivationFeedbackEffect(
    hasSwitchV2ActivationFeedbackEffect(elements)
  );

  const { classNames: structuralClassNames, thumbVisualClassName } = useMemo(() => {
    const baseClassNames = resolveSwitchV2ClassNames({
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
      ? thumbSizeEffect.resolveSwitchV2ThumbSizeEffect({
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
      ? motionEffect.resolveSwitchV2MotionEffect({
          activationMotion: options.activationMotion
        }).classNamePatch
      : undefined;
    const controlTextClassNamePatch = shouldRenderControlText
      ? resolveSwitchV2ControlTextFeature({
          elements,
          classNames,
          scale,
          intent,
          emphasis
        }).classNamePatch
      : undefined;

    return {
      ...thumbSizeStructure,
      classNames: mergeSwitchV2ClassNames(
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

  const motionController = useSwitchV2MotionController({
    enabled: Boolean(motionEffect),
    controlState: controlStateProp,
    defaultControlState,
    disabled,
    readOnly,
    onControlStateChange,
    onClickCapture,
    geometryKey: `${structuralClassNames.e2}|${structuralClassNames.e3}|${thumbVisualClassName ?? ''}`
  });
  const activationFeedbackController = useSwitchV2ActivationFeedbackController({
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
  const resolvedClassNames = useMemo(() => {
    if (!activationFeedbackEffect) return structuralClassNames;

    return mergeSwitchV2ClassNames(
      structuralClassNames,
      activationFeedbackEffect.resolveSwitchV2ActivationFeedbackEffect({
        elements,
        isActive: activationFeedbackController.isActive
      }).classNamePatch
    );
  }, [
    activationFeedbackController.isActive,
    activationFeedbackEffect,
    elements,
    structuralClassNames
  ]);
  const MotionThumb = motionEffect?.SwitchV2MotionThumb;
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
  const thumbVisual = thumbVisualClassName ? <span className={thumbVisualClassName} /> : null;

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
      <SwitchV2ControlSide
        controlText={controlText}
        shouldRenderControlText={shouldRenderControlText}
      >
        <HeadlessSwitch.Track ref={motionController.thumbProps.trackRef}>
          <Thumb {...thumbProps}>{thumbVisual}</Thumb>
        </HeadlessSwitch.Track>
      </SwitchV2ControlSide>
      {hasLabel ? <HeadlessSwitch.Label>{label}</HeadlessSwitch.Label> : null}
    </HeadlessSwitch.Root>
  );
}

export const SwitchV2 = memo(SwitchV2Root);
