import styled from '@emotion/styled';
import type { CSSProperties } from 'react';
import { css } from '@stitches/core';
import type { ButtonProps, ButtonSchema, Size } from './Button.types';

const timingFunction = 'ease';
const duration = '0.2s';

type ElementProps = {
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

export const elementText = ({
  theme,
  size,
  typeStyle,
  variant,
  iconLeft,
  iconRight,
  iconType,
}: ElementProps) => {
  const { text } = theme || {};

  return css({
    // Custom
    ...text?.base?.rest?.md,
    ...text?.base?.rest?.[size],
    ...text?.type?.[typeStyle]?.base?.md,
    ...text?.type?.[typeStyle]?.base?.[size],
    ...text?.type?.[typeStyle]?.variant?.[variant]?.rest?.md,
    ...text?.type?.[typeStyle]?.variant?.[variant]?.rest?.[size],

    // Base
    width:
      iconType === 'detached' || !(iconLeft || iconRight) ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    transitionProperty: 'color, font-size, padding',
    transitionDuration: duration,
    transitionTimingFunction: timingFunction,
  })();
};

export const ButtonStyled = styled.button<
  Pick<
    ButtonProps,
    'width' | 'variant' | 'textAlign' | 'iconLeft' | 'iconRight' | 'iconType'
  > & {
    theme?: ButtonSchema;
    size: Size;
    typeStyle: ButtonProps['type'];
    borderRadius: Exclude<ButtonProps['borderRadius'], undefined>;
  }
>(
  ({
    theme: { text, container, leftIcon, rightIcon },
    size,
    width,
    typeStyle,
    variant,
    borderRadius,
    textAlign,
    iconLeft,
    iconRight,
    iconType,
  }) => {
    const option = container?.option;

    const elementContainer = {
      // Reset
      border: 'none',
      padding: 0,

      // Custom
      ...container?.base?.rest?.md,
      ...container?.base?.rest?.[size],
      ...container?.type?.[typeStyle]?.base?.md,
      ...container?.type?.[typeStyle]?.base?.[size],
      ...container?.type?.[typeStyle]?.variant?.[variant]?.rest?.md,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.rest?.[size],

      // Base
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
    };

    const elementText: CSSProperties | undefined = {
      // Custom
      ...text?.base?.rest?.md,
      ...text?.base?.rest?.[size],
      ...text?.type?.[typeStyle]?.base?.md,
      ...text?.type?.[typeStyle]?.base?.[size],
      ...text?.type?.[typeStyle]?.variant?.[variant]?.rest?.md,
      ...text?.type?.[typeStyle]?.variant?.[variant]?.rest?.[size],

      // Base
      width:
        iconType === 'detached' || !(iconLeft || iconRight) ? '100%' : 'auto',
      whiteSpace: 'nowrap',
      transitionProperty: 'color, font-size, padding',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    };

    // Option
    elementText.paddingLeft = iconLeft ? 0 : elementText?.paddingLeft;
    elementText.paddingRight = iconRight ? 0 : elementText?.paddingRight;

    const elementLeftIcon: CSSProperties | undefined = iconType && {
      // Inherit from text
      color: elementText.color,

      // Custom
      ...leftIcon?.base?.rest?.[size],
      ...leftIcon?.base?.rest?.md,
      ...leftIcon?.type?.[typeStyle]?.base?.[size],
      ...leftIcon?.type?.[typeStyle]?.base?.md,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]?.rest?.md,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]?.rest?.[
        size
      ],

      // Base
      display: 'flex',
      transitionProperty: 'color, font-size',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    };

    const elementRightIcon: CSSProperties | undefined = iconType && {
      color: elementText.color,
      ...rightIcon?.base?.rest?.md,
      ...rightIcon?.base?.rest?.[size],
      ...rightIcon?.type?.[typeStyle]?.base?.md,
      ...rightIcon?.type?.[typeStyle]?.base?.[size],
      ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]?.rest?.md,
      ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]?.rest?.[
        size
      ],
      display: 'flex',
      transitionProperty: 'color, font-size',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    };

    // Hover -------------------------------------------------------------------

    const elementContainerHover = {
      ...container?.base?.hover?.md,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.hover?.md,
    };

    const elementTextHover = {
      ...text?.base?.hover?.[size],
      ...text?.type?.[typeStyle]?.variant?.[variant]?.hover?.[size],
    };

    const elementIconLeftHover = iconType
      ? {
          color: elementTextHover?.color,
          ...leftIcon?.base?.hover,
          ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]?.hover,
        }
      : {};

    const elementIconRightHover = iconType
      ? {
          color: elementTextHover?.color,
          ...rightIcon?.base?.hover,
          ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]
            ?.hover,
        }
      : {};

    // Pressed -----------------------------------------------------------------

    const elementContainerPressed = {
      ...container?.base?.pressed,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.pressed,
    };

    const elementTextPressed = {
      ...text?.base?.pressed?.[size],
      ...text?.type?.[typeStyle]?.variant?.[variant]?.pressed?.[size],
    };

    const elementIconLeftPressed = iconType
      ? {
          color: elementTextPressed?.color,
          ...leftIcon?.base?.pressed,
          ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]
            ?.pressed,
        }
      : {};

    const elementIconRightPressed = iconType
      ? {
          color: elementTextPressed?.color,
          ...rightIcon?.base?.pressed,
          ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]
            ?.pressed,
        }
      : {};

    // Focus -------------------------------------------------------------------

    const elementContainerFocus = {
      ...container?.base?.focus?.[size],
      ...container?.type?.[typeStyle]?.variant?.[variant]?.focus?.[size],
    };

    const elementTextFocus = {
      ...text?.base?.focus?.[size],
      ...text?.type?.[typeStyle]?.variant?.[variant]?.focus?.[size],
    };

    const elementIconLeftFocus = iconType
      ? {
          color: elementTextFocus?.color,
          ...leftIcon?.base?.focus,
          ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]?.focus,
        }
      : {};

    const elementIconRightFocus = iconType
      ? {
          color: elementTextFocus?.color,
          ...rightIcon?.base?.focus,
          ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]
            ?.focus,
        }
      : {};

    // Visited -----------------------------------------------------------------

    const elementContainerVisited = {
      ...container?.base?.visited?.[size],
      ...container?.type?.[typeStyle]?.variant?.[variant]?.visited?.[size],
    };

    const elementTextVisited = {
      ...text?.base?.visited?.[size],
      ...text?.type?.[typeStyle]?.variant?.[variant]?.visited?.[size],
    };

    const elementIconLeftVisited = iconType
      ? {
          color: elementTextVisited?.color,
          ...leftIcon?.base?.visited,
          ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]
            ?.visited,
        }
      : {};

    const elementIconRightVisited = iconType
      ? {
          color: elementTextVisited?.color,
          ...rightIcon?.base?.visited,
          ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]
            ?.visited,
        }
      : {};

    // Disabled

    const elementContainerDisabled = {
      ...container?.base?.disabled?.[size],
      ...container?.type?.[typeStyle]?.variant?.[variant]?.disabled?.[size],
      cursor: 'not-allowed',
    };

    const elementTextDisabled = {
      ...text?.base?.disabled?.[size],
      ...text?.type?.[typeStyle]?.variant?.[variant]?.disabled?.[size],
    };

    const elementIconLeftDisabled = iconType
      ? {
          color: elementTextDisabled?.color,
          ...leftIcon?.base?.disabled,
          ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]
            ?.disabled,
        }
      : {};

    const elementIconRightDisabled = iconType
      ? {
          color: elementTextDisabled?.color,
          ...rightIcon?.base?.disabled,
          ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconType]
            ?.disabled,
        }
      : {};

    return {
      //------------------------------------------------------------------------
      // Container
      //------------------------------------------------------------------------

      '&.button': elementContainer,

      //------------------------------------------------------------------------
      // Left Icon
      //------------------------------------------------------------------------

      '& .button__icon-left': {
        ...elementLeftIcon,

        '& > *': {
          fontSize: 'inherit',
          fill: elementLeftIcon?.color || undefined,
        },
      },

      //------------------------------------------------------------------------
      // Text
      //------------------------------------------------------------------------

      '& .button__text': {
        ...elementText,

        '@media (max-width: 600px)': {
          ...elementText,
        },
      },

      //------------------------------------------------------------------------
      // Right Icon
      //------------------------------------------------------------------------

      '& .button__icon-right': {
        ...elementRightIcon,

        '& > *': {
          fontSize: 'inherit',
          fill: elementRightIcon?.color || undefined,
        },
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
        '.button__icon-right': {
          ...elementIconRightHover,
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
        '.button__icon-right': {
          ...elementIconRightPressed,
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
        '.button__icon-right': {
          ...elementIconRightFocus,
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
        '.button__icon-right': {
          ...elementIconRightVisited,
        },
      },

      // DISABLED
      '&:disabled, &--disabled': {
        ...elementContainerDisabled,
        '.button__text': {
          ...elementTextDisabled,
        },
        '.button__icon-left': {
          ...elementIconLeftDisabled,
        },
        '.button__icon-right': {
          ...elementIconRightDisabled,
        },
      },
    };
  }
);
