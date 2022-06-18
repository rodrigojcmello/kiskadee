/* eslint-disable unicorn/filename-case */
import { css } from '@stitches/core';
import type { ButtonProps, ButtonSchema, Size } from '../Button.types';

const timingFunction = 'ease';
const duration = '0.2s';

type ElementContainerProps = {
  size: Size;
  typeStyle: ButtonProps['type'];
  variant: ButtonProps['variant'];
  borderRadius: Exclude<ButtonProps['borderRadius'], undefined>;

  theme?: ButtonSchema;
  iconLeft?: ButtonProps['iconLeft'];
  iconRight?: ButtonProps['iconRight'];
  iconType?: ButtonProps['iconType'];
  width?: ButtonProps['width'];
  textAlign?: ButtonProps['textAlign'];
};

export const elementContainer = ({
  theme,
  size,
  typeStyle,
  variant,
}: ElementContainerProps) => {
  const { container } = theme || {};

  const containerStyle = {
    ...container?.base?.rest?.md,
    ...container?.base?.rest?.[size],
    ...container?.type?.[typeStyle]?.base?.md,
    ...container?.type?.[typeStyle]?.base?.[size],
    ...container?.type?.[typeStyle]?.variant?.[variant]?.rest?.md,
    ...container?.type?.[typeStyle]?.variant?.[variant]?.rest?.[size],
  };

  delete containerStyle.backgroundColor;
  delete containerStyle.borderColor;
  delete containerStyle.borderWidth;
  delete containerStyle.borderStyle;

  return css({
    ...containerStyle,
  })();
};

export const elementContainerOptionWidth = ({
  theme,
  width,
}: ElementContainerProps) => {
  const { container } = theme || {};
  const { option } = container || {};

  return css({
    width: width === 'block' ? '100%' : 'auto',
    minWidth: width === 'min' ? option?.widthMin : 0,
  })();
};

export const elementContainerOptionBorderRadius = ({
  theme,
  borderRadius,
}: ElementContainerProps) => {
  const { container } = theme || {};
  const { option } = container || {};

  return css({
    borderRadius: option?.borderRadius?.[borderRadius] || 0,
  })();
};

export const elementContainerOptionTextAlign = ({
  theme,
  textAlign,
}: ElementContainerProps) => {
  const { container } = theme || {};
  const { option } = container || {};

  return css({
    textAlign:
      textAlign && option?.textAlign?.[textAlign]
        ? textAlign
        : option?.textAlign?.default,
  })();
};

export const elementContainerCoreBackgroundColor = ({
  theme,
  size,
  typeStyle,
  variant,
}: ElementContainerProps) => {
  const { container } = theme || {};

  const containerStyle = {
    ...container?.base?.rest?.md,
    ...container?.base?.rest?.[size],
    ...container?.type?.[typeStyle]?.base?.md,
    ...container?.type?.[typeStyle]?.base?.[size],
    ...container?.type?.[typeStyle]?.variant?.[variant]?.rest?.md,
    ...container?.type?.[typeStyle]?.variant?.[variant]?.rest?.[size],
  };

  return css({
    backgroundColor: containerStyle?.backgroundColor,
  })();
};

export const elementContainerCoreBorder = ({
  theme,
  size,
  typeStyle,
  variant,
}: ElementContainerProps) => {
  const { container } = theme || {};

  const containerStyle = {
    ...container?.base?.rest?.md,
    ...container?.base?.rest?.[size],
    ...container?.type?.[typeStyle]?.base?.md,
    ...container?.type?.[typeStyle]?.base?.[size],
    ...container?.type?.[typeStyle]?.variant?.[variant]?.rest?.md,
    ...container?.type?.[typeStyle]?.variant?.[variant]?.rest?.[size],
  };

  return css({
    border: containerStyle?.borderWidth ? undefined : 'none',
    borderColor: containerStyle?.borderColor,
    borderStyle: containerStyle?.borderStyle,
    borderWidth: containerStyle?.borderWidth,
  })();
};

export const elementContainerCoreBase = () => {
  return css({
    padding: 0,
    cursor: 'pointer',
    fontSize: '16px',
    transitionProperty:
      'box-shadow, border-color, background, padding, min-width, border-radius',
    transitionDuration: duration,
    transitionTimingFunction: timingFunction,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })();
};
