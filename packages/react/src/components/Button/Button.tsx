import type { FC } from 'react';
import { useContext, useMemo } from 'react';
import type { ButtonProps } from './Button.types';
import { KiskadeeContext } from '../../context';
import { ButtonStyled } from './Button.style';
import { ButtonStyle } from './Button.class';

export const ButtonOld: FC<ButtonProps> = ({
  label,
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
      <div className="button__text">{label}</div>
      {iconRight && <span className="button__icon-right">{iconRight}</span>}
    </ButtonStyled>
  );
};

export const Button: FC<ButtonProps> = ({
  label,
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

  const button = useMemo(() => new ButtonStyle(style), [style]);

  return (
    <button
      className={[
        ...classeName,
        button.container.width,
        button.container.radius,
        button.container.textAlign,
        button.container.border,
        button.container.background,
        button.container.base,
        button.container.core,
        button.common.transition,
      ]
        .join(' ')
        .trim()}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {iconLeft && (
        <div
          className={[
            'button__icon-left',
            button.icon.base,
            button.iconLeft.color,
            button.iconLeft.size,
            button.iconLeft.padding,
            button.common.transition,
          ]
            .join(' ')
            .trim()}
        >
          {iconLeft}
        </div>
      )}
      <span
        className={[
          'button__text',
          button.text.core,
          button.text.base,
          button.text.color,
          button.text.padding,
          button.text.width,
          button.common.transition,
        ]
          .join(' ')
          .trim()}
      >
        {label}
      </span>
      {iconRight && (
        <div
          className={[
            'button__icon-right',
            button.icon.base,
            button.iconRight.color,
            button.iconRight.size,
            button.iconRight.padding,
            button.common.transition,
          ]
            .join(' ')
            .trim()}
        >
          {iconRight}
        </div>
      )}
    </button>
  );
};
