export function playWowTransition(durationMs = 900): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (!root) return;

  root.classList.add('k-wow');

  window.setTimeout(() => {
    root.classList.remove('k-wow');
  }, durationMs);
}
