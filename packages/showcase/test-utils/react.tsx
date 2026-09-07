import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { vi } from 'vitest';

const roots = new Map<Root, HTMLElement>();

export { act };
export async function waitFor<T>(callback: () => T): Promise<T> {
  return vi.waitFor(callback);
}
export function cleanup() {
  for (const [root, container] of roots) {
    act(() => root.unmount());
    container.remove();
  }
  roots.clear();
}
export function renderHook<Props, Result>(
  hook: (props: Props) => Result,
  { initialProps }: { initialProps: Props }
) {
  const result = {} as { current: Result };
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.set(root, container);
  function Probe({ value }: { value: Props }) {
    result.current = hook(value);
    return null;
  }
  function rerender(value: Props) {
    act(() => root.render(<Probe value={value} />));
  }
  rerender(initialProps);
  return { result, rerender };
}
