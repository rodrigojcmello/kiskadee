export function trySetPointerCapture(target: HTMLElement, pointerId: number) {
  if (typeof target.setPointerCapture !== 'function') return;
  try {
    target.setPointerCapture(pointerId);
  } catch {
    // Ignore capture errors from non-active pointer ids.
  }
}

export function tryReleasePointerCapture(target: HTMLElement, pointerId: number) {
  if (typeof target.releasePointerCapture !== 'function') return;
  try {
    if (typeof target.hasPointerCapture === 'function' && target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  } catch {
    // Ignore release errors from stale pointer ids.
  }
}
