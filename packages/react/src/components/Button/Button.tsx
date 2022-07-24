/* eslint-disable react/button-has-type */
import type { FC, MouseEvent } from 'react';
import { useMemo } from 'react';
import type { ButtonProps, ButtonStyleProps } from './Button.types';
import { useKiskadee } from '../../context';
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
}) => {
  const [schema] = useKiskadee();

  const style: ButtonStyleProps = {
    schema: schema.component.button,
    theme: schema.theme,
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

  const className = ['button'];
  if (interaction) className.push(`--${interaction}`);

  const button = useMemo(
    () => new ButtonStyle(style),
    [
      style.schema,
      style.theme,
      style.size,
      style.typeStyle,
      style.variant,
      style.iconType,
      style.iconRight,
      style.iconLeft,
      style.borderRadius,
      style.textAlign,
      style.width,
    ]
  );

  const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
    const container = event.currentTarget;

    const circle = document.createElement('span');
    const diameter = Math.max(container.clientWidth, container.clientHeight);
    const radius = diameter / 2;
    const { top } = document.body.getBoundingClientRect();

    circle.style.height = `${diameter}px`;
    circle.style.width = `${diameter}px`;
    circle.style.left = `${event.clientX - container.offsetLeft - radius}px`;
    circle.style.top = `${
      event.clientY - container.offsetTop - top - radius
    }px`;

    circle.classList.add(button.container.ripple!);

    const ripple = container.querySelectorAll(
      `.${button.container.ripple!}`
    )[0];

    if (ripple) {
      ripple.remove();
    }

    container.append(circle);
  };

  console.log('rerender');

  return (
    <button
      className={[
        ...className,
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
      onClick={(event) => {
        createRipple(event);
        onClick?.();
      }}
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
            button.text.fontSize,
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
