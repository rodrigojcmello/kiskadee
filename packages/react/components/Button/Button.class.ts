/* eslint-disable unicorn/filename-case */
import { keyframes } from '@stitches/core';
import type {
  ButtonContainer,
  ButtonIcon,
  ButtonText,
  IconPosition,
  BorderRadiusState,
  PrefixState,
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

  // LRU and LFU cache, memory-cache, ttl
  containerRipple() {
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

  containerRippleBackground() {
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

  containerWidth() {
    const isBlock = this.iconType !== 'Alone' || this.width === 'block';

    const width = isBlock ? '100%' : 'auto';

    return this.cache(['container', 'width', width], () => {
      return ButtonClass.render({
        width,
        minWidth: this.width === 'min' ? this.options?.widthMin : 0,
      });
    });
  }

  containerRadius() {
    let status: PrefixState<'borderRadius', BorderRadiusState> =
      'borderRadiusNone';

    if (!this.borderRadius && this.options?.borderRadius) {
      status = `borderRadius${this.options?.borderRadius}`;
    } else if (this.borderRadius === 'Rounded') {
      status = 'borderRadiusRounded';
    } else if (this.borderRadius === 'Full') {
      status = 'borderRadiusFull';
    }

    const elementStyle = this.getResponsiveStyle<ButtonContainer, ButtonStatus>(
      'container',
      status
    );

    const p = ButtonClass.pickResponsiveProperties<ButtonContainer>(
      elementStyle,
      ['borderRadius']
    );

    const { '@media (min-width: 0px)': elementRest, ...elementResponsive } = p;

    return ButtonClass.render({
      ...elementRest,
      ...elementResponsive,
    });
  }

  containerBackground() {
    return this.cache(['container', 'background'], () => {
      const style = this.getContrastStyle<ButtonContainer>('container');

      return ButtonClass.render({
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

  containerBase() {
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

  containerCore() {
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

      const elementStyle =
        this.getResponsiveStyle<ButtonContainer>('container');

      const p = ButtonClass.pickResponsiveProperties<ButtonContainer>(
        elementStyle,
        ['boxShadow']
      );

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
      base: this.textBase(),
      core: this.textCore(),
      color: this.textColor(),
      fontSize: this.textFontSize(),
      padding: this.textPadding(),
      width: this.textWidth(),
      align: this.textAlign2(),
    };
  }

  textBase() {
    return this.cache(['text', 'base'], () => {
      return ButtonClass.render({
        whiteSpace: 'nowrap',
        transitionProperty: 'color, font-size, padding',
      });
    });
  }

  textCore() {
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

  textFontSize() {
    return this.cache(['text', 'fontSize'], () => {
      let textResponsive = this.getResponsiveStyle<ButtonText>('text');

      textResponsive = ButtonClass.pickResponsiveProperties<ButtonText>(
        textResponsive,
        ['fontSize']
      );

      const { '@media (min-width: 0px)': fontSize, ...fontSizeResponsive } =
        textResponsive;

      return ButtonClass.render({
        ...fontSize,
        ...fontSizeResponsive,
      });
    });
  }

  textAlign2() {
    return this.cache(['text', 'align'], () => {
      return ButtonClass.render({
        textAlign:
          this.textAlign && this.options?.textAlign?.[this.textAlign]
            ? this.textAlign
            : this.options?.textAlign?.default,
      });
    });
  }

  textWidth() {
    const isBlock =
      this.iconType === 'Detached' || !(this.iconLeft || this.iconRight);

    const width = isBlock ? '100%' : 'auto';

    return this.cache(['text', 'width', width], () => {
      return ButtonClass.render({
        width,
      });
    });
  }

  textColor() {
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

  textPadding() {
    return this.cache(
      [
        'text',
        'padding',
        this.iconType ?? '',
        this.iconLeft ? 'left' : '',
        this.iconRight ? 'right' : '',
        this.size ?? 'md',
      ],
      () => {
        let textResponsive = this.getResponsiveStyle<ButtonText>('text');

        textResponsive = ButtonClass.pickResponsiveProperties<ButtonText>(
          textResponsive,
          ['paddingTop', 'paddingBottom', 'paddingRight', 'paddingLeft']
        );

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

        const {
          '@media (min-width: 0px)': textPadding,
          ...textPaddingResponsive
        } = textResponsive;

        return ButtonClass.render({
          ...textPadding,
          ...textPaddingResponsive,
        });
      }
    );
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

  // TODO: rename it
  iconLeft2() {
    return {
      color: this.iconColor('Left'),
      backgroundColor: this.iconBackgroundColor('Left'),
      size: this.iconSize('Left'),
      padding: this.iconPadding('Left'),
    };
  }

  iconRight2() {
    return {
      color: this.iconColor('Right'),
      backgroundColor: this.iconBackgroundColor('Right'),
      size: this.iconSize('Right'),
      padding: this.iconPadding('Right'),
    };
  }

  iconBase() {
    return this.cache(['icon', 'base'], () => {
      return ButtonClass.render({
        display: 'flex',
        transitionProperty: 'color, font-size',
      });
    });
  }

  iconColor(position: IconPosition) {
    return this.cache(['icon', 'color', position], () => {
      const iconContrast = this.getContrastStyle<ButtonIcon>(`icon${position}`);
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

  iconBackgroundColor(position: IconPosition) {
    return this.cache(['icon', 'background-color', position], () => {
      const backgroundColorContrast = this.getContrastStyle<ButtonIcon>(
        `icon${position}`
      );

      return ButtonClass.render({
        backgroundColor: backgroundColorContrast.defaultMode?.backgroundColor,

        '@media (prefers-color-scheme: dark)': backgroundColorContrast && {
          color: backgroundColorContrast.contrastMode?.backgroundColor,
        },
      });
    });
  }

  // TODO: support SVG
  iconSize(position: IconPosition) {
    return this.cache(['icon', 'size', position, this.size || 'md'], () => {
      let iconResponsive = this.getResponsiveStyle<ButtonIcon>(
        `icon${position}`
      );
      let textResponsive = this.getResponsiveStyle<ButtonText>('text');

      iconResponsive = ButtonClass.pickResponsiveProperties<ButtonIcon>(
        iconResponsive,
        ['fontSize']
      );
      textResponsive = ButtonClass.pickResponsiveProperties<ButtonText>(
        textResponsive,
        ['fontSize']
      );

      for (const mq of Object.keys(iconResponsive)) {
        iconResponsive[mq].fontSize =
          iconResponsive[mq].fontSize || textResponsive[mq].fontSize;
      }

      const { '@media (min-width: 0px)': size, ...sizeResponsive } =
        iconResponsive;

      return ButtonClass.render({
        ...size,
        ...sizeResponsive,
      });
    });
  }

  iconPadding(position: IconPosition): string | undefined {
    return this.cache(['icon', 'padding', position, this.size || 'md'], () => {
      let iconResponsive = this.getResponsiveStyle<ButtonIcon>(
        `icon${position}`
      );

      iconResponsive = ButtonClass.pickResponsiveProperties<ButtonIcon>(
        iconResponsive,
        ['paddingTop', 'paddingBottom', 'paddingRight', 'paddingLeft']
      );

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
}
