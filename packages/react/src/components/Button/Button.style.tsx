import styled from '@emotion/styled';
import type { ButtonProps, ButtonSchema } from './Button.types';

const timingFunction = 'ease';
const duration = '0.2s';

export const ButtonStyled = styled.button<
  Pick<
    ButtonProps,
    'width' | 'variant' | 'textAlign' | 'iconLeft' | 'iconLeftType'
  > & {
    theme?: ButtonSchema;
    typeStyle: ButtonProps['type'];
    borderRadius: Exclude<ButtonProps['borderRadius'], undefined>;
  }
>(
  ({
    theme: { text, container, leftIcon },
    width,
    typeStyle,
    variant,
    borderRadius,
    textAlign,
    iconLeft,
    iconLeftType,
  }) => {
    const elementContainer = {
      ...container?.base?.rest,
      ...container?.type?.[typeStyle]?.base,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.rest,
    };

    const elementText = {
      ...text?.base?.rest,
      ...text?.type?.[typeStyle]?.base,
      ...text?.type?.[typeStyle]?.variant?.[variant]?.rest,
    };

    const elementLeftIcon = iconLeftType && {
      color: elementText.color,
      ...leftIcon?.base?.rest,
      ...leftIcon?.type?.[typeStyle]?.base,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconLeftType]?.rest,
    };

    const option = container?.option;

    // Hover

    const elementIconLeftHover = iconLeftType && {
      ...leftIcon?.base?.hover,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconLeftType]?.hover,
    };

    const elementContainerHover = {
      color: elementIconLeftHover?.color,
      ...container?.base?.hover,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.hover,
    };

    const elementTextHover = {
      ...text?.base?.hover,
      ...text?.type?.[typeStyle]?.variant?.[variant]?.hover,
    };

    // Pressed

    const elementContainerPressed = {
      ...container?.base?.pressed,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.pressed,
    };

    const elementTextPressed = {
      ...text?.base?.pressed,
      ...text?.type?.[typeStyle]?.variant?.[variant]?.pressed,
    };

    const elementIconLeftPressed = iconLeftType && {
      color: elementTextPressed?.color,
      ...leftIcon?.base?.pressed,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconLeftType]
        ?.pressed,
    };

    // Focus

    const elementContainerFocus = {
      ...container?.base?.focus,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.focus,
    };

    const elementTextFocus = {
      ...text?.base?.focus,
      ...text?.type?.[typeStyle]?.variant?.[variant]?.focus,
    };

    const elementIconLeftFocus = iconLeftType && {
      color: elementTextFocus?.color,
      ...leftIcon?.base?.focus,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconLeftType]?.focus,
    };

    // Visited

    const elementContainerVisited = {
      ...container?.base?.visited,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.visited,
    };

    const elementTextVisited = {
      ...text?.base?.visited,
      ...text?.type?.[typeStyle]?.variant?.[variant]?.visited,
    };

    const elementIconLeftVisited = iconLeftType && {
      color: elementTextVisited?.color,
      ...leftIcon?.base?.visited,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconLeftType]
        ?.visited,
    };

    // Disabled

    const elementContainerDisabled = {
      ...container?.base?.disabled,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.disabled,
    };

    const elementTextDisabled = {
      ...text?.base?.disabled,
      ...text?.type?.[typeStyle]?.variant?.[variant]?.disabled,
    };

    const elementIconLeftDisabled = iconLeftType && {
      color: elementTextDisabled?.color,
      ...leftIcon?.base?.disabled,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconLeftType]
        ?.disabled,
    };

    return {
      //------------------------------------------------------------------------
      // Container
      //------------------------------------------------------------------------

      '&.button': {
        // Reset
        border: 'none',
        padding: 0,

        // Style
        ...elementContainer,

        // Default
        cursor: 'pointer',
        fontSize: '16px',
        transitionProperty:
          'box-shadow, border-color, background, padding, min-width, border-radius',
        transitionDuration: duration,
        transitionTimingFunction: timingFunction,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        // OPTION - WIDTH
        width: width === 'block' ? '100%' : 'auto',
        minWidth: width === 'min' ? option?.widthMin : 0,

        // OPTION - RADIUS
        borderRadius: option?.borderRadius?.[borderRadius] || 0,

        // OPTION - TEXT ALIGN
        textAlign:
          textAlign && option?.textAlign?.[textAlign]
            ? textAlign
            : option?.textAlign?.default,
      },

      //------------------------------------------------------------------------
      // Left Icon
      //------------------------------------------------------------------------

      '& .button__icon-left': {
        // Style
        ...elementLeftIcon,

        // Default
        display: 'flex',
        transitionProperty: 'color, font-size',
        transitionDuration: duration,
        transitionTimingFunction: timingFunction,
        '& > *': {
          fontSize: 'inherit',
          fill: elementLeftIcon?.color || undefined,
        },
      },

      //------------------------------------------------------------------------
      // Text
      //------------------------------------------------------------------------

      '& .button__text': {
        // Style
        ...elementText,
        paddingLeft: iconLeft ? 0 : elementText?.paddingLeft,

        // Default
        width: iconLeftType === 'detached' || !iconLeft ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        transitionProperty: 'color, font-size, padding',
        transitionDuration: duration,
        transitionTimingFunction: timingFunction,
      },

      //------------------------------------------------------------------------
      // INTERACTION
      //------------------------------------------------------------------------

      // HOVER
      '&:hover, &.--hover': {
        ...elementContainerHover,
        '.button__text': {
          ...elementTextHover,
        },
        '.button__icon-left': {
          ...elementIconLeftHover,
        },
      },

      // PRESSED
      '&:active, &.--pressed': {
        ...elementContainerPressed,
        '.button__text': {
          ...elementTextPressed,
        },
        '.button__icon-left': {
          ...elementIconLeftPressed,
        },
      },

      // FOCUS
      '&:focus-visible, &.--focus': {
        ...elementContainerFocus,
        '.button__text': {
          ...elementTextFocus,
        },
        '.button__icon-left': {
          ...elementIconLeftFocus,
        },
      },

      // VISITED
      '&:visited, &.--visited': {
        ...elementContainerVisited,
        '.button__text': {
          ...elementTextVisited,
        },
        '.button__icon-left': {
          ...elementIconLeftVisited,
        },
      },

      // DISABLED
      '&:disabled, &--disabled': {
        ...elementContainerDisabled,
        cursor: 'not-allowed',
        '.button__text': {
          ...elementTextDisabled,
        },
        '.button__icon-left': {
          ...elementIconLeftDisabled,
        },
      },
    };
  }
);
