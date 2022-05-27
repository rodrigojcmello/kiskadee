import styled from '@emotion/styled';
import type { FC } from 'react';
import { useContext } from 'react';
import type { ButtonSchema, ButtonProps } from './Button.types';
import { KiskadeeContext } from '../../context';

const timingFunction = 'ease';
const duration = '0.2s';

const ButtonStyle = styled.button<
  Pick<ButtonProps, 'width' | 'variant'> & {
    theme?: ButtonSchema;
    typeStyle: ButtonProps['type'];
  }
>(({ theme, width, typeStyle, variant }) => {
  return {
    //--------------------------------------------------------------------------
    // Container
    //--------------------------------------------------------------------------
    '&.button': {
      ...theme.container?.[typeStyle]?.[variant]?.rest,
      cursor: 'pointer',
      border: 'none',
      fontSize: '16px',
      transitionProperty: 'box-shadow, border, background, padding, text-align',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    },

    // OPTION - WIDTH
    ...(width === 'block' ? { width: '100%' } : {}),

    //--------------------------------------------------------------------------
    // Text
    //--------------------------------------------------------------------------

    '& .button__text': {
      ...theme.text?.[typeStyle]?.[variant]?.rest,
      transitionProperty: 'color, font-size',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    },

    //--------------------------------------------------------------------------
    // INTERACTION
    //--------------------------------------------------------------------------

    // HOVER
    '&:hover, &.--hover': {
      ...theme.container?.[typeStyle]?.[variant]?.hover,
      '.button__text': theme.text?.[typeStyle]?.[variant]?.hover,
    },

    // PRESSED
    '&:active, &.--pressed': {
      ...theme.container?.[typeStyle]?.[variant]?.pressed,
      '.button__text': theme.text?.[typeStyle]?.[variant]?.pressed,
    },

    // FOCUS
    '&:focus-visible, &.--focus': {
      ...theme.container?.[typeStyle]?.[variant]?.focus,
      '.button__text': theme.text?.[typeStyle]?.[variant]?.focus,
    },

    // VISITED
    '&:visited, &.--visited': {
      ...theme.container?.[typeStyle]?.[variant]?.visited,
      '.button__text': theme.text?.[typeStyle]?.[variant]?.visited,
    },

    // DISABLED
    '&:disabled': {
      ...theme.container?.[typeStyle]?.[variant]?.disabled,
      cursor: 'not-allowed',
      '.button__text': theme.text?.[typeStyle]?.[variant]?.disabled,
    },
  };
});

export const Button: FC<ButtonProps> = ({
  text,
  typeHTML = 'button',
  interaction,
  type,
  variant,
  // icon,
  onClick,
  width = 'auto',
  disabled,
  // variant,
}) => {
  const [theme] = useContext(KiskadeeContext);

  const classeName = ['button'];
  if (interaction) classeName.push(`--${interaction}`);

  return (
    <ButtonStyle
      type={typeHTML}
      onClick={onClick}
      theme={theme.component.button}
      className={classeName.join(' ').trim()}
      // Options
      width={width}
      variant={variant}
      typeStyle={type}
      disabled={disabled}
    >
      <span className="button__text">{text}</span>
    </ButtonStyle>
  );
};
