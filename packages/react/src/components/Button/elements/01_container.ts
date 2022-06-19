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

    const containerHover = this.getStateStyle<ButtonElementContainer>(
      'container',
      'hover'
    );
    const textHover = this.getStateStyle<ButtonElementText>('text', 'hover');
    const leftIconHover = this.getStateStyle<ButtonElementIcon>(
      this.getIcon('left'),
      'hover'
    );
    const rightIconHover = this.getStateStyle<ButtonElementIcon>(
      this.getIcon('right'),
      'hover'
    );

    const containerPressed = this.getStateStyle<ButtonElementContainer>(
      'container',
      'pressed'
    );
    const textPressed = this.getStateStyle<ButtonElementText>(
      'text',
      'pressed'
    );
    const leftIconPressed = this.getStateStyle<ButtonElementIcon>(
      this.getIcon('left'),
      'pressed'
    );
    const rightIconPressed = this.getStateStyle<ButtonElementIcon>(
      this.getIcon('right'),
      'pressed'
    );

    const containerFocus = this.getStateStyle<ButtonElementContainer>(
      'container',
      'focus'
    );
    const textFocus = this.getStateStyle<ButtonElementText>('text', 'focus');
    const leftIconFocus = this.getStateStyle<ButtonElementIcon>(
      this.getIcon('left'),
      'focus'
    );
    const rightIconFocus = this.getStateStyle<ButtonElementIcon>(
      this.getIcon('right'),
      'focus'
    );

    const containerVisited = this.getStateStyle<ButtonElementContainer>(
      'container',
      'visited'
    );
    const textVisited = this.getStateStyle<ButtonElementText>(
      'text',
      'visited'
    );
    const leftIconVisited = this.getStateStyle<ButtonElementIcon>(
      this.getIcon('left'),
      'visited'
    );
    const rightIconVisited = this.getStateStyle<ButtonElementIcon>(
      this.getIcon('right'),
      'visited'
    );

    const containerDisabled = this.getStateStyle<ButtonElementContainer>(
      'container',
      'disabled'
    );
    const textDisabled = this.getStateStyle<ButtonElementText>(
      'text',
      'disabled'
    );
    const leftIconDisabled = this.getStateStyle<ButtonElementIcon>(
      this.getIcon('left'),
      'disabled'
    );
    const rightIconDisabled = this.getStateStyle<ButtonElementIcon>(
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

    return css({
      color: textStyle?.color || iconStyle?.color,

      '& > *': {
        fontSize: 'inherit',
        fill: iconStyle?.color || undefined,
      },
    })();
  }

  private iconSize(position: 'left' | 'right') {
    const iconLeftStyle = this.getStyle<ButtonElementIcon>(
      this.getIcon(position)
    );

    return css({
      fontSize: iconLeftStyle?.fontSize,
    })();
  }

  private iconPadding(position: 'left' | 'right') {
    const iconLeftStyle = this.getStyle<ButtonElementIcon>(
      this.getIcon(position)
    );

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

  private getIcon(
    position: 'left' | 'right'
  ):
    | 'leftIconAttached'
    | 'rightIconAttached'
    | 'leftIconDetached'
    | 'rightIconDetached' {
    return this._iconType === 'attached'
      ? `${position}IconAttached`
      : `${position}IconDetached`;
  }

  private getTransition() {
    return css({
      transitionDuration: this._duration,
      transitionTimingFunction: this._timingFunction,
    })();
  }

  private getStateStyle<T>(
    element: keyof ButtonSchema,
    state: InteractionState
  ): T | Record<string, never> {
    return {
      ...this._theme?.[element]?.base?.[state]?.[this._size],
      ...this._theme?.[element]?.type?.[this._typeStyle]?.variant?.[
        this._variant
      ]?.[state]?.[this._size],
    } as T;
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
