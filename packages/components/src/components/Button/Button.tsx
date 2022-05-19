import styled from '@emotion/styled';
import type { FC } from 'react';
import { useContext } from 'react';
import type { ButtonProps, ButtonStyle } from './Button.types';
import { KiskadeeContext } from '../../context';

const timingFunction = 'ease';
const duration = '0.2s';

const Container = styled.button<{ theme?: ButtonStyle }>(({ theme }) => ({
  //----------------------------------------------------------------------------
  // Container
  //----------------------------------------------------------------------------

  // REST

  ...theme.container?.rest,

  // HOVER

  '&:hover, &.hover': {
    ...theme.container?.hover,
    '& .text': {
      ...theme.text?.hover,
    },
  },

  // DEFAULT

  cursor: 'pointer',
  transitionProperty: 'background, box-shadow',
  transitionDuration: duration,
  transitionTimingFunction: timingFunction,
  fontSize: '16px',

  //----------------------------------------------------------------------------
  // Text
  //----------------------------------------------------------------------------

  // REST

  '& .text': {
    ...theme.text?.rest,
    transitionProperty: 'color',
    transitionDuration: duration,
    transitionTimingFunction: timingFunction,
  },

  // HOVER

  '&:hover .text, .hover .text': {
    ...theme.text?.hover,
  },
}));

const Button: FC<ButtonProps> = ({
  text,
  typeHTML = 'button',
  // icon,
  onClick,
  // variant,
  disabled,
}) => {
  const theme = useContext(KiskadeeContext);

  return (
    <Container
      theme={theme.component.button}
      type={typeHTML}
      onClick={onClick}
      disabled={disabled}
    >
      {/* <span>+</span> */}
      <span className="text">{text}</span>
    </Container>
  );
};

export default Button;
