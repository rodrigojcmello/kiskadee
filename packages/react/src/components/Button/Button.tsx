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
    // Text
    //--------------------------------------------------------------------------

    '& .button__text': {
      ...theme.text?.rest,
      transitionProperty: 'color, font-size',
      transitionDuration: duration,
      transitionTimingFunction: timingFunction,
    },

    //--------------------------------------------------------------------------
    // INTERACTION
    //--------------------------------------------------------------------------

    // HOVER
    '&:hover, &.--hover': {
      ...theme.container?.hover,
      '.button__text': theme.text?.hover,
    },

    // PRESSED
    '&:active, &.--pressed': {
      ...theme.container?.pressed,
      '.button__text': theme.text?.pressed,
    },

    // FOCUS
    '&:focus-visible, &.--focus': {
      ...theme.container?.focus,
      '.button__text': theme.text?.focus,
    },

    // VISITED
    '&:visited, &.--visited': {
      ...theme.container?.visited,
      '.button__text': theme.text?.visited,
    },

    //--------------------------------------------------------------------------
    // VALIDATION
    //--------------------------------------------------------------------------

    // DISABLED
    '&:disabled': {
      ...theme.container?.disabled,
      cursor: 'not-allowed',
      '.button__text': theme.text?.disabled,
    },

    // SUCCESS
    '&.--success': {
      ...theme.container?.success,
    },

    // WARNING
    '&.--warning': {
      ...theme.container?.warning,
    },

    // DANGER
    '&.--danger': {
      ...theme.container?.danger,
    },
  };
});

export const Button: FC<ButtonProps> = ({
  text,
  typeHTML = 'button',
  interaction,
  validation,
  // icon,
  onClick,
  width = 'auto',
  // variant,
}) => {
  const [theme] = useContext(KiskadeeContext);

  return (
    <ButtonStyle
      type={typeHTML}
      onClick={onClick}
      theme={theme.component.button}
      className={[
        'button',
        interaction ? `--${interaction}` : '',
        validation ? `--${validation}` : '',
      ]
        .join(' ')
        .trim()}
      // Options
      width={width}
      disabled={validation === 'disabled'}
    >
      <span className="button__text">{text}</span>
    </ButtonStyle>
  );
};
