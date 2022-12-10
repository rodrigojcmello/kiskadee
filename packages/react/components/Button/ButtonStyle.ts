/* eslint-disable unicorn/filename-case */
import { keyframes } from '@stitches/core';
import { Memoize } from '@typescript-plus/fast-memoize-decorator';
import type {
  ButtonText,
  IconPosition,
  ButtonStyleProps,
  ButtonOptions,
  GenericCSSProperties,
} from './Button.types';
import {
  CLICK_TRANSITION_DURATION,
  RIPPLE_DURATION,
  RIPPLE_TIMING_FUNCTION,
} from './constants';
import type { ComponentSchema, KiskadeeTheme } from '../../utils';
import { KiskadeeStyle } from '../../utils';

const rippleKeyframe = keyframes({
  to: {
    transform: 'scale(4)',
    opacity: 0,
  },
});

export class ButtonStyle extends KiskadeeStyle {
  // Required ------------------------------------------------------------------

  readonly iconType: ButtonStyleProps['iconType'];

  readonly borderRadius: ButtonStyleProps['borderRadius'];

  readonly width: ButtonStyleProps['width'];

  readonly size: ButtonStyleProps['size'];

  // readonly type: ButtonStyleProps['type'];
  //
  // readonly variant: ButtonStyleProps['variant'];

  // Optional ------------------------------------------------------------------

  readonly options?: ButtonOptions;

  readonly textAlign?: ButtonStyleProps['textAlign'];

  readonly themeMode?: KiskadeeTheme['themeMode'];

  readonly iconLeft?: ButtonStyleProps['iconLeft'];

  readonly iconRight?: ButtonStyleProps['iconRight'];

  // readonly type: ButtonStyleProps['type'];
  //
  // readonly variant: ButtonStyleProps['variant'];

  constructor(style: ButtonStyleProps) {
    super({
      type: style.type,
      variant: style.variant,
      size: style.size,
      componentSchema: style.componentSchema as ComponentSchema,
      info: style.info,
      responsiveOption: style.options?.responsive,
    });

    this.component = 'button';

    // Required ----------------------------------------------------------------

    // todo: review iconType type. Is it really required?
    this.iconType = style.iconType;
    this.width = style.width;
    // this.type = style.type;
    // this.variant = style.variant;

    // Optional ----------------------------------------------------------------

    this.borderRadius = style.borderRadius;
    this.size = style.size;
    this.themeMode = style.info.themeMode;
    this.textAlign = style.textAlign;
    // @ts-ignore
    this.options = style.options;
    this.iconLeft = style.iconLeft;
    this.iconRight = style.iconRight;
  }

  //----------------------------------------------------------------------------
  // Container Element
  //----------------------------------------------------------------------------

  elementContainer() {
    return {
      // TODO: test shadow on dark mode
      radius: this.buttonRadiusStyle('container'),
      width: this.containerWidthStyle(),
      transitionAfterPressed: this.containerTransitionAfterPressed(),
      background: this.propertyBackgroundStyle('container'),
      core: this.containerCoreStyle(),
      base: ButtonStyle.containerBaseStyle(),
      rippleCore: this.containerRippleStyle(),
      rippleBackground: this.containerRippleBackgroundStyle(),
    };
  }

  elementContainerWrapper() {
    return {
      border: this.propertyBorderStyle('container'),
      base: this.containerWrapperBaseStyle(),
    };
  }

  elementGroup() {
    return {
      base: this.groupBaseStyle(),
    };
  }

  groupBaseStyle() {
    return this.cache(['group', 'base'], () => {
      return ButtonStyle.render({
        display: 'flex',
      });
    });
  }

  containerTransitionAfterPressed() {
    return this.cache(['container', 'transition-pressed'], () => {
      return ButtonStyle.render({
        transitionDuration: `${CLICK_TRANSITION_DURATION}ms !important`,
        transitionTimingFunction: 'ease-out !important',
        '& .button__container-wrapper': {
          transitionDuration: 'inherit !important',
          transitionTimingFunction: 'inherit !important',
        },
      });
    });
  }

  // LRU and LFU cache, memory-cache, ttl
  containerRippleStyle() {
    return this.cache(['container', 'ripple'], () => {
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

  containerRippleBackgroundStyle() {
    return this.cache(['container', 'ripple-background'], () => {
      const ripple = this.getContrastStyle('container');

      return ButtonStyle.render({
        '& .--ripple': {
          backgroundColor:
            ripple?.defaultMode?.['rippleColor' as 'backgroundColor'],
          '@media (prefers-color-scheme: dark)': ripple?.contrastMode && {
            backgroundColor:
              ripple?.contrastMode['rippleColor' as 'backgroundColor'],
          },
        },
      });
    });
  }

  containerWidthStyle() {
    const isBlock = this.iconType !== 'Alone' || this.width === 'block';

    const width = isBlock ? '100%' : 'auto';

    return this.cache(['container', 'width', width], () => {
      return ButtonStyle.render({
        width,
        minWidth: this.width === 'min' ? this.options?.widthMin : 0,
      });
    });
  }

  @Memoize()
  static containerBaseStyle(): string | undefined {
    return ButtonStyle.render({
      // TODO: extract reset styles to a class/helper
      userSelect: 'none',
      padding: 0,
      cursor: 'pointer',
      // TODO: extract fontSize to a class/helper
      fontSize: '16px',
      transitionProperty:
        'background-color, box-shadow, border-width, min-width,' +
        ' border-radius',
      position: 'relative',
      overflow: 'hidden',
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
      border: 'none',
    });
  }

  containerWrapperBaseStyle() {
    return this.cache(['container', 'base'], () => {
      return ButtonStyle.render({
        transitionProperty: 'border-color',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'inherit',
      });
    });
  }

  containerCoreStyle() {
    return this.cache(['container', 'core'], () => {
      const containerHover = this.getStyleState('container', 'hover');
      const textHover = this.getStyleState('text', 'hover');
      const leftIconHover = this.getStyleState('iconLeft', 'hover');
      const rightIconHover = this.getStyleState('iconRight', 'hover');

      const containerPressed = this.getStyleState('container', 'pressed');
      const textPressed = this.getStyleState('text', 'pressed');
      const leftIconPressed = this.getStyleState('iconLeft', 'pressed');
      const rightIconPressed = this.getStyleState('iconRight', 'pressed');

      const containerFocus = this.getStyleState('container', 'focus');
      const textFocus = this.getStyleState('text', 'focus');
      const leftIconFocus = this.getStyleState('iconLeft', 'focus');
      const rightIconFocus = this.getStyleState('iconRight', 'focus');

      const containerVisited = this.getStyleState('container', 'visited');
      const textVisited = this.getStyleState('text', 'visited');
      const leftIconVisited = this.getStyleState('iconLeft', 'visited');
      const rightIconVisited = this.getStyleState('iconRight', 'visited');

      const containerDisabled = this.getStyleState('container', 'disabled');
      const textDisabled = this.getStyleState('text', 'disabled');
      const leftIconDisabled = this.getStyleState('iconLeft', 'disabled');
      const rightIconDisabled = this.getStyleState('iconRight', 'disabled');

      const elementStyle = this.getResponsiveStyle('container');

      const p = ButtonStyle.pickResponsiveProperties(elementStyle, [
        'boxShadow',
      ]);

      const { '@media (min-width: 0px)': elementRest, ...elementResponsive } =
        p;

      return ButtonStyle.render({
        ...elementRest,
        ...elementResponsive,

        // HOVER
        '&:hover, &.--hover': {
          '@media (pointer: fine)': {
            boxShadow: containerHover.boxShadow,
            background: containerHover.background,
            '& .button__container-wrapper': {
              borderColor: containerHover.borderColor,
              borderWidth: containerHover.borderWidth,
              borderStyle: containerHover.borderStyle,
            },
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
        },

        // PRESSED
        '&:active, &.--pressed': {
          boxShadow: containerPressed.boxShadow,
          background:
            containerPressed.borderColor || containerPressed.background,

          /**
           * Animation needs to be faster on click. This creates a more
           * fluid experience.
           */
          transitionDuration: `${CLICK_TRANSITION_DURATION}ms`,
          transitionTimingFunction: 'ease-out',

          '& .button__container-wrapper': {
            background: containerPressed.background,
            borderColor: containerPressed.borderColor,
            borderWidth: containerPressed.borderWidth,
            borderStyle: containerPressed.borderStyle,

            transitionDuration: 'inherit',
            transitionTimingFunction: 'inherit',
          },
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
          boxShadow: containerFocus.boxShadow,
          background: containerFocus.borderColor || containerFocus.background,
          outlineOffset: containerFocus.outlineOffset,
          outlineWidth: containerFocus.outlineWidth,
          outlineColor: containerFocus.outlineColor,
          outlineStyle: containerFocus.outlineStyle,
          outline: containerFocus.outline,
          zIndex: 1,
          '& .button__container-wrapper': {
            background: containerFocus.background,
            borderColor: containerFocus.borderColor,
            borderWidth: containerFocus.borderWidth,
            borderStyle: containerFocus.borderStyle,
          },
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
          boxShadow: containerVisited.boxShadow,
          background:
            containerVisited.borderColor || containerVisited.background,
          '& .button__container-wrapper': {
            background: containerVisited.background,
            borderColor: containerVisited.borderColor,
            borderWidth: containerVisited.borderWidth,
            borderStyle: containerVisited.borderStyle,
          },
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
          cursor: 'not-allowed',
          // cursor: 'wait',
          '& .spinner': {
            backgroundColor: textDisabled.color,
          },
          '& .button__text': {
            ...textDisabled,
          },
          '& .button__icon-left': {
            ...leftIconDisabled,
            color: textDisabled?.color || leftIconDisabled?.color,
            '& > *': {
              fill: textDisabled?.color || leftIconDisabled?.color,
            },
            '& > img': {
              opacity: 0.3,
            },
          },
          '& .button__icon-right': {
            ...rightIconDisabled,
            color: textDisabled?.color || rightIconDisabled?.color,
            '& > *': {
              fill: textDisabled?.color || rightIconDisabled?.color,
            },
            '& > img': {
              opacity: 0.3,
            },
          },
        },
      });
    });
  }

  //----------------------------------------------------------------------------
  // Text Element
  //----------------------------------------------------------------------------

  elementText() {
    return {
      base: this.textBaseStyle(),
      core: this.textCoreStyle(),
      color: this.textColorStyle(),
      fontSize: this.textFontSizeStyle(),
      padding: this.textPaddingStyle(),
      width: this.textWidthStyle(),
      align: this.textAlignStyle(),
    };
  }

  textBaseStyle() {
    return this.cache(['text', 'base'], () => {
      return ButtonStyle.render({
        whiteSpace: 'nowrap',
        transitionProperty: 'color, font-size, padding',
      });
    });
  }

  textCoreStyle() {
    return this.cache(['text', 'core'], () => {
      const textElement = this.getStyleEssential<ButtonText>('text');

      // TODO: use Text component here
      return ButtonStyle.render({
        lineHeight: textElement.lineHeight,
        fontWeight: textElement.fontWeight,
        // TODO: not use it if undefined
        fontFamily: `${textElement.fontFamily},Inter var,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;`,
        fontStyle: textElement.fontStyle,
      });
    });
  }

  textFontSizeStyle() {
    return this.cache(['text', 'fontSize'], () => {
      let textResponsive = this.getResponsiveStyle('text');

      textResponsive = ButtonStyle.pickResponsiveProperties(textResponsive, [
        'fontSize',
      ]);

      const { '@media (min-width: 0px)': fontSize, ...fontSizeResponsive } =
        textResponsive;

      return ButtonStyle.render({
        ...fontSize,
        ...fontSizeResponsive,
      });
    });
  }

  textAlignStyle() {
    const textAlign =
      this.textAlign && this.options?.textAlign?.[this.textAlign]
        ? this.textAlign
        : this.options?.textAlign?.default;

    return this.cache(['text', 'align', textAlign || '-'], () => {
      return ButtonStyle.render({
        textAlign,
      });
    });
  }

  textWidthStyle() {
    const isBlock =
      this.iconType === 'Detached' || !(this.iconLeft || this.iconRight);

    const width = isBlock ? '100%' : 'auto';

    return this.cache(['text', 'width', width], () => {
      return ButtonStyle.render({
        width,
      });
    });
  }

  textColorStyle() {
    return this.cache(['text', 'color'], () => {
      const { contrastMode, defaultMode } = this.getContrastStyle('text');

      return ButtonStyle.render({
        color: defaultMode?.color,
        '@media (prefers-color-scheme: dark)': contrastMode && {
          color: contrastMode.color,
        },
      });
    });
  }

  textPaddingStyle() {
    return this.propertySpacingStyle(
      'text',
      'padding',
      this.iconType !== 'Alone' && this.iconType
        ? `icon${this.iconType}`
        : undefined,
      (textResponsive) => {
        const isAttached = this.iconType === 'Attached';
        const hasLeftIcon = this.iconLeft && isAttached;
        const hasRightIcon = this.iconRight && isAttached;

        for (const mq of Object.keys(textResponsive)) {
          textResponsive[mq].paddingRight = hasRightIcon
            ? 0
            : textResponsive[mq].paddingRight;
          textResponsive[mq].paddingLeft = hasLeftIcon
            ? 0
            : textResponsive[mq].paddingLeft;
        }

        return textResponsive;
      },
      [this.iconLeft ? 'left' : '-', this.iconRight ? 'right' : '-']
    );
  }

  //----------------------------------------------------------------------------
  // Icon Element
  //----------------------------------------------------------------------------

  // TODO: jpg/png/webp icon support
  // eslint-disable-next-line class-methods-use-this
  elementIcon() {
    return {
      base: this.iconBaseStyle(),
    };
  }

  elementIconLeft() {
    return {
      color: this.iconColorStyle('Left'),
      border: this.propertyBorderStyle('iconLeft', `icon${this.iconType}`),
      background: this.propertyBackgroundStyle(
        'iconLeft',
        `icon${this.iconType}`
      ),
      size: this.iconSizeStyle('iconLeft'),
      padding: this.propertySpacingStyle(
        'iconLeft',
        'padding',
        `icon${this.iconType}`
      ),
      margin: this.propertySpacingStyle(
        'iconLeft',
        'margin',
        `icon${this.iconType}`
      ),
      radius: this.buttonRadiusStyle('iconLeft'),
    };
  }

  elementIconRight() {
    return {
      color: this.iconColorStyle('Right'),
      border: this.propertyBorderStyle('iconRight', `icon${this.iconType}`),
      background: this.propertyBackgroundStyle(
        'iconRight',
        `icon${this.iconType}`
      ),
      size: this.iconSizeStyle('iconRight'),
      padding: this.propertySpacingStyle(
        'iconRight',
        'padding',
        `icon${this.iconType}`
      ),
      margin: this.propertySpacingStyle(
        'iconRight',
        'margin',
        `icon${this.iconType}`
      ),
      radius: this.buttonRadiusStyle('iconRight'),
    };
  }

  // TODO: type all return values
  iconBaseStyle() {
    return this.cache(['icon', 'base'], () => {
      return ButtonStyle.render({
        display: 'flex',
        // TODO: review this
        transitionProperty:
          'color, font-size, border-radius, border, width, height, padding, margin, background-color',
      });
    });
  }

  iconColorStyle(position: IconPosition): string | undefined {
    return this.cache(['icon', 'color', position, this.iconType || '-'], () => {
      const iconContrast = this.getContrastStyle(
        `icon${position}`,
        `icon${this.iconType}`
      );
      const textContrast = this.getContrastStyle('text');

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

  propertySpacingStyle(
    element: string,
    spacing: 'margin' | 'padding',
    status?: string,
    callback?: (value: { [mediaQuery: string]: GenericCSSProperties }) => {
      [mediaQuery: string]: GenericCSSProperties;
    },
    extraKeys: string[] = []
  ): string | undefined {
    return this.cache(
      [element, spacing, this.size || 'md', status || '-', ...extraKeys],
      () => {
        let elementResponsive = this.getResponsiveStyle(element, status);

        elementResponsive = KiskadeeStyle.pickResponsiveProperties(
          elementResponsive,
          [
            `${spacing}Top`,
            `${spacing}Bottom`,
            `${spacing}Right`,
            `${spacing}Left`,
            spacing,
          ]
        );

        if (callback) {
          elementResponsive = callback(elementResponsive);
        }

        const {
          '@media (min-width: 0px)': elementSpacing,
          ...elementSpacingResponsive
        } = elementResponsive;

        return KiskadeeStyle.render({
          ...elementSpacing,
          ...elementSpacingResponsive,
        });
      }
    );
  }

  // TODO: review radius status
  // TODO: standardize names
  // TODO: rename status to state
  buttonRadiusStyle(element: string): string | undefined {
    let state = 'borderRadiusNone';
    if (!this.borderRadius && this.options?.borderRadius) {
      state = `borderRadius${this.options?.borderRadius}`;
    } else if (this.borderRadius === 'Rounded') {
      state = 'borderRadiusRounded';
    } else if (this.borderRadius === 'Full') {
      state = 'borderRadiusFull';
    }

    return this.propertyRadiusStyle(element, state);
  }

  iconSizeStyle(element: string): string | undefined {
    return this.cache([element, 'size', this.size || 'md'], () => {
      let iconResponsive = this.getResponsiveStyle(element);

      iconResponsive = ButtonStyle.pickResponsiveProperties(iconResponsive, [
        'fontSize',
      ]);

      for (const mq of Object.keys(iconResponsive)) {
        iconResponsive[mq] = {
          fontSize: iconResponsive[mq].fontSize,
          height: iconResponsive[mq].fontSize,
          width: iconResponsive[mq].fontSize,
          /**
           * minWidth is used just because of Firefox
           */
          minWidth: iconResponsive[mq].fontSize,
        };
      }

      const { '@media (min-width: 0px)': size, ...sizeResponsive } =
        iconResponsive;

      return ButtonStyle.render({
        ...size,
        ...sizeResponsive,
      });
    });
  }
}
