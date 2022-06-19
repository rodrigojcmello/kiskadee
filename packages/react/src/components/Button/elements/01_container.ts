/* eslint-disable unicorn/filename-case,class-methods-use-this */
import { css } from '@stitches/core';
import type { CSSProperties } from 'react';
import type {
  ButtonProps,
  ButtonSchema,
  Size,
  ContainerOptions,
  InteractionState,
  ButtonElementContainer,
  ButtonElementText,
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
  private readonly _size: ElementContainerProps['size'];

  private readonly _typeStyle: ElementContainerProps['typeStyle'];

  private readonly _variant: ElementContainerProps['variant'];

  private readonly _width: ElementContainerProps['width'];

  private readonly _options: ContainerOptions | undefined;

  private readonly _borderRadius: ElementContainerProps['borderRadius'];

  private readonly _textAlign: ButtonProps['textAlign'];

  private readonly _theme: ButtonSchema | undefined;

  private readonly _iconLeft: ButtonProps['iconLeft'];

  private readonly _iconRight: ButtonProps['iconRight'];

  private readonly _iconType: ButtonProps['iconType'];

  constructor(style: ElementContainerProps) {
    this._size = style.size;
    this._typeStyle = style.typeStyle;
    this._variant = style.variant;
    this._borderRadius = style.borderRadius;
    this._theme = style.theme;
    this._textAlign = style.textAlign;
    this._width = style.width;
    this._options = style.theme?.container?.option;
    this._iconLeft = style.iconLeft;
    this._iconRight = style.iconRight;
    this._iconType = style.iconType;
  }

  //----------------------------------------------------------------------------
  // Container Element
  //----------------------------------------------------------------------------

  get container() {
    return {
      border: this.containerBorder(),
      background: this.containerBackground(),
      textAlign: this.containerTextAlign(),
      radius: this.containerRadius(),
      width: this.containerWidth(),
      core: this.containerCore(),
      base: this.containerBase(),
    };
  }

  private containerWidth() {
    return css({
      width: this._width === 'block' ? '100%' : 'auto',
      minWidth: this._width === 'min' ? this._options?.widthMin : 0,
    })();
  }

  private containerRadius() {
    return css({
      borderRadius: this._options?.borderRadius?.[this._borderRadius] || 0,
    })();
  }

  private containerTextAlign() {
    return css({
      textAlign:
        this._textAlign && this._options?.textAlign?.[this._textAlign]
          ? this._textAlign
          : this._options?.textAlign?.default,
    })();
  }

  private containerBackground() {
    const containerStyle = this.getStyle<ButtonElementContainer>('container');

    return css({
      backgroundColor: containerStyle?.backgroundColor,
    })();
  }

  private containerBorder() {
    const containerStyle = this.getStyle<ButtonElementContainer>('container');

    return css({
      border: containerStyle?.borderWidth ? undefined : 'none',
      borderColor: containerStyle?.borderColor,
      borderStyle: containerStyle?.borderStyle,
      borderWidth: containerStyle?.borderWidth,
    })();
  }

  private containerBase() {
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
  }

  private containerCore() {
    const containerStyle = {
      ...this.getStyle<ButtonElementContainer>('container'),
    };

    delete containerStyle.backgroundColor;
    delete containerStyle.borderColor;
    delete containerStyle.borderWidth;
    delete containerStyle.borderStyle;

    return css({
      ...containerStyle,

      // HOVER
      '&:hover, &.--hover': {
        ...this.getStateStyle('container', 'hover'),
        '& .button__text': {
          ...this.getStateStyle('text', 'hover'),
        },
      },

      // PRESSED
      '&:active, &.--pressed': {
        ...this.getStateStyle('container', 'pressed'),
        '& .button__text': {
          ...this.getStateStyle('text', 'pressed'),
        },
      },

      // FOCUS
      '&:focus-visible, &.--focus': {
        ...this.getStateStyle('container', 'focus'),
        '& .button__text': {
          ...this.getStateStyle('text', 'focus'),
        },
      },

      // VISITED
      '&:visited, &.--visited': {
        ...this.getStateStyle('container', 'visited'),
        '& .button__text': {
          ...this.getStateStyle('text', 'visited'),
        },
      },

      // DISABLED
      '&:disabled, &--disabled': {
        ...this.getStateStyle('container', 'disabled'),
        '& .button__text': {
          ...this.getStateStyle('text', 'disabled'),
        },
      },
    })();
  }

  //----------------------------------------------------------------------------
  // Text Element
  //----------------------------------------------------------------------------

  get text() {
    return {
      base: this.textBase(),
      core: css({
        ...this.getStyle<ButtonElementText>('text'),
      })(),
    };
  }

  private textBase() {
    return css({
      width:
        this._iconType === 'detached' || !(this._iconLeft || this._iconRight)
          ? '100%'
          : 'auto',
      whiteSpace: 'nowrap',
      transitionProperty: 'color, font-size, padding',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    })();
  }

  //------------------------------------------------------------------------
  // Helper
  //------------------------------------------------------------------------

  private getStateStyle(element: keyof ButtonSchema, state: InteractionState) {
    return {
      ...this._theme?.[element]?.base?.[state]?.[this._size],
      ...this._theme?.[element]?.type?.[this._typeStyle]?.variant?.[
        this._variant
      ]?.[state]?.[this._size],
    };
  }

  private getStyle<T extends CSSProperties>(
    element: keyof ButtonSchema
  ): T | Record<string, never> {
    return {
      ...this._theme?.[element]?.base?.rest?.md,
      ...this._theme?.[element]?.base?.rest?.[this._size],
      ...this._theme?.[element]?.type?.[this._typeStyle]?.base?.md,
      ...this._theme?.[element]?.type?.[this._typeStyle]?.base?.[this._size],
      ...this._theme?.[element]?.type?.[this._typeStyle]?.variant?.[
        this._variant
      ]?.rest?.md,
      ...this._theme?.[element]?.type?.[this._typeStyle]?.variant?.[
        this._variant
      ]?.rest?.[this._size],
    } as T;
  }
}
