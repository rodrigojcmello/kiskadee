import styled from '@emotion/styled';
import type { FC } from 'react';
import { useContext } from 'react';
import type { ButtonSchema, ButtonProps } from './Button.types';
import { KiskadeeContext } from '../../context';

const timingFunction = 'ease';
const duration = '0.2s';

const ButtonStyle = styled.button<
  Pick<ButtonProps, 'width'> & {
    theme?: ButtonSchema;
  }
>(({ theme, width }) => {
  return {
    //--------------------------------------------------------------------------
    // Container
    //--------------------------------------------------------------------------

    // REST
    '&.button': {
      ...theme.container?.rest,
      cursor: 'pointer',
      border: 'none',
      fontSize: '16px',
      transitionProperty: 'box-shadow, border, background, padding',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    },

    // OPTION - WIDTH
    ...(width === 'block' ? { width: '100%' } : {}),

    //--------------------------------------------------------------------------
    // Interaction
    //--------------------------------------------------------------------------

    // HOVER
    '&:hover, &.--hover': theme.container?.hover as never,

    // PRESSED
    '&:active, &.--pressed': {
      ...theme.container?.pressed,
      outline: 'none !important',
    },

    // FOCUS
    '&:focus, &.--focus': theme.container?.focus as never,

    // VISITED
    '&:visited, &.--visited': theme.container?.visited as never,

    //--------------------------------------------------------------------------
    // Text
    //--------------------------------------------------------------------------

    // REST
    '& .button__text': {
      ...theme.text?.rest,
      transitionProperty: 'color, font-size',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    },

    // HOVER
    '&:hover .button__text, .--hover .button__text': theme.text?.hover as never,

    // PRESSED
    '&:active .button__text, &.--pressed .button__text': theme.text
      ?.pressed as never,

    // FOCUS
    '&:focus .button__text, &.--focus .button__text': theme.text
      ?.focus as never,

    // VISITED
    '&:visited .button__text, &.--visited .button__text': theme.text
      ?.visited as never,
  };
});

export const Button: FC<ButtonProps> = ({
  text,
  typeHTML = 'button',
  interaction,
  // icon,
  onClick,
  width = 'auto',
  // variant,
  disabled,
}) => {
  const [theme] = useContext(KiskadeeContext);

  return (
    <ButtonStyle
      type={typeHTML}
      onClick={(event) => {
        event.currentTarget.blur();
        onClick();
      }}
      theme={theme.component.button}
      className={['button', interaction ? `--${interaction}` : '']
        .join(' ')
        .trim()}
      // Options
      width={width}
      disabled={disabled}
    >
      <span className="button__text">{text}</span>
    </ButtonStyle>
  );
};
