import type { ButtonProps as HeadlessButtonProps } from '@kiskadee/react-headless';
import { Button as HeadlessButton } from '@kiskadee/react-headless';
import type { MouseEvent } from 'react';
import { memo, useCallback, useMemo } from 'react';
import type { ButtonProps } from './Button.types.ts';
import {
  resolveButtonAccessibilityFromCommon,
  useButtonClassNamesFromCommon,
  useButtonCommonProps,
  useTransientPressedState
} from './useButtonBase';

function ButtonCore(props: ButtonProps) {
  const common = useButtonCommonProps(props);
  const { controlState, tabIndex, label, pressedDurationMs, onClick, restProps } = common;
  const baseClassNames = useButtonClassNamesFromCommon(common);

  const { isPressed, triggerPressed } = useTransientPressedState(pressedDurationMs);

  const computed: NonNullable<HeadlessButtonProps['classNames']> = useMemo(
    () => ({
      ...baseClassNames,
      e1: `${baseClassNames.e1}${isPressed && controlState !== true ? ' k-pressed' : ''}`
    }),
    [baseClassNames, controlState, isPressed]
  );

  const { isDisabled, ariaDisabled, ariaPressed } = resolveButtonAccessibilityFromCommon(common);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (isDisabled === true) return;

      if (controlState !== true) {
        triggerPressed();
      }

      onClick?.(event);
    },
    [controlState, isDisabled, onClick, triggerPressed]
  );

  return (
    <HeadlessButton
      {...restProps}
      label={label}
      disabled={isDisabled}
      aria-disabled={ariaDisabled}
      aria-pressed={ariaPressed}
      classNames={computed}
      onClick={handleClick}
      tabIndex={tabIndex ?? 0}
    />
  );
}

const MemoButtonCore = memo(ButtonCore);

export { MemoButtonCore as ButtonCore };
