export type ClickLockOptions = {
  lockMs?: number;
};

export function withClickLock<TEvent>(
  onClick: ((event: TEvent) => void) | undefined,
  options: ClickLockOptions = {}
) {
  const { lockMs = 300 } = options;
  let locked = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (event: TEvent) => {
    if (locked) return;

    locked = true;
    onClick?.(event);

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      locked = false;
      timeoutId = null;
    }, lockMs);
  };
}
