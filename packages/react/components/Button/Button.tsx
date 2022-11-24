/* eslint-disable react/button-has-type */
import type { FC, MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { ButtonProps, ButtonStyleProps } from './Button.types';
import { useKiskadee } from '../../schema';
import { ButtonClass } from './Button.class';
import { EllipsisLoader } from '../Loader';
import { CLICK_MIN_DURATION, CLICK_TRANSITION_DURATION } from './constants';

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
  const [afterPressed, setAfterPressed] = useState(false);

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
  const buttonContainerWrapper = button.elementContainerWrapper();
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

  /**
   * The complete animation requires the user to hold the mouse button for a
   * few moments, with this implementation we were able to keep an animation
   * with minimum duration thus improving the animation and button response
   * experience
   */
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPressed) {
      timer = setTimeout(() => {
        setIsPressed(false);
        setAfterPressed(true);
      }, CLICK_MIN_DURATION);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [isPressed]);

  /**
   * We have an animation for the active state, but we can't keep it after
   * the active state is lost. Added a new style class to maintain animation
   * consistency after click
   */
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (afterPressed) {
      timer = setTimeout(() => {
        setAfterPressed(false);
      }, CLICK_TRANSITION_DURATION);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [afterPressed]);

  console.log('----------------------------------------------------- rerender');

  // TODO: support link ("a" tag)
  return (
    <button
      data-test-id={'k-button'}
      className={[
        ...className,
        buttonContainer.width,
        buttonContainer.radius,
        buttonContainer.base,

        /**
         *   This layer needs a background due to this ancient bug
         *   @see {@link https://bugs.chromium.org/p/chromium/issues/detail?id=157102}
         */
        buttonContainerWrapper.background,
        buttonContainer.core,
        buttonCommon.transition,
        afterPressed ? buttonContainer.transitionAfterPressed : '',
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
      {/* This extra layer is only for the Ripple effect to be over the
       border */}
      <span
        className={[
          'button__container-wrapper',
          buttonContainerWrapper.base,
          buttonContainerWrapper.background,
          buttonContainerWrapper.border,
          buttonCommon.transition,
        ].join(' ')}
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
      </span>
    </button>
  );
};
