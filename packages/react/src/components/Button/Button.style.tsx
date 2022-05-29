import styled from '@emotion/styled';
import { ButtonProps, ButtonSchema } from './Button.types';

const timingFunction = 'ease';
const duration = '0.2s';

export const ButtonStyled = styled.button<
  Pick<ButtonProps, 'width' | 'variant'> & {
    theme?: ButtonSchema;
    typeStyle: ButtonProps['type'];
  }
>(({ theme: { text, container }, width, typeStyle, variant }) => {
  return {
    //--------------------------------------------------------------------------
    // Container
    //--------------------------------------------------------------------------

    '&.button': {
      ...container?.contained?.base,
      ...container?.contained?.variant?.[variant]?.rest,
      cursor: 'pointer',
      border: 'none',
      fontSize: '16px',
      transitionProperty: 'box-shadow, border, background, padding, min-width',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    },

    // OPTION - WIDTH
    width: width === 'block' ? '100%' : 'auto',
    minWidth:
      width === 'min-width' ? container?.contained?.option.widthMin : '0px',

    //--------------------------------------------------------------------------
    // Text
    //--------------------------------------------------------------------------

    '& .button__text': {
      ...text?.[typeStyle]?.base,
      ...text?.[typeStyle]?.variant?.[variant]?.rest,
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
      ...container?.[typeStyle]?.variant?.[variant]?.hover,
      '.button__text': text?.[typeStyle]?.variant?.[variant]?.hover,
    },

    // PRESSED
    '&:active, &.--pressed': {
      ...container?.[typeStyle]?.variant?.[variant]?.pressed,
      '.button__text': text?.[typeStyle]?.variant?.[variant]?.pressed,
    },

    // FOCUS
    '&:focus-visible, &.--focus': {
      ...container?.[typeStyle]?.variant?.[variant]?.focus,
      '.button__text': text?.[typeStyle]?.variant?.[variant]?.focus,
    },

    // VISITED
    '&:visited, &.--visited': {
      ...container?.[typeStyle]?.variant?.[variant]?.visited,
      '.button__text': text?.[typeStyle]?.variant?.[variant]?.visited,
    },

    // DISABLED
    '&:disabled': {
      ...container?.[typeStyle]?.variant?.[variant]?.disabled,
      cursor: 'not-allowed',
      '.button__text': text?.[typeStyle]?.variant?.[variant]?.disabled,
    },
  };
});
