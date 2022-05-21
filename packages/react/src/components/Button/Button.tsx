import styled from '@emotion/styled';
import type { FC } from 'react';
import { useContext } from 'react';
import type { ButtonStyle, ButtonProps } from './Button.types';
import { KiskadeeContext } from '../../context';

const timingFunction = 'ease';
const duration = '0.2s';

const Container = styled.button<
  Pick<ButtonProps, 'width'> & { theme?: ButtonStyle }
>(({ theme, width }) => {
  const borderColor = theme.container?.rest?.borderColor;
  const borderWidth = theme.container?.rest?.borderWidth;
  const containerRest = { ...theme.container?.rest };
  delete containerRest.borderColor;
  delete containerRest.borderWidth;

  return {
    //----------------------------------------------------------------------------
    // Container
    //----------------------------------------------------------------------------

    // REST
    ...containerRest,

    position: 'relative',
    '&::before': borderColor && {
      content: '""',
      position: 'absolute',
      inset: 0,
      padding: borderWidth,
      background: borderColor,
      borderRadius: 'inherit',
      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      '-webkit-mask-composite': 'xor',
      maskComposite: 'exclude',
    },

    // WIDTH
    ...(width === 'block' ? { width: '100%' } : {}),

    // HOVER
    '&:hover, &.hover': {
      ...theme.container?.hover,
      '& .text': {
        ...theme.text?.hover,
      },
    },

    // FOCUS
    '&:focus, &.focus': {
      ...theme.container?.focus,
      '& .text': {
        ...theme.text?.focus,
      },
    },

    // PRESSED
    '&.pressed': {
      ...theme.container?.pressed,
      '& .text': {
        ...theme.text?.pressed,
      },
    },

    // VISITED
    '&:visited, &.visited': {
      ...theme.container?.visited,
      '& .text': {
        ...theme.text?.visited,
      },
    },

    // DEFAULT
    cursor: 'pointer',
    border: 'none',
    transitionProperty: 'background, box-shadow, border-radius, padding',
    transitionDuration: duration,
    transitionTimingFunction: timingFunction,
    fontSize: '16px',

    //----------------------------------------------------------------------------
    // Text
    //----------------------------------------------------------------------------

    // REST
    '& .text': {
      ...theme.text?.rest,
      transitionProperty: 'color, font-size',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    },

    // HOVER
    '&:hover .text, .hover .text': {
      ...theme.text?.hover,
    },
  };
});

export const Button: FC<ButtonProps> = ({
  text,
  typeHTML = 'button',
  hover,
  focus,
  pressed,
  visited,
  // icon,
  onClick,
  width = 'auto',
  // variant,
  disabled,
}) => {
  const [theme] = useContext(KiskadeeContext);

  const className: string[] = [];
  if (hover) className.push('hover');
  if (focus) className.push('focus');
  if (pressed) className.push('pressed');
  if (visited) className.push('visited');

  return (
    <Container
      theme={theme.component.button}
      type={typeHTML}
      onClick={onClick}
      disabled={disabled}
      className={className.join(' ')}
      width={width}
    >
      {/* <span>+</span> */}
      <span className="text">{text}</span>
    </Container>
  );
};
