/* eslint-disable react/button-has-type */
import type { FC } from 'react';
import { useContext, useMemo } from 'react';
import type { ButtonProps, ButtonStyleProps } from './Button.types';
import { KiskadeeContext } from '../../context';
import { ButtonStyle } from './Button.style';

export const Button: FC<ButtonProps> = ({
  iconType = 'attached',
  width = 'auto',
  borderRadius = 'default',
  size,
  label,
  interaction,
  type,
  variant,
  textAlign,
  onClick,
  disabled,
  iconLeft,
  iconRight,
  typeHTML = 'button',
  dark,
}) => {
  const [theme] = useContext(KiskadeeContext);

  const style = {
    theme: theme.component.button,
    size,
    typeStyle: type,
    variant,
    iconType: (!label ? 'icon' : iconType) as ButtonStyleProps['iconType'],
    iconRight,
    iconLeft,
    borderRadius,
    textAlign,
    width,
  };

  const classeName = ['button'];
  if (interaction) classeName.push(`--${interaction}`);
  if (dark) classeName.push('--dark');

  const button = useMemo(() => new ButtonStyle(style), [style]);

  return (
    <button
      className={[
        ...classeName,
        button.container.width,
        button.container.radius,
        button.container.border,
        button.container.background,
        button.container.base,
        button.container.core,
        button.common.transition,
      ]
        .join(' ')
        .trim()}
      type={typeHTML}
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
      {label && (
        <span
          className={[
            'button__text',
            button.text.core,
            button.text.base,
            button.text.color,
            button.text.padding,
            button.text.width,
            button.text.align,
            button.common.transition,
          ]
            .join(' ')
            .trim()}
        >
          {label}
        </span>
      )}
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
