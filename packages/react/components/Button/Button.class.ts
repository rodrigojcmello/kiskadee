/* eslint-disable unicorn/filename-case */
import { keyframes } from '@stitches/core';
import type {
  ButtonContainer,
  ButtonIcon,
  ButtonText,
  IconPosition,
  ButtonStatus,
} from './Button.types';
import { RIPPLE_DURATION, RIPPLE_TIMING_FUNCTION } from './constants';
import { Style } from '../../utils';

const rippleKeyframe = keyframes({
  to: {
    transform: 'scale(4)',
    opacity: 0,
  },
});

export class ButtonClass extends Style {
  common() {
    return {
      transition: this.getTransition(),
    };
  }

  //----------------------------------------------------------------------------
  // Container Element
  //----------------------------------------------------------------------------

  elementContainer() {
    return {
      border: this.containerBorderStyle(),
      background: this.containerBackgroundStyle(),
      radius: this.propertyRadiusStyle('container'),
      width: this.containerWidthStyle(),
      core: this.containerCoreStyle(),
      base: this.containerBaseStyle(),
      rippleCore: this.containerRippleStyle(),
      rippleBackground: this.containerRippleBackgroundStyle(),
    };
  }

  // LRU and LFU cache, memory-cache, ttl
  containerRippleStyle() {
    return this.cache(['container', 'ripple'], () => {
      return ButtonClass.render({
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
      const ripple = this.getContrastStyle<ButtonContainer>('container');

      return ButtonClass.render({
        backgroundColor: ripple?.defaultMode?.rippleColor,
        '@media (prefers-color-scheme: dark)': ripple?.contrastMode && {
          backgroundColor: ripple?.contrastMode.rippleColor,
        },
      });
    });
  }

  containerWidthStyle() {
    const isBlock = this.iconType !== 'Alone' || this.width === 'block';

    const width = isBlock ? '100%' : 'auto';

    return this.cache(['container', 'width', width], () => {
      return ButtonClass.render({
        width,
        minWidth: this.width === 'min' ? this.options?.widthMin : 0,
      });
    });
  }

  containerBackgroundStyle() {
    return this.cache(['container', 'background'], () => {
      const style = this.getContrastStyle<ButtonContainer>('container');

      return ButtonClass.render({
        background: style.defaultMode?.background,
        '@media (prefers-color-scheme: dark)': style.contrastMode && {
          background: style.contrastMode?.background,
        },
      });
    });
  }

  containerBorderStyle() {
    return this.cache(['container', 'border'], () => {
      const container = this.getStyleEssential<ButtonContainer>('container');

      return ButtonClass.render({
        border: container?.borderWidth ? undefined : '0px solid transparent',
        borderColor: container?.borderColor,
        borderStyle: container?.borderStyle,
        borderWidth: container?.borderWidth,
      });
    });
  }

  containerBaseStyle() {
    return this.cache(['container', 'base'], () => {
      return ButtonClass.render({
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

  containerCoreStyle() {
    return this.cache(['container', 'core'], () => {
      const containerHover = this.getStyleStatus<ButtonContainer, ButtonStatus>(
        'container',
        'hover'
      );
      const textHover = this.getStyleStatus<ButtonText, ButtonStatus>(
        'text',
        'hover'
      );
      const leftIconHover = this.getStyleStatus<ButtonIcon, ButtonStatus>(
        'iconLeft',
        'hover'
      );
      const rightIconHover = this.getStyleStatus<ButtonIcon, ButtonStatus>(
        'iconRight',
        'hover'
      );

      const containerPressed = this.getStyleStatus<
        ButtonContainer,
        ButtonStatus
      >('container', 'pressed');
      const textPressed = this.getStyleStatus<ButtonText, ButtonStatus>(
        'text',
        'pressed'
      );
      const leftIconPressed = this.getStyleStatus<ButtonIcon, ButtonStatus>(
        'iconLeft',
        'pressed'
      );
      const rightIconPressed = this.getStyleStatus<ButtonIcon, ButtonStatus>(
        'iconRight',
        'pressed'
      );

      const containerFocus = this.getStyleStatus<ButtonContainer, ButtonStatus>(
        'container',
        'focus'
      );
      const textFocus = this.getStyleStatus<ButtonText, ButtonStatus>(
        'text',
        'focus'
      );
      const leftIconFocus = this.getStyleStatus<ButtonIcon, ButtonStatus>(
        'iconLeft',
        'focus'
      );
      const rightIconFocus = this.getStyleStatus<ButtonIcon, ButtonStatus>(
        'iconRight',
        'focus'
      );

      const containerVisited = this.getStyleStatus<
        ButtonContainer,
        ButtonStatus
      >('container', 'visited');
      const textVisited = this.getStyleStatus<ButtonText, ButtonStatus>(
        'text',
        'visited'
      );
      const leftIconVisited = this.getStyleStatus<ButtonIcon, ButtonStatus>(
        'iconLeft',
        'visited'
      );
      const rightIconVisited = this.getStyleStatus<ButtonIcon, ButtonStatus>(
        'iconRight',
        'visited'
      );

      const containerDisabled = this.getStyleStatus<
        ButtonContainer,
        ButtonStatus
      >('container', 'disabled');
      const textDisabled = this.getStyleStatus<ButtonText, ButtonStatus>(
        'text',
        'disabled'
      );
      const leftIconDisabled = this.getStyleStatus<ButtonIcon, ButtonStatus>(
        'iconLeft',
        'disabled'
      );
      const rightIconDisabled = this.getStyleStatus<ButtonIcon, ButtonStatus>(
        'iconRight',
        'disabled'
      );

      const elementStyle = this.getResponsiveStyle('container');

      const p = ButtonClass.pickResponsiveProperties(elementStyle, [
        'boxShadow',
      ]);

      const { '@media (min-width: 0px)': elementRest, ...elementResponsive } =
        p;

      return ButtonClass.render({
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
      return ButtonClass.render({
        whiteSpace: 'nowrap',
        transitionProperty: 'color, font-size, padding',
      });
    });
  }

  textCoreStyle() {
    return this.cache(['text', 'core'], () => {
      const textElement = this.getStyleEssential<ButtonText>('text');

      // TODO: use Text component here
      return ButtonClass.render({
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

      textResponsive = ButtonClass.pickResponsiveProperties(textResponsive, [
        'fontSize',
      ]);

      const { '@media (min-width: 0px)': fontSize, ...fontSizeResponsive } =
        textResponsive;

      return ButtonClass.render({
        ...fontSize,
        ...fontSizeResponsive,
      });
    });
  }

  textAlignStyle() {
    return this.cache(['text', 'align'], () => {
      return ButtonClass.render({
        textAlign:
          this.textAlign && this.options?.textAlign?.[this.textAlign]
            ? this.textAlign
            : this.options?.textAlign?.default,
      });
    });
  }

  textWidthStyle() {
    const isBlock =
      this.iconType === 'Detached' || !(this.iconLeft || this.iconRight);

    const width = isBlock ? '100%' : 'auto';

    return this.cache(['text', 'width', width], () => {
      return ButtonClass.render({
        width,
      });
    });
  }

  textColorStyle() {
    return this.cache(['text', 'color'], () => {
      const textContrast = this.getContrastStyle<ButtonText>('text');

      return ButtonClass.render({
        color: textContrast?.defaultMode?.color,
        '@media (prefers-color-scheme: dark)': textContrast?.contrastMode && {
          color: textContrast?.contrastMode?.color,
        },
      });
    });
  }

  textPaddingStyle() {
    return this.propertySpacingStyle(
      'text',
      'padding',
      undefined,
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
      [
        this.iconLeft ? 'left' : '-',
        this.iconRight ? 'right' : '-',
        this.iconType || '-',
      ]
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
      backgroundColor: this.iconBackgroundStyle('Left'),
      size: this.iconSizeStyle('Left'),
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
      radius: this.propertyRadiusStyle('iconLeft'),
    };
  }

  elementIconRight() {
    return {
      color: this.iconColorStyle('Right'),
      backgroundColor: this.iconBackgroundStyle('Right'),
      size: this.iconSizeStyle('Right'),
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
      radius: this.propertyRadiusStyle('iconRight'),
    };
  }

  iconBaseStyle() {
    return this.cache(['icon', 'base'], () => {
      return ButtonClass.render({
        display: 'flex',
        transitionProperty:
          'color, font-size, border-radius, padding, margin, background-color',
      });
    });
  }

  iconColorStyle(position: IconPosition) {
    return this.cache(['icon', 'color', position, this.iconType || '-'], () => {
      const iconContrast = this.getContrastStyle<ButtonIcon>(
        `icon${position}`,
        `icon${this.iconType}`
      );
      const textContrast = this.getContrastStyle<ButtonText>('text');

      const colorDefault =
        iconContrast?.defaultMode?.color || textContrast?.defaultMode?.color;
      const colorContrast =
        iconContrast?.contrastMode?.color || textContrast?.contrastMode?.color;

      return ButtonClass.render({
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

  // TODO: merge all background-colors here
  // TODO: type all return values
  iconBackgroundStyle(position: IconPosition) {
    return this.cache(
      ['icon', 'background', position, this.iconType || '-'],
      () => {
        const backgroundContrast = this.getContrastStyle<ButtonIcon>(
          `icon${position}`,
          `icon${this.iconType}`
        );

        return ButtonClass.render({
          background: backgroundContrast.defaultMode?.background,

          '@media (prefers-color-scheme: dark)': backgroundContrast && {
            color: backgroundContrast.contrastMode?.background,
          },
        });
      }
    );
  }

  // TODO: support SVG, png, jpg, webp
  iconSizeStyle(position: IconPosition): string | undefined {
    return this.cache(['icon', 'size', position, this.size || 'md'], () => {
      let iconResponsive = this.getResponsiveStyle(`icon${position}`);

      iconResponsive = ButtonClass.pickResponsiveProperties(iconResponsive, [
        'fontSize',
        'width',
        'height',
      ]);

      const { '@media (min-width: 0px)': size, ...sizeResponsive } =
        iconResponsive;

      return ButtonClass.render({
        ...size,
        ...sizeResponsive,
      });
    });
  }

  iconPaddingStyle(position: IconPosition): string | undefined {
    return this.cache(['icon', 'padding', position, this.size || 'md'], () => {
      let iconResponsive = this.getResponsiveStyle(`icon${position}`);

      iconResponsive = ButtonClass.pickResponsiveProperties(iconResponsive, [
        'paddingTop',
        'paddingBottom',
        'paddingRight',
        'paddingLeft',
      ]);

      const {
        '@media (min-width: 0px)': iconPadding,
        ...iconPaddingResponsive
      } = iconResponsive;

      return ButtonClass.render({
        ...iconPadding,
        ...iconPaddingResponsive,
      });
    });
  }

  // TODO: merge all margins here
  iconMarginStyle(position: IconPosition): string | undefined {
    return this.cache(
      ['icon', 'margin', position, this.size || 'md', this.iconType || '-'],
      () => {
        let iconResponsive = this.getResponsiveStyle(
          `icon${position}`,
          `icon${this.iconType}`
        );

        iconResponsive = ButtonClass.pickResponsiveProperties(iconResponsive, [
          'marginTop',
          'marginBottom',
          'marginRight',
          'marginLeft',
        ]);

        const {
          '@media (min-width: 0px)': iconMargin,
          ...iconMarginResponsive
        } = iconResponsive;

        return ButtonClass.render({
          ...iconMargin,
          ...iconMarginResponsive,
        });
      }
    );
  }
}
