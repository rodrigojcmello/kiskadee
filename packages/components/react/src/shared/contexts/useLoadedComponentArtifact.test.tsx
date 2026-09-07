/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { KiskadeeContext, type KiskadeeContextValue } from './KiskadeeContext.tsx';
import { useLoadedComponentArtifact } from './useLoadedComponentArtifact.ts';

const isArtifact = (value: unknown): value is { component: string } =>
  (value as { component?: string })?.component === 'test';
function Probe() {
  const resource = useLoadedComponentArtifact({ componentName: 'test', isArtifact });
  return (
    <button type="button" onClick={resource.retry}>
      {resource.status}:{resource.currentArtifact?.component}
    </button>
  );
}
afterEach(cleanup);
it('publishes error and retries with the same mounted consumer, then reuses warm metadata', async () => {
  const load = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue({ component: 'test' });
  const value: KiskadeeContextValue = {
    designSystem: 'metadata-retry-test',
    segment: 'default',
    theme: 'light',
    classesMap: {},
    setTheme() {},
    setSegment() {},
    setDesignSystem() {},
    loadComponentArtifact: load
  };
  const tree = (
    <KiskadeeContext.Provider value={value}>
      <Probe />
    </KiskadeeContext.Provider>
  );
  const view = render(tree);
  await waitFor(() => expect(screen.getByRole('button').textContent).toBe('error:'));
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByRole('button').textContent).toBe('ready:test'));
  view.unmount();
  render(tree);
  expect(screen.getByRole('button').textContent).toBe('ready:test');
  expect(load).toHaveBeenCalledTimes(2);
});
