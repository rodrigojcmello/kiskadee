import { useCallback, useState } from 'react';

export type UseControlStateOptions = {
  controlState?: boolean;
  defaultControlState?: boolean;
  disabled?: boolean;
  interactionLocked?: boolean;
  readOnly?: boolean;
  onControlStateChange?: (controlState: boolean) => void;
};

export type UseControlStateResult = {
  controlState: boolean;
  isControlled: boolean;
  setControlState: (controlState: boolean) => void;
  toggle: () => void;
};

export function useControlState({
  controlState,
  defaultControlState = false,
  disabled,
  interactionLocked,
  readOnly,
  onControlStateChange
}: UseControlStateOptions): UseControlStateResult {
  const isControlled = controlState !== undefined;
  const [uncontrolledControlState, setUncontrolledControlState] = useState(defaultControlState);
  const resolvedControlState = isControlled ? controlState : uncontrolledControlState;

  const setControlState = useCallback(
    (nextControlState: boolean) => {
      if (disabled || interactionLocked || readOnly || nextControlState === resolvedControlState) {
        return;
      }

      if (!isControlled) {
        setUncontrolledControlState(nextControlState);
      }

      onControlStateChange?.(nextControlState);
    },
    [
      disabled,
      interactionLocked,
      isControlled,
      onControlStateChange,
      readOnly,
      resolvedControlState
    ]
  );

  const toggle = useCallback(() => {
    setControlState(!resolvedControlState);
  }, [resolvedControlState, setControlState]);

  return {
    controlState: resolvedControlState,
    isControlled,
    setControlState,
    toggle
  };
}
