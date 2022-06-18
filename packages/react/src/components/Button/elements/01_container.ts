/* eslint-disable unicorn/filename-case */
import { css } from '@stitches/core';
import type { CSSProperties } from 'react';
import type {
  ButtonProps,
  ButtonSchema,
  Size,
  ContainerOptions,
} from '../Button.types';

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

export class ElementContainer {
  private readonly size: ElementContainerProps['size'];

  private readonly typeStyle: ElementContainerProps['typeStyle'];

  private readonly variant: ElementContainerProps['variant'];

  private readonly _width: ElementContainerProps['width'];

  private readonly options: ContainerOptions | undefined;

  private readonly borderRadius: ElementContainerProps['borderRadius'];

  private readonly _textAlign: ButtonProps['textAlign'];

  private readonly theme: ButtonSchema | undefined;

  private readonly baseStyle: CSSProperties;

  private readonly containerStyle: CSSProperties;

  constructor(style: ElementContainerProps) {
    this.size = style.size;
    this.typeStyle = style.typeStyle;
    this.variant = style.variant;
    this.borderRadius = style.borderRadius;
    this.theme = style.theme;
    this._textAlign = style.textAlign;
    this._width = style.width;
    this.options = style.theme?.container?.option;
    this.baseStyle = {
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
    };
    this.containerStyle = {
      ...this.theme?.container?.base?.rest?.[this.size],
      ...this.theme?.container?.base?.rest?.[this.size],
      ...this.theme?.container?.type?.[this.typeStyle]?.base?.[this.size],
      ...this.theme?.container?.type?.[this.typeStyle]?.base?.[this.size],
      ...this.theme?.container?.type?.[this.typeStyle]?.variant?.[this.variant]
        ?.rest?.[this.size],
      ...this.theme?.container?.type?.[this.typeStyle]?.variant?.[this.variant]
        ?.rest?.[this.size],
    };
  }

  width() {
    return css({
      width: this._width === 'block' ? '100%' : 'auto',
      minWidth: this._width === 'min' ? this.options?.widthMin : 0,
    })();
  }

  radius() {
    return css({
      borderRadius: this.options?.borderRadius?.[this.borderRadius] || 0,
    })();
  }

  textAlign() {
    return css({
      textAlign:
        this._textAlign && this.options?.textAlign?.[this._textAlign]
          ? this._textAlign
          : this.options?.textAlign?.default,
    })();
  }

  background() {
    return css({
      backgroundColor: this.containerStyle?.backgroundColor,
    })();
  }

  border() {
    return css({
      border: this.containerStyle?.borderWidth ? undefined : 'none',
      borderColor: this.containerStyle?.borderColor,
      borderStyle: this.containerStyle?.borderStyle,
      borderWidth: this.containerStyle?.borderWidth,
    })();
  }

  base() {
    return css(this.baseStyle as Record<string, string>)();
  }

  core() {
    // Hover ---------------------------------------------------------------------

    const elementContainerHover = {
      ...this.theme?.container?.base?.hover?.[this.size],
      ...this.theme?.container?.type?.[this.typeStyle]?.variant?.[this.variant]
        ?.hover?.[this.size],
    };

    // Pressed -------------------------------------------------------------------

    const elementContainerPressed = {
      ...this.theme?.container?.base?.pressed?.[this.size],
      ...this.theme?.container?.type?.[this.typeStyle]?.variant?.[this.variant]
        ?.pressed?.[this.size],
    };

    // Focus ---------------------------------------------------------------------

    const elementContainerFocus = {
      ...this.theme?.container?.base?.focus?.[this.size],
      ...this.theme?.container?.type?.[this.typeStyle]?.variant?.[this.variant]
        ?.focus?.[this.size],
    };

    // Visited -------------------------------------------------------------------

    const elementContainerVisited = {
      ...this.theme?.container?.base?.visited?.[this.size],
      ...this.theme?.container?.type?.[this.typeStyle]?.variant?.[this.variant]
        ?.visited?.[this.size],
    };

    // Disabled ------------------------------------------------------------------

    const elementContainerDisabled = {
      ...this.theme?.container?.base?.disabled?.[this.size],
      ...this.theme?.container?.type?.[this.typeStyle]?.variant?.[this.variant]
        ?.disabled?.[this.size],
    };

    const x = { ...this.containerStyle };

    delete x.backgroundColor;
    delete x.borderColor;
    delete x.borderWidth;
    delete x.borderStyle;

    return css({
      ...x,

      '&:hover, &.--hover': {
        ...elementContainerHover,
      },

      // PRESSED
      '&:active, &.--pressed': {
        ...elementContainerPressed,
      },

      // FOCUS
      '&:focus-visible, &.--focus': {
        ...elementContainerFocus,
      },

      // VISITED
      '&:visited, &.--visited': {
        ...elementContainerVisited,
      },

      // DISABLED
      '&:disabled, &--disabled': {
        ...elementContainerDisabled,
      },
    })();
  }
}
