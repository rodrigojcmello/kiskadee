import styled from '@emotion/styled';
import type { ButtonProps, ButtonSchema } from './Button.types';

const timingFunction = 'ease';
const duration = '0.2s';

export const ButtonStyled = styled.button<
  Pick<ButtonProps, 'width' | 'variant' | 'textAlign'> & {
    theme?: ButtonSchema;
    typeStyle: ButtonProps['type'];
    borderRadius: Exclude<ButtonProps['borderRadius'], undefined>;
  }
>(
  ({
    theme: { text, container },
    width,
    typeStyle,
    variant,
    borderRadius,
    textAlign,
  }) => {
    const containerStyle = {
      ...container?.base?.rest,
      ...container?.type?.[typeStyle]?.base,
      ...container?.type?.[typeStyle]?.variant?.[variant]?.rest,
    };

    const option = container?.option;

    return {
      //--------------------------------------------------------------------------
      // Container
      //--------------------------------------------------------------------------

      '&.button': {
        // Reset
        border: 'none',

        // Style
        ...containerStyle,

        // Default
        cursor: 'pointer',
        fontSize: '16px',
        transitionProperty:
          'box-shadow, border-color, background, padding, min-width',
        transitionDuration: duration,
        transitionTimingFunction: timingFunction,

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

      //--------------------------------------------------------------------------
      // Text
      //--------------------------------------------------------------------------

      '& .button__text': {
        ...text?.base?.rest,
        ...text?.type?.[typeStyle]?.base,
        ...text?.type?.[typeStyle]?.variant?.[variant]?.rest,
        whiteSpace: 'nowrap',
        transitionProperty: 'color, font-size',
        transitionDuration: duration,
        transitionTimingFunction: timingFunction,
      },

      //--------------------------------------------------------------------------
      // INTERACTION
      //--------------------------------------------------------------------------

      // HOVER
      '&:hover, &.--hover': {
        ...container?.base?.hover,
        ...container?.type?.[typeStyle]?.variant?.[variant]?.hover,
        '.button__text': {
          ...text?.base?.hover,
          ...text?.type?.[typeStyle]?.variant?.[variant]?.hover,
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
