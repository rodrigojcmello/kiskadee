import './SwitchV2.structural.css';
import { HeadlessSwitch } from '@kiskadee/react-headless';
import { memo, useMemo } from 'react';
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
import { useSwitchV2MotionController, useSwitchV2MotionEffect } from './effects/motion/index.ts';
import { useSwitchV2ArtifactConfig } from './hooks/useSwitchV2ArtifactConfig.ts';

export type SwitchV2Props = Omit<SwitchProps, 'controlText'> & {
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

function SwitchV2Root(props: SwitchV2Props) {
  const {
    id,
    label,
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
    ...rootProps
  } = props;
  const { switchClassesMap, options, effects } = useSwitchV2ArtifactConfig(thumbSize);
  const resolvedRadius = radius ?? options.radius;
  const elements = resolveVariantElements(switchClassesMap, variant, mode);
  const hasLabel = label !== undefined && label !== null;
  const motionEffect = useSwitchV2MotionEffect(motion !== false);
  const thumbSizeEffect = effects.thumbSizeEffect;

  const { classNames: resolvedClassNames, thumbVisualClassName } = useMemo(() => {
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

    const withThumbSize = thumbSizeEffect
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

    if (!motionEffect) {
      return withThumbSize;
    }

    return {
      ...withThumbSize,
      ...motionEffect.resolveSwitchV2MotionEffect({
        classNames: withThumbSize.classNames,
        activationMotion: options.activationMotion
      })
    };
  }, [
    className,
    classNames,
    elements,
    emphasis,
    hasLabel,
    intent,
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
    geometryKey: `${resolvedClassNames.e2}|${resolvedClassNames.e3}|${thumbVisualClassName ?? ''}`
  });
  const MotionThumb = motionEffect?.SwitchV2MotionThumb;
  const thumbVisual = thumbVisualClassName ? <span className={thumbVisualClassName} /> : null;

  return (
    <HeadlessSwitch.Root
      {...rootProps}
      inputId={id}
      inputProps={inputProps}
      disabled={disabled}
      readOnly={readOnly}
      controlState={motionController.projectedControlState}
      onControlStateChange={motionController.setControlState}
      onClickCapture={motionController.handleClickCapture}
      classNames={resolvedClassNames}
    >
      <HeadlessSwitch.Track ref={motionController.trackRef}>
        {MotionThumb ? (
          <MotionThumb
            activationMotion={options.activationMotion}
            controlState={motionController.projectedControlState}
            disabled={disabled}
            readOnly={readOnly}
            requestSuppressNextClick={motionController.requestSuppressNextClick}
            setControlState={motionController.setControlState}
            setDragPreviewControlState={motionController.setDragPreviewControlState}
            thumbClassName={resolvedClassNames.e3}
            thumbRef={motionController.thumbRef}
            thumbTranslation={motionController.thumbTranslation}
            trackRef={motionController.trackRef}
          >
            {thumbVisual}
          </MotionThumb>
        ) : (
          <HeadlessSwitch.Thumb ref={motionController.thumbRef}>{thumbVisual}</HeadlessSwitch.Thumb>
        )}
      </HeadlessSwitch.Track>
      {hasLabel ? <HeadlessSwitch.Label>{label}</HeadlessSwitch.Label> : null}
    </HeadlessSwitch.Root>
  );
}

export const SwitchV2 = memo(SwitchV2Root);
