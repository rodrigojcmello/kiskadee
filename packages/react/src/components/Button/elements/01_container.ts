/* eslint-disable unicorn/filename-case */
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
  ButtonElementIcon,
} from '../Button.types';

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

export class ButtonStyle {
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

  private readonly _timingFunction: string;

  private readonly _duration: string;

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
    this._timingFunction = 'ease';
    this._duration = '0.2s';
  }

  get common() {
    return {
      transition: this.getTransition(),
    };
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
      base: ButtonStyle.containerBase(),
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

  private static containerBase() {
    return css({
      padding: 0,
      cursor: 'pointer',
      fontSize: '16px',
      transitionProperty:
        'box-shadow, border-color, background, padding, min-width, border-radius',
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
      /**
       * Only the box-shadow remains, but creating a new class just to control the interaction state and another one
       * for the box-shadow would just needlessly duplicate the same thing
       */
      ...containerStyle,

      // HOVER
      '&:hover, &.--hover': {
        ...this.getStateStyle('container', 'hover'),
        '& .button__text': {
          ...this.getStateStyle('text', 'hover'),
        },
        '& .button__icon': {
          ...this.getStateStyle(this.getIconLeft, 'hover'),
        },
      },

      // PRESSED
      '&:active, &.--pressed': {
        ...this.getStateStyle('container', 'pressed'),
        '& .button__text': {
          ...this.getStateStyle('text', 'pressed'),
        },
        '& .button__icon': {
          ...this.getStateStyle(this.getIconLeft, 'pressed'),
        },
      },

      // FOCUS
      '&:focus-visible, &.--focus': {
        ...this.getStateStyle('container', 'focus'),
        '& .button__text': {
          ...this.getStateStyle('text', 'focus'),
        },
        '& .button__icon': {
          ...this.getStateStyle(this.getIconLeft, 'focus'),
        },
      },

      // VISITED
      '&:visited, &.--visited': {
        ...this.getStateStyle('container', 'visited'),
        '& .button__text': {
          ...this.getStateStyle('text', 'visited'),
        },
        '& .button__icon': {
          ...this.getStateStyle(this.getIconLeft, 'visited'),
        },
      },

      // DISABLED
      '&:disabled, &--disabled': {
        ...this.getStateStyle('container', 'disabled'),
        '& .button__text': {
          ...this.getStateStyle('text', 'disabled'),
        },
        '& .button__icon': {
          ...this.getStateStyle(this.getIconLeft, 'disabled'),
        },
      },
    })();
  }

  //----------------------------------------------------------------------------
  // Text Element
  //----------------------------------------------------------------------------

  get text() {
    return {
      base: ButtonStyle.textBase(),
      core: this.textCore(),
      color: this.textColor(),
      padding: this.textPadding(),
      width: this.textWidth(),
    };
  }

  private static textBase() {
    return css({
      whiteSpace: 'nowrap',
      transitionProperty: 'color, font-size, padding',
    })();
  }

  private textCore() {
    const textStyle = { ...this.getStyle<ButtonElementText>('text') };

    delete textStyle.color;
    delete textStyle.paddingBottom;
    delete textStyle.paddingTop;
    delete textStyle.paddingLeft;
    delete textStyle.paddingRight;

    return css({
      ...textStyle,
    });
  }

  private textWidth() {
    return css({
      width:
        this._iconType === 'detached' || !(this._iconLeft || this._iconRight)
          ? '100%'
          : 'auto',
    })();
  }

  private textColor() {
    const textStyle = this.getStyle<ButtonElementText>('text');

    return css({
      color: textStyle?.color,
    })();
  }

  private textPadding() {
    const textStyle = this.getStyle<ButtonElementText>('text');

    return css({
      paddingTop: textStyle?.paddingTop,
      paddingBottom: textStyle?.paddingBottom,
      paddingLeft: this._iconLeft ? 0 : textStyle?.paddingLeft,
      paddingRight: textStyle?.paddingRight,
    })();
  }

  //----------------------------------------------------------------------------
  // Icon Left Element
  //----------------------------------------------------------------------------

  get iconLeft() {
    return {
      base: ButtonStyle.iconLeftBase(),
      color: this.iconLeftColor(),
      size: this.iconLeftSize(),
      padding: this.iconLeftPadding(),
    };
  }

  private static iconLeftBase() {
    return css({
      display: 'flex',
      transitionProperty: 'color, font-size',
    })();
  }

  private iconLeftColor() {
    const iconLeftStyle = this.getStyle<ButtonElementIcon>(this.getIconLeft);
    const textStyle = this.getStyle<ButtonElementText>('text');

    return css({
      color: textStyle?.color || iconLeftStyle?.color,

      '& > *': {
        fontSize: 'inherit',
        fill: iconLeftStyle?.color || undefined,
      },
    })();
  }

  private iconLeftSize() {
    const iconLeftStyle = this.getStyle<ButtonElementIcon>(this.getIconLeft);

    return css({
      fontSize: iconLeftStyle?.fontSize,
    })();
  }

  private iconLeftPadding() {
    const iconLeftStyle = this.getStyle<ButtonElementIcon>(this.getIconLeft);

    return css({
      paddingTop: iconLeftStyle?.paddingTop,
      paddingBottom: iconLeftStyle?.paddingBottom,
      paddingLeft: iconLeftStyle?.paddingLeft,
      paddingRight: iconLeftStyle?.paddingRight,
    })();
  }

  //----------------------------------------------------------------------------
  // Helper
  //----------------------------------------------------------------------------

  private get getIconLeft() {
    return this._iconType === 'attached'
      ? 'leftIconAttached'
      : 'leftIconDetached';
  }

  private getTransition() {
    return css({
      transitionDuration: this._duration,
      transitionTimingFunction: this._timingFunction,
    })();
  }

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
