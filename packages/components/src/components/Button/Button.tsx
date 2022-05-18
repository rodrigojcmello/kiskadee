import type { FC } from 'react';
import { styled } from '@stitches/react';
import type { ButtonProps } from './types';

const materialTheme = {
  container: {
    rest: {
      backgroundColor: '#6750A4',
      padding: '10px 24px',
      border: 'none',
      borderRadius: '100px',
    },
    hover: {
      backgroundColor: '#735EAB',
      boxShadow:
        '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
    },
  },
  text: {
    rest: {
      fontSize: '0.875rem',
      color: '#FFFFFF',
      height: '20px',
      lineHeight: '20px',
      fontWeight: 500,
      fontFamily: 'Roboto',
      fontStyle: 'normal',
    },
    hover: {
      color: '#FFFFFF',
    },
  },
};

const fluentTheme = {
  container: {
    rest: {
      backgroundColor: '#005FB8',
      padding: '6px 20px',
      border: 'none',
      borderRadius: '4px',
    },
    hover: {
      backgroundColor: '#106EBE',
      boxShadow:
        '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
    },
  },
  text: {
    rest: {
      fontSize: '0.875rem',
      color: '#FFFFFF',
      height: '20px',
      lineHeight: '20px',
      fontWeight: 600,
      fontFamily: 'Segoe UI',
      fontStyle: 'normal',
    },
    hover: {
      color: '#FFFFFF',
    },
  },
};

const timingFunction = 'ease';
const duration = '0.2s';

const currentTheme = fluentTheme;

const Container = styled('button', {
  //----------------------------------------------------------------------------
  // Container
  //----------------------------------------------------------------------------

  // REST

  ...currentTheme.container.rest,

  // HOVER

  '&:hover': {
    ...currentTheme.container.hover,
    '& .text': {
      ...currentTheme.text.hover,
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
    ...currentTheme.text.rest,
    transitionProperty: 'color',
    transitionDuration: duration,
    transitionTimingFunction: timingFunction,
  },

  // HOVER

  '&:hover .text': {
    ...currentTheme.text.hover,
  },
});

const Button: FC<ButtonProps> = ({
  text,
  type = 'button',
  // icon,
  onClick,
  // variant,
  disabled,
}) => {
  return (
    <Container type={type} onClick={onClick} disabled={disabled}>
      {/* <span>+</span> */}
      <span className="text">{text}</span>
    </Container>
  );
};

export default Button;
