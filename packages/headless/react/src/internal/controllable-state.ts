import { useCallback, useState } from 'react';

export function useControllableState<T>({
  value,
  defaultValue,
  onChange
}: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
}): readonly [T, (next: T) => void] {
  const controlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const resolvedValue = controlled ? value : uncontrolledValue;

  const setValue = useCallback(
    (next: T) => {
      if (!controlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [controlled, onChange]
  );

  return [resolvedValue, setValue] as const;
}
