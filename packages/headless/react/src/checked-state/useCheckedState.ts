import { useCallback, useState } from 'react';

export type UseCheckedStateOptions = {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export type UseCheckedStateResult = {
  checked: boolean;
  isControlled: boolean;
  setChecked: (checked: boolean) => void;
  toggle: () => void;
};

export function useCheckedState({
  checked,
  defaultChecked = false,
  disabled,
  readOnly,
  onCheckedChange
}: UseCheckedStateOptions): UseCheckedStateResult {
  const isControlled = checked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const resolvedChecked = isControlled ? checked : uncontrolledChecked;

  const setChecked = useCallback(
    (nextChecked: boolean) => {
      if (disabled || readOnly || nextChecked === resolvedChecked) return;

      if (!isControlled) {
        setUncontrolledChecked(nextChecked);
      }

      onCheckedChange?.(nextChecked);
    },
    [disabled, isControlled, onCheckedChange, readOnly, resolvedChecked]
  );

  const toggle = useCallback(() => {
    setChecked(!resolvedChecked);
  }, [resolvedChecked, setChecked]);

  return {
    checked: resolvedChecked,
    isControlled,
    setChecked,
    toggle
  };
}
