import styled from '@emotion/styled';
import type { CSSProperties } from 'react';
import type { ButtonProps, ButtonSchema } from './Button.types';

const timingFunction = 'ease';
const duration = '0.2s';

export const ButtonStyled = styled.button<
  Pick<
    ButtonProps,
    | 'width'
    | 'variant'
    | 'textAlign'
    | 'iconLeft'
    | 'iconLeftType'
    | 'iconRight'
    | 'iconRightType'
  > & {
    theme?: ButtonSchema;
    typeStyle: ButtonProps['type'];
    borderRadius: Exclude<ButtonProps['borderRadius'], undefined>;
  }
>(
  ({
    theme: { text, container, leftIcon, rightIcon },
    width,
    typeStyle,
    variant,
    borderRadius,
    textAlign,
    iconLeft,
    iconLeftType,
    iconRight,
    iconRightType,
  }) => {
    const option = container?.option;

    const elementContainer = {
      // Reset
      border: 'none',
      padding: 0,

      // Custom
      ...container?.base?.rest,
      ...container?.type?.[typeStyle]?.base,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.rest,

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

    const elementText = {
      // Custom
      ...text?.base?.rest,
      ...text?.type?.[typeStyle]?.base,
      ...text?.type?.[typeStyle]?.variant?.[variant]?.rest,

      // Base
      width:
        iconLeftType === 'detached' ||
        iconRightType === 'detached' ||
        !(iconLeft || iconRight)
          ? '100%'
          : 'auto',
      whiteSpace: 'nowrap',
      transitionProperty: 'color, font-size, padding',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    } as unknown as CSSProperties;

    const elementLeftIcon = iconLeftType && {
      color: elementText.color,
      ...leftIcon?.base?.rest,
      ...leftIcon?.type?.[typeStyle]?.base,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconLeftType]?.rest,

      display: 'flex',
      transitionProperty: 'color, font-size',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    };

    const elementRightIcon = iconRightType && {
      color: elementText.color,
      ...rightIcon?.base?.rest,
      ...rightIcon?.type?.[typeStyle]?.base,
      ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconRightType]
        ?.rest,
      display: 'flex',
      transitionProperty: 'color, font-size',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    };

    // Hover -------------------------------------------------------------------

    const elementContainerHover = {
      ...container?.base?.hover,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.hover,
    };

    const elementTextHover = {
      ...text?.base?.hover,
      ...text?.type?.[typeStyle]?.variant?.[variant]?.hover,
    };

    const elementIconLeftHover = iconLeftType && {
      color: elementTextHover?.color,
      ...leftIcon?.base?.hover,
      ...leftIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconLeftType]?.hover,
    };

    const elementIconRightHover = iconRightType && {
      color: elementTextHover?.color,
      ...rightIcon?.base?.hover,
      ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconRightType]
        ?.hover,
    };

    // Pressed -----------------------------------------------------------------

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

    const elementIconRightPressed = iconRightType && {
      color: elementTextPressed?.color,
      ...rightIcon?.base?.pressed,
      ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconRightType]
        ?.pressed,
    };

    // Focus -------------------------------------------------------------------

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

    const elementIconRightFocus = iconRightType && {
      color: elementTextFocus?.color,
      ...rightIcon?.base?.focus,
      ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconRightType]
        ?.focus,
    };

    // Visited -----------------------------------------------------------------

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

    const elementIconRightVisited = iconRightType && {
      color: elementTextVisited?.color,
      ...rightIcon?.base?.visited,
      ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconRightType]
        ?.visited,
    };

    // Disabled

    const elementContainerDisabled = {
      ...container?.base?.disabled,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.disabled,
      cursor: 'not-allowed',
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

    const elementIconRightDisabled = iconRightType && {
      color: elementTextDisabled?.color,
      ...rightIcon?.base?.disabled,
      ...rightIcon?.type?.[typeStyle]?.variant?.[variant]?.[iconRightType]
        ?.disabled,
    };

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
        paddingLeft: iconLeft ? 0 : elementText?.paddingLeft,
        paddingRight: iconRight ? 0 : elementText?.paddingRight,
      },

      //------------------------------------------------------------------------
      // Right Icon
      //------------------------------------------------------------------------

      '& .button__icon-right': {
        ...elementRightIcon,

        '& > *': {
          fontSize: 'inherit',
          fill: elementLeftIcon?.color || undefined,
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
