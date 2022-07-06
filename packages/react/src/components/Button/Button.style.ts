/* eslint-disable unicorn/filename-case */
import { css } from '@stitches/core';
import type { CSSProperties } from 'react';
import type {
  ButtonElements,
  ButtonElementContainer,
  ButtonElementIcon,
  ButtonElementText,
  ButtonSchema,
  ButtonStyleProps,
  ContainerOptions,
  Interaction,
  Size,
  ContrastStyle,
  Breakpoint,
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

  private readonly _schema: ButtonSchema | undefined;

  private readonly _theme: ButtonStyleProps['theme'];

  private readonly _iconLeft: ButtonStyleProps['iconLeft'];

  private readonly _iconRight: ButtonStyleProps['iconRight'];

  // Transition

  private readonly _timingFunction: string;

  private readonly _duration: string;

  // Responsive

  private readonly _responsive: Record<
    keyof Exclude<ContainerOptions['responsive'], undefined>,
    number
  >;

  // private readonly _styleContainer: ButtonElementContainer;

  private readonly _styleContainerHover: ButtonElementContainer;

  private readonly _styleText: ButtonElementText;

  private readonly _styleTextHover: ButtonElementText;

  // Cache
  private _style: {
    [component: string]: {
      [element: string]: {
        [state: string]: CSSProperties;
      };
    };
  };

  constructor(style: ButtonStyleProps) {
    // Required
    this._iconType = style.iconType;
    this._width = style.width;
    this._size = style.size;
    this._typeStyle = style.typeStyle;
    this._variant = style.variant;
    this._borderRadius = style.borderRadius;

    // Optional
    this._schema = style.schema;
    this._theme = style.theme;
    this._textAlign = style.textAlign;
    this._options = style.schema?.option;
    this._iconLeft = style.iconLeft;
    this._iconRight = style.iconRight;

    // Transition
    this._timingFunction = 'ease';
    this._duration = '0.2s';

    // Responsive

    this._responsive = {
      smallScreenBP1: 0,
      smallScreenBP2: 321,
      smallScreenBP3: 376,

      mediumScreenBP1: 481,
      mediumScreenBP2: 641,
      mediumScreenBP3: 769,

      bigScreenBP1: 1025,
      bigScreenBP2: 1281,
      bigScreenBP3: 1441,
    };

    // Cache
    this._style = {};

    // TODO: remove this
    // Element Style

    // this._styleContainer =
    //   this.getStyleLegacy<ButtonElementContainer>('container');
    this._styleContainerHover = this.getStyleLegacy<ButtonElementContainer>(
      'container',
      'hover'
    );

    this._styleText = this.getStyleLegacy<ButtonElementText>('text');
    this._styleTextHover = this.getStyleLegacy<ButtonElementText>(
      'text',
      'hover'
    );
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
          this._size || 'md'
        ] || this._options?.borderRadius?.variant?.[this._borderRadius]?.md;
    } else if (
      (this._options?.borderRadius?.default === 'rounded' ||
        this._options?.borderRadius?.default === 'full') &&
      this._borderRadius === 'default'
    ) {
      borderRadius =
        this._options?.borderRadius?.variant?.[
          this._options?.borderRadius?.default
        ]?.[this._size || 'md'] ||
        this._options?.borderRadius?.variant?.[
          this._options?.borderRadius?.default
        ]?.md;
    } else {
      borderRadius = this._options?.borderRadius?.none;
    }

    return css({
      // TODO: need to handle responsive
      borderRadius: borderRadius || 0,
    })();
  }

  private containerBackground() {
    const style = this.getContrastStyle<ButtonElementContainer>('container');

    return css({
      background: style?.defaultMode?.background,
      backgroundColor: style?.defaultMode?.backgroundColor,
      '@media (prefers-color-scheme: dark)': style?.contrastMode && {
        background: style?.contrastMode?.background,
        backgroundColor: style?.contrastMode?.backgroundColor,
      },
    })();
  }

  private containerBorder() {
    const container = this.getStyleBase<ButtonElementContainer>('container');

    return css({
      border: container?.borderWidth ? undefined : 'none',
      borderColor: container?.borderColor,
      borderStyle: container?.borderStyle,
      borderWidth: container?.borderWidth,
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
    const containerHover = this._styleContainerHover;
    const textHover = this._styleTextHover;
    const leftIconHover = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon('left'),
      'hover'
    );
    const rightIconHover = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon('right'),
      'hover'
    );

    const containerPressed = this.getStyleLegacy<ButtonElementContainer>(
      'container',
      'pressed'
    );
    const textPressed = this.getStyleLegacy<ButtonElementText>(
      'text',
      'pressed'
    );
    const leftIconPressed = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon('left'),
      'pressed'
    );
    const rightIconPressed = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon('right'),
      'pressed'
    );

    const containerFocus = this.getStyleLegacy<ButtonElementContainer>(
      'container',
      'focus'
    );
    const textFocus = this.getStyleLegacy<ButtonElementText>('text', 'focus');
    const leftIconFocus = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon('left'),
      'focus'
    );
    const rightIconFocus = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon('right'),
      'focus'
    );

    const containerVisited = this.getStyleLegacy<ButtonElementContainer>(
      'container',
      'visited'
    );
    const textVisited = this.getStyleLegacy<ButtonElementText>(
      'text',
      'visited'
    );
    const leftIconVisited = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon('left'),
      'visited'
    );
    const rightIconVisited = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon('right'),
      'visited'
    );

    const containerDisabled = this.getStyleLegacy<ButtonElementContainer>(
      'container',
      'disabled'
    );
    const textDisabled = this.getStyleLegacy<ButtonElementText>(
      'text',
      'disabled'
    );
    const leftIconDisabled = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon('left'),
      'disabled'
    );
    const rightIconDisabled = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon('right'),
      'disabled'
    );

    const elementStyle =
      this.getResponsiveStyle<ButtonElementContainer>('container');

    const p = ButtonStyle.pickResponsiveProperties<ButtonElementContainer>(
      elementStyle,
      ['boxShadow']
    );

    const { '@media (min-width: 0px)': elementRest, ...elementResponsive } = p;

    return css({
      // TODO: need responsive?
      ...elementRest,
      ...elementResponsive,

      // TODO: limit props to interaction state
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

  // OK
  private static textBase() {
    return css({
      whiteSpace: 'nowrap',
      transitionProperty: 'color, font-size, padding',
    })();
  }

  // OK
  private textCore() {
    return css({
      fontSize: this._styleText.fontSize,
      lineHeight: this._styleText.lineHeight,
      fontWeight: this._styleText.fontWeight,
      fontFamily: this._styleText.fontFamily,
      fontStyle: this._styleText.fontStyle,
    });
  }

  // OK
  private textAlign() {
    return css({
      textAlign:
        this._textAlign && this._options?.textAlign?.[this._textAlign]
          ? this._textAlign
          : this._options?.textAlign?.default,
    })();
  }

  // OK
  private textWidth() {
    const block =
      this._iconType === 'detached' || !(this._iconLeft || this._iconRight);

    return css({
      width: block ? '100%' : 'auto',
    })();
  }

  private textColor() {
    const style = this.getContrastStyle<ButtonElementText>('text');

    return css({
      color: style?.defaultMode?.color,
      '@media (prefers-color-scheme: dark)': style?.contrastMode && {
        color: style?.contrastMode?.color,
      },
    })();
  }

  private textPadding() {
    const style = this.getResponsiveStyle<ButtonElementText>('text');

    const p = ButtonStyle.pickResponsiveProperties<ButtonElementText>(style, [
      'paddingTop',
      'paddingBottom',
      'paddingRight',
      'paddingLeft',
    ]);

    for (const m of Object.keys(p)) {
      p[m].paddingRight = this._iconRight ? 0 : p[m].paddingRight;
      p[m].paddingLeft = this._iconLeft ? 0 : p[m].paddingLeft;
    }

    const { '@media (min-width: 0px)': elementRest, ...elementResponsive } = p;

    return css({
      ...elementRest,
      ...elementResponsive,
    })();
  }

  private static pickResponsiveProperties<T>(
    responsive: {
      [mediaQuery: string]: T;
    },
    properties: (keyof T)[]
  ) {
    const newObject: {
      [mediaQuery: string]: T;
    } = {};
    for (const mediaQuery of Object.keys(responsive)) {
      if (!newObject[mediaQuery]) {
        newObject[mediaQuery] = {} as T;
      }
      for (const property of properties) {
        if (responsive[mediaQuery]?.[property]) {
          /**
           * TS2590: Expression produces a union type that is too complex to represent.
           */
          // @ts-ignore
          newObject[mediaQuery][property] = responsive[mediaQuery][property];
        }
      }
    }
    return newObject;
  }

  //----------------------------------------------------------------------------
  // Icon Element
  //----------------------------------------------------------------------------

  // TODO: jpg/png/webp icon support
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
    const icon = this.getContrastStyle<ButtonElementIcon>(
      this.getIcon(position)
    );
    const text = this.getContrastStyle<ButtonElementText>('text');

    const colorDefault = icon?.defaultMode?.color || text?.defaultMode?.color;
    const colorContrast =
      icon?.contrastMode?.color || text?.contrastMode?.color;

    return css({
      color: colorDefault,

      '& > *': {
        fontSize: 'inherit',
        fill: colorDefault,
      },

      '@media (prefers-color-scheme: dark)': colorContrast && {
        color: colorContrast,
        '& > *': {
          fill: colorContrast,
        },
      },
    })();
  }

  private iconSize(position: 'left' | 'right') {
    const iconStyle = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon(position)
    );

    return css({
      fontSize: iconStyle?.fontSize,
    })();
  }

  private iconPadding(position: 'left' | 'right') {
    const iconStyle = this.getStyleLegacy<ButtonElementIcon>(
      this.getIcon(position)
    );

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

  private getStyleLegacy<T>(
    element: ButtonElements,
    interaction?: Interaction,
    size?: Size,
    dark?: boolean
  ): T {
    if (
      !(interaction || size || dark) &&
      element === 'text' &&
      this._styleText
    ) {
      return this._styleText as T;
    }

    const isDark = dark || this._theme?.only === 'dark';
    const contrast = isDark ? 'dark' : 'light';
    const baseStyle = this._schema?.elements?.[element];
    const typeStyle = baseStyle?.[contrast]?.default?.type?.[this._typeStyle];
    const variantStyle = typeStyle?.variant?.[this._variant];

    if (interaction) {
      return {
        ...baseStyle?.[contrast]?.default?.base?.[interaction]?.md,
        ...baseStyle?.[contrast]?.default?.base?.[interaction]?.[
          size || this._size || 'md'
        ],

        // TODO: should use the same inferior logic?
        ...variantStyle?.[interaction]?.md,
        ...variantStyle?.[interaction]?.[size || this._size || 'md'],
      } as T;
    }

    return {
      // TODO: Just is?
      ...(isDark ? baseStyle?.light?.default?.base?.rest?.md : {}),
      ...(size ? {} : baseStyle?.[contrast]?.default?.base?.rest?.md),
      ...baseStyle?.light?.default?.base?.rest?.[size || this._size || 'md'],

      ...(size ? {} : typeStyle?.base?.md),
      ...typeStyle?.base?.[size || this._size || 'md'],

      ...(size ? {} : variantStyle?.rest?.md),
      ...variantStyle?.rest?.[size || this._size || 'md'],
    } as T;
  }

  private getStyleBase<T>(element: ButtonElements): T {
    if (this._style.button) {
      if (this._style.button[element]?.light) {
        return this._style.button[element].light as T;
      }
      this._style.button[element] = {};
    } else {
      this._style.button = {
        [element]: {},
      };
    }

    const base = this._schema?.elements?.[element];
    const type = base?.light?.default?.type?.[this._typeStyle];
    const variant = type?.variant?.[this._variant];

    this._style.button[element].light = {
      ...base?.light?.default?.base?.rest?.md,
      ...type?.base?.md,
      ...variant?.rest?.md,
    };

    return this._style.button[element].light as T;
  }

  private getStyleDark<T>(element: ButtonElements): T {
    if (this._style.button) {
      if (this._style.button[element]?.dark) {
        return this._style.button[element].dark as T;
      }
      this._style.button[element] = {};
    } else {
      this._style.button = {
        [element]: {},
      };
    }

    const base = this._schema?.elements?.[element];
    const type = base?.dark?.default?.type?.[this._typeStyle];
    const variant = type?.variant?.[this._variant];

    this._style.button[element].dark = {
      ...base?.dark?.default?.base?.rest?.md,
      ...type?.base?.md,
      ...variant?.rest?.md,
    };

    return this._style.button[element].dark as T;
  }

  private getStyleSize<T>(
    element: ButtonElements,
    size: Exclude<Size, 'md'>
  ): T {
    if (this._style.button) {
      if (this._style.button[element]?.[size]) {
        return this._style.button[element][size] as T;
      }
      this._style.button[element] = {};
    } else {
      this._style.button = {
        [element]: {},
      };
    }

    const base = this._schema?.elements?.[element];
    const type = base?.light?.default?.type?.[this._typeStyle];
    const variant = type?.variant?.[this._variant];

    this._style.button[element][size] = {
      ...base?.light?.default?.base?.rest?.[size],
      ...type?.base?.[size],
      ...variant?.rest?.[size],
    };

    return this._style.button[element][size] as T;
  }

  getResponsiveStyle<T>(element: ButtonElements): {
    [mediaQuery: string]: T;
  } {
    const responsive: { [mediaQuery: string]: T } = {};

    if (!this._size) {
      for (const breakpoint of Object.keys(this._options?.responsive || {})) {
        const size = this?._options?.responsive?.[breakpoint as Breakpoint];
        if (size) {
          responsive[
            `@media (min-width: ${
              this._responsive[breakpoint as Breakpoint]
            }px)`
          ] =
            size === 'md'
              ? this.getStyleBase(element)
              : this.getStyleSize(element, size);
        }
      }
    } else {
      responsive['@media (min-width: 0px)'] =
        !this._size || this._size === 'md'
          ? this.getStyleBase(element)
          : this.getStyleSize(element, this._size);
    }

    return responsive;
  }

  getContrastStyle<T>(element: ButtonElements): ContrastStyle<T> {
    const responsive: ContrastStyle<T> = {};

    const light: T = this.getStyleBase(element);

    const dark: T = {
      ...light,
      ...this.getStyleDark(element),
    };

    if (!this._theme?.only) {
      responsive.contrastMode = dark;
    }

    responsive.defaultMode = this._theme?.only === 'dark' ? dark : light;

    return responsive;
  }
}
