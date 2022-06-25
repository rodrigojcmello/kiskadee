/* eslint-disable unicorn/filename-case */
import { css } from '@stitches/core';
import type { CSSProperties } from 'react';
import type {
  ButtonElement,
  ButtonElementContainer,
  ButtonElementIcon,
  ButtonElementText,
  ButtonSchema,
  ButtonStyleProps,
  ContainerOptions,
  Interaction,
} from './Button.types';

export class ButtonStyle {
  // Required

  private readonly _iconType: ButtonStyleProps['iconType'];

  private readonly _borderRadius: ButtonStyleProps['borderRadius'];

  private readonly _width: ButtonStyleProps['width'];

  private readonly _size: ButtonStyleProps['size'];

  private readonly _typeStyle: ButtonStyleProps['typeStyle'];

  private readonly _variant: ButtonStyleProps['variant'];

  // Optional

  private readonly _options: ContainerOptions | undefined;

  private readonly _textAlign: ButtonStyleProps['textAlign'];

  private readonly _theme: ButtonSchema | undefined;

  private readonly _iconLeft: ButtonStyleProps['iconLeft'];

  private readonly _iconRight: ButtonStyleProps['iconRight'];

  // Transition

  private readonly _timingFunction: string;

  private readonly _duration: string;

  constructor(style: ButtonStyleProps) {
    // Required
    this._iconType = style.iconType;
    this._width = style.width;
    this._size = style.size;
    this._typeStyle = style.typeStyle;
    this._variant = style.variant;
    this._borderRadius = style.borderRadius;

    // Optional
    this._theme = style.theme;
    this._textAlign = style.textAlign;
    this._options = style.theme?.option;
    this._iconLeft = style.iconLeft;
    this._iconRight = style.iconRight;

    // Transition
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
    let borderRadius;
    if (this._borderRadius === 'rounded' || this._borderRadius === 'full') {
      borderRadius =
        this._options?.borderRadius?.variant?.[this._borderRadius]?.[
          this._size
        ] || this._options?.borderRadius?.variant?.[this._borderRadius]?.md;
    } else if (
      (this._options?.borderRadius?.default === 'rounded' ||
        this._options?.borderRadius?.default === 'full') &&
      this._borderRadius === 'default'
    ) {
      borderRadius =
        this._options?.borderRadius?.variant?.[
          this._options?.borderRadius?.default
        ]?.[this._size] ||
        this._options?.borderRadius?.variant?.[
          this._options?.borderRadius?.default
        ]?.md;
    } else {
      borderRadius = this._options?.borderRadius?.none;
    }

    return css({
      borderRadius: borderRadius || 0,
    })();
  }

  private containerBackground() {
    const containerStyle = this.getStyle<ButtonElementContainer>('container');

    return css({
      background: containerStyle?.background,
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

    delete containerStyle.background;
    delete containerStyle.backgroundColor;
    delete containerStyle.borderColor;
    delete containerStyle.borderWidth;
    delete containerStyle.borderStyle;

    const containerHover = this.getStyle<ButtonElementContainer>(
      'container',
      'hover'
    );
    const textHover = this.getStyle<ButtonElementText>('text', 'hover');
    const leftIconHover = this.getStyle<ButtonElementIcon>(
      this.getIcon('left'),
      'hover'
    );
    const rightIconHover = this.getStyle<ButtonElementIcon>(
      this.getIcon('right'),
      'hover'
    );

    const containerPressed = this.getStyle<ButtonElementContainer>(
      'container',
      'pressed'
    );
    const textPressed = this.getStyle<ButtonElementText>('text', 'pressed');
    const leftIconPressed = this.getStyle<ButtonElementIcon>(
      this.getIcon('left'),
      'pressed'
    );
    const rightIconPressed = this.getStyle<ButtonElementIcon>(
      this.getIcon('right'),
      'pressed'
    );

    const containerFocus = this.getStyle<ButtonElementContainer>(
      'container',
      'focus'
    );
    const textFocus = this.getStyle<ButtonElementText>('text', 'focus');
    const leftIconFocus = this.getStyle<ButtonElementIcon>(
      this.getIcon('left'),
      'focus'
    );
    const rightIconFocus = this.getStyle<ButtonElementIcon>(
      this.getIcon('right'),
      'focus'
    );

    const containerVisited = this.getStyle<ButtonElementContainer>(
      'container',
      'visited'
    );
    const textVisited = this.getStyle<ButtonElementText>('text', 'visited');
    const leftIconVisited = this.getStyle<ButtonElementIcon>(
      this.getIcon('left'),
      'visited'
    );
    const rightIconVisited = this.getStyle<ButtonElementIcon>(
      this.getIcon('right'),
      'visited'
    );

    const containerDisabled = this.getStyle<ButtonElementContainer>(
      'container',
      'disabled'
    );
    const textDisabled = this.getStyle<ButtonElementText>('text', 'disabled');
    const leftIconDisabled = this.getStyle<ButtonElementIcon>(
      this.getIcon('left'),
      'disabled'
    );
    const rightIconDisabled = this.getStyle<ButtonElementIcon>(
      this.getIcon('right'),
      'disabled'
    );

    return css({
      /**
       * Only the box-shadow remains, but creating a new class just to control the interaction state and another one
       * for the box-shadow would just needlessly duplicate the same thing
       */
      ...containerStyle,

      // HOVER
      '&:hover, &.--hover': {
        ...containerHover,
        '& .button__text': {
          ...textHover,
        },
        '& .button__icon-left': {
          color: textHover?.color,
          ...leftIconHover,
        },
        '& .button__icon-right': {
          color: textHover?.color,
          ...rightIconHover,
        },
      },

      // PRESSED
      '&:active, &.--pressed': {
        ...containerPressed,
        '& .button__text': {
          ...textPressed,
        },
        '& .button__icon-left': {
          color: textPressed?.color,
          ...leftIconPressed,
        },
        '& .button__icon-right': {
          color: textPressed?.color,
          ...rightIconPressed,
        },
      },

      // FOCUS
      '&:focus-visible, &.--focus': {
        ...containerFocus,
        '& .button__text': {
          ...textFocus,
        },
        '& .button__icon-left': {
          color: textFocus?.color,
          ...leftIconFocus,
        },
        '& .button__icon-right': {
          color: textFocus?.color,
          ...rightIconFocus,
        },
      },

      // VISITED
      '&:visited, &.--visited': {
        ...containerVisited,
        '& .button__text': {
          ...textVisited,
        },
        '& .button__icon-left': {
          color: textVisited?.color,
          ...leftIconVisited,
        },
        '& .button__icon-right': {
          color: textVisited?.color,
          ...rightIconVisited,
        },
      },

      // DISABLED
      '&:disabled, &--disabled': {
        ...containerDisabled,
        '& .button__text': {
          ...textDisabled,
        },
        '& .button__icon-left': {
          color: textDisabled?.color,
          ...leftIconDisabled,
        },
        '& .button__icon-right': {
          color: textDisabled?.color,
          ...rightIconDisabled,
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
      align: this.textAlign(),
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

  private textAlign() {
    return css({
      textAlign:
        this._textAlign && this._options?.textAlign?.[this._textAlign]
          ? this._textAlign
          : this._options?.textAlign?.default,
    })();
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
      paddingRight: this._iconRight ? 0 : textStyle?.paddingRight,
    })();
  }

  //----------------------------------------------------------------------------
  // Icon Element
  //----------------------------------------------------------------------------

  // eslint-disable-next-line class-methods-use-this
  get icon() {
    return {
      base: ButtonStyle.iconBase(),
    };
  }

  get iconLeft() {
    return {
      color: this.iconColor('left'),
      size: this.iconSize('left'),
      padding: this.iconPadding('left'),
    };
  }

  get iconRight() {
    return {
      color: this.iconColor('right'),
      size: this.iconSize('right'),
      padding: this.iconPadding('right'),
    };
  }

  private static iconBase() {
    return css({
      display: 'flex',
      transitionProperty: 'color, font-size',
    })();
  }

  private iconColor(position: 'left' | 'right') {
    const iconStyle = this.getStyle<ButtonElementIcon>(this.getIcon(position));
    const textStyle = this.getStyle<ButtonElementText>('text');
    const color = textStyle?.color || iconStyle?.color;

    return css({
      color,

      '& > *': {
        fontSize: 'inherit',
        fill: color || undefined,
      },
    })();
  }

  private iconSize(position: 'left' | 'right') {
    const iconStyle = this.getStyle<ButtonElementIcon>(this.getIcon(position));

    return css({
      fontSize: iconStyle?.fontSize,
    })();
  }

  private iconPadding(position: 'left' | 'right') {
    const iconStyle = this.getStyle<ButtonElementIcon>(this.getIcon(position));

    return css({
      paddingTop: iconStyle?.paddingTop,
      paddingBottom: iconStyle?.paddingBottom,
      paddingLeft: iconStyle?.paddingLeft,
      paddingRight: iconStyle?.paddingRight,
    })();
  }

  //----------------------------------------------------------------------------
  // Helper
  //----------------------------------------------------------------------------

  private getIcon(
    position: 'left' | 'right'
  ):
    | 'iconAlone'
    | 'leftIconAttached'
    | 'rightIconAttached'
    | 'leftIconDetached'
    | 'rightIconDetached' {
    if (this._iconType === 'icon') {
      return `iconAlone`;
    }
    return `${position}Icon${ButtonStyle.capitalizeFirstLetter(
      this._iconType
    )}` as
      | 'leftIconAttached'
      | 'rightIconAttached'
      | 'leftIconDetached'
      | 'rightIconDetached';
  }

  private static capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  private getTransition() {
    return css({
      transitionDuration: this._duration,
      transitionTimingFunction: this._timingFunction,
    })();
  }

  private getStyle<T extends CSSProperties>(
    element: ButtonElement,
    interaction?: Interaction
  ): T | Record<string, never> {
    const baseStyle = this._theme?.elements?.[element];
    const typeStyle = baseStyle?.type?.[this._typeStyle];
    const variantStyle = typeStyle?.variant?.[this._variant];

    if (interaction) {
      return {
        ...baseStyle?.base?.[interaction]?.md,
        ...baseStyle?.base?.[interaction]?.[this._size],

        ...variantStyle?.[interaction]?.md,
        ...variantStyle?.[interaction]?.[this._size],
      } as T;
    }

    return {
      ...baseStyle?.base?.rest?.md,
      ...baseStyle?.base?.rest?.[this._size],

      ...typeStyle?.base?.md,
      ...typeStyle?.base?.[this._size],

      ...variantStyle?.rest?.md,
      ...variantStyle?.rest?.[this._size],
    } as T;
  }
}
