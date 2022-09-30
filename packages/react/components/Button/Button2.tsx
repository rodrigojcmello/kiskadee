/* eslint-disable react/button-has-type */
import type { FC, MouseEvent } from 'react';
import { useMemo } from 'react';
import type { ButtonProps, ButtonStyleProps } from './Button.types';
import { useKiskadee } from '../../schema';
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
  isLoading,
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

  const button = useMemo(() => {
    console.log('useMemo');
    return new ButtonStyle(style);
  }, []);

  const buttonContainer = button.container();
  const buttonText = button.text();
  const buttonIcon = button.icon();
  const buttonIconLeft = button.iconLeft();
  const buttonIconRight = button.iconRight();
  const buttonCommon = button.common();

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

  console.log('rerender');

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
        onClick?.(event);
      }}
      disabled={isLoading || disabled}
    >
      hello
      {/* <span style={{ opacity: isLoading ? 0 : 1, display: 'flex' }}> */}
      {/*  /!*{iconLeft && (*!/ */}
      {/*  /!*  <div*!/ */}
      {/*  /!*    className={[*!/ */}
      {/*  /!*      'button__icon-left',*!/ */}
      {/*  /!*      buttonIcon.base,*!/ */}
      {/*  /!*      buttonIconLeft.color,*!/ */}
      {/*  /!*      buttonIconLeft.size,*!/ */}
      {/*  /!*      buttonIconLeft.padding,*!/ */}
      {/*  /!*      buttonCommon.transition,*!/ */}
      {/*  /!*    ]*!/ */}
      {/*  /!*      .join(' ')*!/ */}
      {/*  /!*      .trim()}*!/ */}
      {/*  /!*  >*!/ */}
      {/*  /!*    {iconLeft}*!/ */}
      {/*  /!*  </div>*!/ */}
      {/*  /!*)}*!/ */}
      {/*  /!*{label && (*!/ */}
      {/*  /!*  <span*!/ */}
      {/*  /!*    className={[*!/ */}
      {/*  /!*      'button__text',*!/ */}
      {/*  /!*      buttonText.core,*!/ */}
      {/*  /!*      buttonText.base,*!/ */}
      {/*  /!*      buttonText.color,*!/ */}
      {/*  /!*      buttonText.padding,*!/ */}
      {/*  /!*      buttonText.fontSize,*!/ */}
      {/*  /!*      buttonText.width,*!/ */}
      {/*  /!*      buttonText.align,*!/ */}
      {/*  /!*      buttonCommon.transition,*!/ */}
      {/*  /!*    ]*!/ */}
      {/*  /!*      .join(' ')*!/ */}
      {/*  /!*      .trim()}*!/ */}
      {/*  /!*  >*!/ */}
      {/*  /!*    {label}*!/ */}
      {/*  /!*  </span>*!/ */}
      {/*  /!*)}*!/ */}
      {/*  /!*{iconRight && (*!/ */}
      {/*  /!*  <div*!/ */}
      {/*  /!*    className={[*!/ */}
      {/*  /!*      'button__icon-right',*!/ */}
      {/*  /!*      buttonIcon.base,*!/ */}
      {/*  /!*      buttonIconRight.color,*!/ */}
      {/*  /!*      buttonIconRight.size,*!/ */}
      {/*  /!*      buttonIconRight.padding,*!/ */}
      {/*  /!*      buttonCommon.transition,*!/ */}
      {/*  /!*    ]*!/ */}
      {/*  /!*      .join(' ')*!/ */}
      {/*  /!*      .trim()}*!/ */}
      {/*  /!*  >*!/ */}
      {/*  /!*    {iconRight}*!/ */}
      {/*  /!*  </div>*!/ */}
      {/*  /!*)}*!/ */}
      {/* </span> */}
      {/* {isLoading && <EllipsisLoader />} */}
    </button>
  );
};
