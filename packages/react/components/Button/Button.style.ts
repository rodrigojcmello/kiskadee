/* eslint-disable unicorn/filename-case */
import { css, keyframes } from '@stitches/core';
import type {
  Breakpoint,
  ButtonElementContainer,
  ButtonElementIcon,
  ButtonElements,
  ButtonElementText,
  ButtonSchema,
  ButtonStyleProps,
  ContainerOptions,
  ContrastStyle,
  IconPosition,
  InteractionStatus,
  Size,
  StitchesProperties,
  IconType,
} from './Button.types';
import { RIPPLE_DURATION, RIPPLE_TIMING_FUNCTION } from './constants';
import { CacheStyle } from '../../utils/CacheStyle.class';

const rippleKeyframe = keyframes({
  to: {
    transform: 'scale(4)',
    opacity: 0,
  },
});

const cacheStyle = new CacheStyle();

export class ButtonStyle {
  // Required

  private readonly _iconType: ButtonStyleProps['iconType'];

  private readonly _borderRadius: ButtonStyleProps['borderRadius'];

  private readonly _width: ButtonStyleProps['width'];

  private readonly _size: ButtonStyleProps['size'];

  private readonly _type: ButtonStyleProps['type'];

  private readonly _variant: ButtonStyleProps['variant'];

  // Optional

  private readonly _options: ContainerOptions | undefined;

  private readonly _textAlign: ButtonStyleProps['textAlign'];

  private readonly _schema: ButtonSchema | undefined;

  private readonly _theme: ButtonStyleProps['theme']['option'];

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

  // Cache

  constructor(style: ButtonStyleProps) {
    // Required
    this._iconType = style.iconType;
    this._width = style.width;
    this._type = style.type;
    this._variant = style.variant;
    this._borderRadius = style.borderRadius;

    // Optional
    this._size = style.size;
    this._schema = style.schema;
    this._theme = style.theme.option;
    this._textAlign = style.textAlign;
    this._options = style.schema?.option;
    this._iconLeft = style.iconLeft;
    this._iconRight = style.iconRight;

    cacheStyle.checkCache(
      style.theme.name,
      style.theme.version,
      style.theme.author
    );

    // Transition
    this._timingFunction = 'ease-in';
    this._duration = '0.250s';

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
  }

  common() {
    return {
      transition: this.getTransition(),
    };
  }

  //----------------------------------------------------------------------------
  // Container Element
  //----------------------------------------------------------------------------

  container() {
    return {
      border: this.containerBorder(),
      background: this.containerBackground(),
      radius: this.containerRadius(),
      width: this.containerWidth(),
      core: this.containerCore(),
      base: this.containerBase(),
      rippleCore: this.containerRipple(),
      rippleBackground: this.containerRippleBackground(),
    };
  }

  containerRipple() {
    return this.cache('container', 'ripple', () => {
      return ButtonStyle.render({
        position: 'absolute',
        borderRadius: '50%',
        transform: 'scale(0)',
        animationDuration: `${RIPPLE_DURATION}ms`,
        animationTimingFunction: RIPPLE_TIMING_FUNCTION,
        animationName: rippleKeyframe,
      });
    });
  }

  containerRippleBackground() {
    return this.cache('container', 'rippleBackground', () => {
      const ripple = this.getContrastStyle<ButtonElementContainer>('container');

      return ButtonStyle.render({
        backgroundColor: ripple?.defaultMode?.rippleColor,
        '@media (prefers-color-scheme: dark)': ripple?.contrastMode && {
          backgroundColor: ripple?.contrastMode.rippleColor,
        },
      });
    });
  }

  containerWidth() {
    return this.cache('container', 'width', () => {
      return ButtonStyle.render({
        width: this._width === 'block' ? '100%' : 'auto',
        minWidth: this._width === 'min' ? this._options?.widthMin : 0,
      });
    });
  }

  containerRadius() {
    return this.cache('container', 'radius', () => {
      let borderRadius;
      const defaultBorder = this._options?.borderRadius?.default;
      const variant = this._options?.borderRadius?.variant;

      if (this._borderRadius === 'rounded' || this._borderRadius === 'full') {
        borderRadius =
          variant?.[this._borderRadius]?.[this._size || 'md'] ||
          variant?.[this._borderRadius]?.md;
      } else if (
        (defaultBorder === 'rounded' || defaultBorder === 'full') &&
        this._borderRadius === 'default'
      ) {
        borderRadius =
          variant?.[defaultBorder]?.[this._size || 'md'] ||
          variant?.[defaultBorder]?.md;
      }

      return ButtonStyle.render({
        // TODO: need to handle responsive
        borderRadius: borderRadius || 0,
      });
    });
  }

  containerBackground() {
    return this.cache('container', 'background', () => {
      const style = this.getContrastStyle<ButtonElementContainer>('container');

      return ButtonStyle.render({
        background: style.defaultMode?.background,
        backgroundColor: style.defaultMode?.backgroundColor,
        '@media (prefers-color-scheme: dark)': style.contrastMode && {
          background: style.contrastMode?.background,
          backgroundColor: style.contrastMode?.backgroundColor,
        },
      });
    });
  }

  containerBorder() {
    return this.cache('container', 'border', () => {
      const container = this.getStyleBase<ButtonElementContainer>('container');

      return ButtonStyle.render({
        border: container?.borderWidth ? undefined : '0px solid transparent',
        borderColor: container?.borderColor,
        borderStyle: container?.borderStyle,
        borderWidth: container?.borderWidth,
      });
    });
  }

  containerBase() {
    return this.cache('container', 'base', () => {
      return ButtonStyle.render({
        userSelect: 'none',
        padding: 0,
        cursor: 'pointer',
        fontSize: '16px',
        transitionProperty:
          'box-shadow, border-color, border-width, background, padding, min-width, border-radius',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      });
    });
  }

  containerCore() {
    return this.cache('container', 'core', () => {
      const containerHover = this.getStyleStatus<ButtonElementContainer>(
        'container',
        'hover'
      );
      const textHover = this.getStyleStatus<ButtonElementText>('text', 'hover');
      const leftIconHover = this.getStyleStatus<ButtonElementIcon>(
        'iconLeft',
        'hover'
      );
      const rightIconHover = this.getStyleStatus<ButtonElementIcon>(
        'iconRight',
        'hover'
      );

      const containerPressed = this.getStyleStatus<ButtonElementContainer>(
        'container',
        'pressed'
      );
      const textPressed = this.getStyleStatus<ButtonElementText>(
        'text',
        'pressed'
      );
      const leftIconPressed = this.getStyleStatus<ButtonElementIcon>(
        'iconLeft',
        'pressed'
      );
      const rightIconPressed = this.getStyleStatus<ButtonElementIcon>(
        'iconRight',
        'pressed'
      );

      const containerFocus = this.getStyleStatus<ButtonElementContainer>(
        'container',
        'focus'
      );
      const textFocus = this.getStyleStatus<ButtonElementText>('text', 'focus');
      const leftIconFocus = this.getStyleStatus<ButtonElementIcon>(
        'iconLeft',
        'focus'
      );
      const rightIconFocus = this.getStyleStatus<ButtonElementIcon>(
        'iconRight',
        'focus'
      );

      const containerVisited = this.getStyleStatus<ButtonElementContainer>(
        'container',
        'visited'
      );
      const textVisited = this.getStyleStatus<ButtonElementText>(
        'text',
        'visited'
      );
      const leftIconVisited = this.getStyleStatus<ButtonElementIcon>(
        'iconLeft',
        'visited'
      );
      const rightIconVisited = this.getStyleStatus<ButtonElementIcon>(
        'iconRight',
        'visited'
      );

      const containerDisabled = this.getStyleStatus<ButtonElementContainer>(
        'container',
        'disabled'
      );
      const textDisabled = this.getStyleStatus<ButtonElementText>(
        'text',
        'disabled'
      );
      const leftIconDisabled = this.getStyleStatus<ButtonElementIcon>(
        'iconLeft',
        'disabled'
      );
      const rightIconDisabled = this.getStyleStatus<ButtonElementIcon>(
        'iconRight',
        'disabled'
      );

      const elementStyle =
        this.getResponsiveStyle<ButtonElementContainer>('container');

      const p = ButtonStyle.pickResponsiveProperties<ButtonElementContainer>(
        elementStyle,
        ['boxShadow']
      );

      const { '@media (min-width: 0px)': elementRest, ...elementResponsive } =
        p;

      return ButtonStyle.render({
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
          // cursor: 'not-allowed',
          cursor: 'wait',
          '& .spinner': {
            backgroundColor: textDisabled.color,
          },
          '& .button__text': {
            ...textDisabled,
          },
          // TODO: fix this
          '& .button__icon-left': {
            color: textDisabled?.color,
            ...leftIconDisabled,
          },
          '& .button__icon-right': {
            color: textDisabled?.color,
            ...rightIconDisabled,
          },
        },
      });
    });
  }

  //----------------------------------------------------------------------------
  // Text Element
  //----------------------------------------------------------------------------

  text() {
    return {
      base: ButtonStyle.textBase(),
      core: this.textCore(),
      color: this.textColor_COLOR(),
      fontSize: this.textFontSize_SIZE(),
      padding: this.textPadding_SIZE(),
      width: this.textWidth(),
      align: this.textAlign(),
    };
  }

  static textBase() {
    return ButtonStyle.render({
      whiteSpace: 'nowrap',
      transitionProperty: 'color, font-size, padding',
    });
  }

  textCore() {
    return this.cache('text', 'core', () => {
      const textElement = this.getStyleBase<ButtonElementText>('text');

      return ButtonStyle.render({
        lineHeight: textElement.lineHeight,
        fontWeight: textElement.fontWeight,
        fontFamily: textElement.fontFamily,
        fontStyle: textElement.fontStyle,
      });
    });
  }

  textFontSize_SIZE() {
    return this.cache('text', 'fontSize', () => {
      let textResponsive = this.getResponsiveStyle<ButtonElementText>('text');

      textResponsive = ButtonStyle.pickResponsiveProperties<ButtonElementText>(
        textResponsive,
        ['fontSize']
      );

      const { '@media (min-width: 0px)': fontSize, ...fontSizeResponsive } =
        textResponsive;

      return ButtonStyle.render({
        ...fontSize,
        ...fontSizeResponsive,
      });
    });
  }

  textAlign() {
    return this.cache('text', 'align', () => {
      return ButtonStyle.render({
        textAlign:
          this._textAlign && this._options?.textAlign?.[this._textAlign]
            ? this._textAlign
            : this._options?.textAlign?.default,
      });
    });
  }

  textWidth() {
    return this.cache('text', 'width', () => {
      const block =
        this._iconType === 'detached' || !(this._iconLeft || this._iconRight);

      return ButtonStyle.render({
        width: block ? '100%' : 'auto',
      });
    });
  }

  textColor_COLOR() {
    return this.cache('text', 'color', () => {
      const textContrast = this.getContrastStyle<ButtonElementText>('text');

      return ButtonStyle.render({
        color: textContrast?.defaultMode?.color,
        '@media (prefers-color-scheme: dark)': textContrast?.contrastMode && {
          color: textContrast?.contrastMode?.color,
        },
      });
    });
  }

  textPadding_SIZE() {
    return this.cache('text', 'padding', () => {
      let textResponsive = this.getResponsiveStyle<ButtonElementText>('text');

      textResponsive = ButtonStyle.pickResponsiveProperties<ButtonElementText>(
        textResponsive,
        ['paddingTop', 'paddingBottom', 'paddingRight', 'paddingLeft']
      );

      for (const mq of Object.keys(textResponsive)) {
        textResponsive[mq].paddingRight = this._iconRight
          ? 0
          : textResponsive[mq].paddingRight;
        textResponsive[mq].paddingLeft = this._iconLeft
          ? 0
          : textResponsive[mq].paddingLeft;
      }

      const {
        '@media (min-width: 0px)': textPadding,
        ...textPaddingResponsive
      } = textResponsive;

      return ButtonStyle.render({
        ...textPadding,
        ...textPaddingResponsive,
      });
    });
  }

  //----------------------------------------------------------------------------
  // Icon Element
  //----------------------------------------------------------------------------

  // TODO: jpg/png/webp icon support
  // eslint-disable-next-line class-methods-use-this
  icon() {
    return {
      base: this.iconBase(),
    };
  }

  iconLeft() {
    return {
      color: this.iconColor_COLOR('Left'),
      size: this.iconSize_SIZE('Left'),
      padding: this.iconPadding_SIZE('Left'),
    };
  }

  iconRight() {
    return {
      color: this.iconColor_COLOR('Right'),
      size: this.iconSize_SIZE('Right'),
      padding: this.iconPadding_SIZE('Right'),
    };
  }

  iconBase() {
    return this.cache('icon', 'base', () => {
      return ButtonStyle.render({
        display: 'flex',
        transitionProperty: 'color, font-size',
      });
    });
  }

  iconColor_COLOR(position: IconPosition) {
    return this.cache(`icon${position}`, 'color', () => {
      const iconContrast = this.getContrastStyle<ButtonElementIcon>(
        `icon${position}`
      );
      const textContrast = this.getContrastStyle<ButtonElementText>('text');

      const colorDefault =
        iconContrast?.defaultMode?.color || textContrast?.defaultMode?.color;
      const colorContrast =
        iconContrast?.contrastMode?.color || textContrast?.contrastMode?.color;

      return ButtonStyle.render({
        color: colorDefault,

        '& > *': {
          fontSize: 'inherit !important',
          fill: colorDefault,
        },

        '@media (prefers-color-scheme: dark)': colorContrast && {
          color: colorContrast,
          '& > *': {
            fill: colorContrast,
          },
        },
      });
    });
  }

  // TODO: support SVG
  iconSize_SIZE(position: IconPosition) {
    return this.cache(`icon${position}`, 'size', () => {
      let iconResponsive = this.getResponsiveStyle<ButtonElementIcon>(
        `icon${position}`
      );
      let textResponsive = this.getResponsiveStyle<ButtonElementText>('text');

      iconResponsive = ButtonStyle.pickResponsiveProperties<ButtonElementIcon>(
        iconResponsive,
        ['fontSize']
      );
      textResponsive = ButtonStyle.pickResponsiveProperties<ButtonElementText>(
        textResponsive,
        ['fontSize']
      );

      for (const mq of Object.keys(iconResponsive)) {
        iconResponsive[mq].fontSize =
          iconResponsive[mq].fontSize || textResponsive[mq].fontSize;
      }

      const { '@media (min-width: 0px)': size, ...sizeResponsive } =
        iconResponsive;

      return ButtonStyle.render({
        ...size,
        ...sizeResponsive,
      });
    });
  }

  iconPadding_SIZE(position: IconPosition): string | undefined {
    return this.cache(`icon${position}`, 'padding', () => {
      let iconResponsive = this.getResponsiveStyle<ButtonElementIcon>(
        `icon${position}`
      );

      iconResponsive = ButtonStyle.pickResponsiveProperties<ButtonElementIcon>(
        iconResponsive,
        ['paddingTop', 'paddingBottom', 'paddingRight', 'paddingLeft']
      );

      const {
        '@media (min-width: 0px)': iconPadding,
        ...iconPaddingResponsive
      } = iconResponsive;

      return ButtonStyle.render({
        ...iconPadding,
        ...iconPaddingResponsive,
      });
    });
  }

  //----------------------------------------------------------------------------
  // Helper
  //----------------------------------------------------------------------------

  cache<T>(element: string, property: string, callback: () => T): T {
    const key = {
      component: 'button',
      type: this._type,
      variant: this._variant,
      element,
      property,
    };

    const cache = cacheStyle.get<T>(key);
    if (cache) return cache;

    const value = callback();
    cacheStyle.set(key, value);
    return value;
  }

  static pickResponsiveProperties<T>(
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
          newObject[mediaQuery][property] = responsive[mediaQuery][property];
        }
      }
    }
    return newObject;
  }

  /**
   * Empty objects generates a css class empty in Stitches library
   */
  static render(properties: StitchesProperties): string | undefined {
    const validProperties = Object.keys(properties).length > 0;

    if (validProperties) {
      return css(properties)();
    }
  }

  getTransition() {
    return this.cache('all', 'transition', () => {
      return ButtonStyle.render({
        transitionDuration: this._duration,
        transitionTimingFunction: this._timingFunction,
      });
    });
  }

  getStyleBase<T>(element: ButtonElements): T {
    return this.cache(element, 'base', () => {
      const baseSchema = this._schema?.elements?.[element];
      const typeSchema = baseSchema?.light?.default?.type?.[this._type];
      const variantSchema = typeSchema?.variant?.[this._variant];

      return {
        ...baseSchema?.light?.default?.base?.rest?.md,
        ...typeSchema?.base?.md,
        ...variantSchema?.rest?.md,
      } as T;
    });
  }

  getStyleStatus<T, ExtraStatus = string | undefined>(
    element: ButtonElements,
    status: ExtraStatus extends IconType
      ? ExtraStatus | InteractionStatus
      : InteractionStatus
  ): T {
    return this.cache(element, status, () => {
      const base = this._schema?.elements?.[element];
      const type = base?.light?.default?.type?.[this._type];
      const variant = type?.variant?.[this._variant];

      return {
        ...base?.light?.default?.base?.[status]?.md,
        ...variant?.[status]?.md,
      } as T;
    });
  }

  getStyleDark<T>(element: ButtonElements): T {
    return this.cache(element, 'dark', () => {
      const base = this._schema?.elements?.[element];
      const type = base?.dark?.default?.type?.[this._type];
      const variant = type?.variant?.[this._variant];

      return {
        ...base?.dark?.default?.base?.rest?.md,
        ...type?.base?.md,
        ...variant?.rest?.md,
      } as T;
    });
  }

  getStyleSize<T>(element: ButtonElements, size: Exclude<Size, 'md'>): T {
    return this.cache(element, size, () => {
      const base = this._schema?.elements?.[element];
      const type = base?.light?.default?.type?.[this._type];
      const variant = type?.variant?.[this._variant];

      return {
        ...base?.light?.default?.base?.rest?.[size],
        ...type?.base?.[size],
        ...variant?.rest?.[size],
      } as T;
    });
  }

  getResponsiveStyle<T>(element: ButtonElements): {
    [mediaQuery: string]: T;
  } {
    return this.cache(element, 'responsive', () => {
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
            : {
                ...this.getStyleBase(element),
                ...this.getStyleSize(element, this._size),
              };
      }

      return responsive;
    });
  }

  getContrastStyle<T>(element: ButtonElements): ContrastStyle<T> {
    return this.cache(element, 'contrast', () => {
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
    });
  }
}
