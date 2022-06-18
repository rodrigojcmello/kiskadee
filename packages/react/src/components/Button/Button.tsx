import type { FC } from 'react';
import { useContext, useMemo } from 'react';
import type { ButtonProps } from './Button.types';
import { KiskadeeContext } from '../../context';
import { ButtonStyled, elementText } from './Button.style';
import { ElementContainer } from './elements/01_container';

export const ButtonOld: FC<ButtonProps> = ({
  text,
  typeHTML = 'button',
  interaction,
  type,
  variant,
  borderRadius = 'default',
  textAlign,
  onClick,
  width = 'auto',
  disabled,
  iconLeft,
  iconType,
  iconRight,
  size = 'md',
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
      iconLeft={iconLeft}
      iconRight={iconRight}
      iconType={iconType}
      size={size}
    >
      {iconLeft && <div className="button__icon-left">{iconLeft}</div>}
      <div className="button__text">{text}</div>
      {iconRight && <span className="button__icon-right">{iconRight}</span>}
    </ButtonStyled>
  );
};

export const Button: FC<ButtonProps> = ({
  text,
  typeHTML = 'button',
  interaction,
  type,
  variant,
  borderRadius = 'default',
  textAlign,
  onClick,
  width = 'auto',
  disabled,
  iconLeft,
  iconType,
  iconRight,
  size = 'md',
}) => {
  const [theme] = useContext(KiskadeeContext);

  const style = {
    theme: theme.component.button,
    size,
    typeStyle: type,
    variant,
    iconType,
    iconRight,
    iconLeft,
    borderRadius,
    textAlign,
    width,
  };

  const classeName = ['button'];
  if (interaction) classeName.push(`--${interaction}`);

  const styleButton = useMemo(() => new ElementContainer(style), [style]);

  return (
    <button
      className={[
        ...classeName,
        styleButton.width(),
        styleButton.radius(),
        styleButton.textAlign(),
        styleButton.border(),
        styleButton.background(),
        styleButton.core(),
        styleButton.base(),
      ]
        .join(' ')
        .trim()}
      type="button"
      onClick={onClick}
    >
      <span className={`button__text ${elementText(style)}`}>Button</span>
    </button>
  );
};
