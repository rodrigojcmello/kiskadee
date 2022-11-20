/* eslint-disable react/button-has-type */
import type { FC, MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { ButtonProps, ButtonStyleProps } from './Button.types';
import { useKiskadee } from '../../schema';
import { ButtonClass } from './Button.class';
import { EllipsisLoader } from '../Loader';

export const Button: FC<ButtonProps> = ({
  // TODO: where default come from?
  iconType = 'Attached',
  width = 'auto',
  borderRadius,
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
  isLoading,
}) => {
  const [schema] = useKiskadee();
  const [isPressed, setIsPressed] = useState(false);

  const style: ButtonStyleProps = {
    theme: {
      name: schema.name,
      version: schema.version,
      author: schema.author,
      option: schema.theme,
    },
    component: 'button',
    schema: schema.component.button,
    size,
    type,
    variant,
    iconType: !label ? 'Alone' : iconType,
    iconRight,
    iconLeft,
    borderRadius,
    textAlign,
    width,
  };

  const className = ['button'];
  if (interaction) className.push(`--${interaction}`);
  if (interaction !== 'pressed' && isPressed) className.push('--pressed');

  const button = useMemo(() => {
    return new ButtonClass(style);
  }, [style]);

  const buttonContainer = button.elementContainer();
  const buttonText = button.elementText();
  const buttonIcon = button.elementIcon();
  const buttonIconLeft = button.elementIconLeft();
  const buttonIconRight = button.elementIconRight();
  const buttonCommon = button.common();

  // TODO: how disable ripple effect?
  const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
    const container = event.currentTarget;

    const circle = document.createElement('span');
    const diameter = Math.max(container.clientWidth, container.clientHeight);
    const radius = diameter / 2;

    circle.style.height = `${diameter}px`;
    circle.style.width = `${diameter}px`;
    circle.style.left = '0px';
    circle.style.top = `${container.clientHeight / 2 - radius}px`;

    circle.classList.add(buttonContainer.rippleCore!);
    circle.classList.add(buttonContainer.rippleBackground!);

    const ripple = container.querySelector(`.${buttonContainer.rippleCore!}`);

    if (ripple) {
      ripple.remove();
    }

    container.append(circle);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPressed) {
      timer = setTimeout(() => {
        setIsPressed(false);
        // TODO: create a constant for this timer
      }, 150);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [isPressed]);

  console.log('----------------------------------------------------- rerender');

  // TODO: support link ("a" tag)
  return (
    <button
      data-test-id={'k-button'}
      className={[
        ...className,
        buttonContainer.width,
        buttonContainer.radius,
        buttonContainer.border,
        buttonContainer.background,
        buttonContainer.base,
        buttonContainer.core,
        buttonCommon.transition,
      ]
        .join(' ')
        .trim()}
      type={typeHTML}
      onClick={(event) => {
        createRipple(event);
        setIsPressed(true);
        onClick?.(event);
      }}
      disabled={isLoading || disabled}
    >
      {/* <span style={{ opacity: isLoading ? 0 : 1, display: 'flex' }}> */}
      {iconLeft && (
        <div
          className={[
            'button__icon-left',
            buttonIcon.base,
            buttonIconLeft.color,
            buttonIconLeft.background,
            buttonIconLeft.border,
            buttonIconLeft.size,
            buttonIconLeft.padding,
            buttonIconLeft.margin,
            buttonIconLeft.radius,
            buttonCommon.transition,
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
            buttonText.core,
            buttonText.base,
            buttonText.color,
            buttonText.padding,
            buttonText.fontSize,
            buttonText.width,
            buttonText.align,
            buttonCommon.transition,
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
            buttonIcon.base,
            buttonIconRight.color,
            buttonIconRight.background,
            buttonIconRight.border,
            buttonIconRight.size,
            buttonIconRight.padding,
            buttonIconRight.margin,
            buttonIconRight.radius,
            buttonCommon.transition,
          ]
            .join(' ')
            .trim()}
        >
          {iconRight}
        </div>
      )}
      {/* </span> */}
      {isLoading && <EllipsisLoader />}
    </button>
  );
};
