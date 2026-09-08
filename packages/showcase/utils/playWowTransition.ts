const timers = new WeakMap<Element, ReturnType<typeof window.setTimeout>>();

export function playWowTransition(durationMs = 900): void {
  if (typeof document === 'undefined') return;

  for (const root of document.querySelectorAll('.s-content')) {
    const previous = timers.get(root);
    if (previous !== undefined) window.clearTimeout(previous);
    root.classList.add('s-wow');
    timers.set(
      root,
      window.setTimeout(() => {
        root.classList.remove('s-wow');
        timers.delete(root);
      }, durationMs)
    );
  }
}
