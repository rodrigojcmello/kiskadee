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

    const elementLeftIcon = iconLeftType && {
      ...leftIcon?.base?.rest,
      ...leftIcon?.type?.[typeStyle]?.base,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconLeftType]?.rest,
    };

    const elementText = {
      ...text?.base?.rest,
      ...text?.type?.[typeStyle]?.base,
      ...text?.type?.[typeStyle]?.variant?.[variant]?.rest,
    };

    const option = container?.option;

    const elementContainerHover = {
      ...container?.base?.hover,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.hover,
    };

    const elementIconLeftHover = iconLeftType && {
      ...leftIcon?.base?.hover,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconLeftType]?.hover,
    };

    const elementTextHover = {
      ...text?.base?.hover,
      ...text?.type?.[typeStyle]?.variant?.[variant]?.hover,
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
        color: elementText.color,
        ...elementLeftIcon,

        // Default
        display: 'flex',
        transitionProperty: 'color, font-size',
        transitionDuration: duration,
        transitionTimingFunction: timingFunction,
        '& > *': {
          fontSize: 'inherit',
          fill: elementLeftIcon?.color || elementText?.color || undefined,
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
        width: iconLeftType === 'detached' ? '100%' : 'auto',
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
          color: elementTextHover.color,
          ...elementIconLeftHover,
        },
      },

      // PRESSED
      '&:active, &.--pressed': {
        ...container?.base?.pressed,
        ...container?.type?.[typeStyle]?.variant?.[variant]?.pressed,
        '.button__text': {
          ...text?.base?.pressed,
          ...text?.type?.[typeStyle]?.variant?.[variant]?.pressed,
        },
      },

      // FOCUS
      '&:focus-visible, &.--focus': {
        ...container?.base?.focus,
        ...container?.type?.[typeStyle]?.variant?.[variant]?.focus,
        '.button__text': {
          ...text?.base?.focus,
          ...text?.type?.[typeStyle]?.variant?.[variant]?.focus,
        },
      },

      // VISITED
      '&:visited, &.--visited': {
        ...container?.base?.visited,
        ...container?.type?.[typeStyle]?.variant?.[variant]?.visited,
        '.button__text': {
          ...text?.base?.visited,
          ...text?.type?.[typeStyle]?.variant?.[variant]?.visited,
        },
      },

      // DISABLED
      '&:disabled': {
        ...container?.base?.disabled,
        ...container?.type?.[typeStyle]?.variant?.[variant]?.disabled,
        cursor: 'not-allowed',
        '.button__text': {
          ...text?.base?.disabled,
          ...text?.type?.[typeStyle]?.variant?.[variant]?.disabled,
        },
      },
    };
  }
);
