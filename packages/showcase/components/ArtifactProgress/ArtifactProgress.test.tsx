/** @vitest-environment jsdom */

import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup } from '../../test-utils/react';
import { ArtifactProgress, estimatedProgress } from './ArtifactProgress';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('slows down at the agreed milestones and never simulates completion', () => {
  expect([300, 5000, 10000, 60000].map(estimatedProgress)).toEqual([50, 80, 95, 95]);
});
it('waits for the initial 300ms, completes only when ready and resets on a new request', () => {
  let tick: FrameRequestCallback = () => {};
  vi.spyOn(performance, 'now').mockReturnValue(0);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    tick = callback;
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  const container = document.createElement('div');
  const root = createRoot(container);
  const view = {
    container,
    rerender: (element: React.ReactNode) => act(() => root.render(element))
  };
  view.rerender(<ArtifactProgress load={{ id: 1, status: 'pending' }} />);
  const bar = () => view.container.querySelector<HTMLElement>('[data-artifact-progress] > div')!;
  view.rerender(<ArtifactProgress load={{ id: 1, status: 'ready' }} />);
  act(() => tick(280));
  expect(bar().style.transform).not.toBe('scaleX(1)');
  act(() => tick(300));
  expect(bar().style.transform).toBe('scaleX(0.5)');
  act(() => tick(450));
  expect(bar().style.transform).toBe('scaleX(1)');
  view.rerender(<ArtifactProgress load={{ id: 2, status: 'pending' }} />);
  act(() => tick(10000));
  expect(bar().style.transform).toBe('scaleX(0.95)');
  view.rerender(<ArtifactProgress load={{ id: 2, status: 'error' }} />);
  act(() => tick(10016));
  expect(view.container.innerHTML).toBe('');
  act(() => root.unmount());
});
