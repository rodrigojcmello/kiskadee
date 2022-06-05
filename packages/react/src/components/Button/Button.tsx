import type { FC } from 'react';
import { useContext } from 'react';
import type { ButtonProps } from './Button.types';
import { KiskadeeContext } from '../../context';
import { ButtonStyled } from './Button.style';

export const Button: FC<ButtonProps> = ({
  text,
  typeHTML = 'button',
  interaction,
  type,
  variant,
  borderRadius = 'default',
  textAlign,
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
    <ButtonStyled
      type={typeHTML}
      onClick={onClick}
      theme={theme.component.button}
      className={classeName.join(' ').trim()}
      // Options
      borderRadius={borderRadius}
      textAlign={textAlign}
      width={width}
      variant={variant}
      typeStyle={type}
      disabled={disabled}
    >
      <span className="button__text">{text}</span>
    </ButtonStyled>
  );
};
