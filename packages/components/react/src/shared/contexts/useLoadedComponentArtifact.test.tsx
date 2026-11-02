/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { KiskadeeContext, type KiskadeeContextValue } from './KiskadeeContext.tsx';
import { useLoadedComponentArtifact } from './useLoadedComponentArtifact.ts';

const isArtifact = (value: unknown): value is { component: string } =>
  (value as { component?: string })?.component === 'test';
function Probe({ resetWhenLoaderMissing = true }: { resetWhenLoaderMissing?: boolean }) {
  const resource = useLoadedComponentArtifact({
    componentName: 'test',
    isArtifact,
    resetWhenLoaderMissing
  });
  return (
    <button type="button" data-error={Boolean(resource.error)} onClick={resource.retry}>
      {resource.status}:{resource.currentArtifact?.component}
    </button>
  );
}
afterEach(cleanup);
it('lets a valid preload supersede an earlier failure while the loader remains configured', async () => {
  const load = vi.fn().mockRejectedValue(new Error('offline'));
  const value: KiskadeeContextValue = {
    designSystem: 'metadata-preload-supersedes-error',
    segment: 'default',
    theme: 'light',
    classesMap: {},
    setTheme() {},
    setSegment() {},
    setDesignSystem() {},
    loadComponentArtifact: load
  };
  const tree = (contextValue: KiskadeeContextValue) => (
    <KiskadeeContext.Provider value={contextValue}>
      <Probe />
    </KiskadeeContext.Provider>
  );
  const view = render(tree(value));
  await waitFor(() => expect(screen.getByRole('button').textContent).toBe('error:'));
  expect(screen.getByRole('button').dataset.error).toBe('true');
  view.rerender(
    tree({ ...value, componentArtifacts: { test: { formatVersion: 3, component: 'test' } } })
  );
  expect(screen.getByRole('button').textContent).toBe('ready:test');
  expect(screen.getByRole('button').dataset.error).toBe('false');
  expect(load).toHaveBeenCalledTimes(1);
});

it.each([
  'ready',
  'error'
] as const)('preserves only successful cached metadata when a loader is removed (previous status: %s)', async (status) => {
  const load =
    status === 'ready'
      ? vi.fn().mockResolvedValue({ formatVersion: 3, component: 'test' })
      : vi.fn().mockRejectedValue(new Error('offline'));
  const value: KiskadeeContextValue = {
    designSystem: `metadata-loader-removed-${status}`,
    segment: 'default',
    theme: 'light',
    classesMap: {},
    setTheme() {},
    setSegment() {},
    setDesignSystem() {},
    loadComponentArtifact: load
  };
  const tree = (contextValue: KiskadeeContextValue) => (
    <KiskadeeContext.Provider value={contextValue}>
      <Probe resetWhenLoaderMissing={false} />
    </KiskadeeContext.Provider>
  );
  const view = render(tree(value));
  await waitFor(() =>
    expect(screen.getByRole('button').textContent).toBe(
      status === 'ready' ? 'ready:test' : 'error:'
    )
  );
  view.rerender(tree({ ...value, loadComponentArtifact: undefined }));
  expect(screen.getByRole('button').textContent).toBe(
    status === 'ready' ? 'ready:test' : 'absent:'
  );
  expect(screen.getByRole('button').dataset.error).toBe('false');
});

it.each([
  undefined,
  2
])('rejects metadata format %s before publishing and permits a fresh retry', async (formatVersion) => {
  const load = vi
    .fn()
    .mockResolvedValueOnce({ formatVersion, component: 'test' })
    .mockResolvedValue({ formatVersion: 3, component: 'test' });
  const value: KiskadeeContextValue = {
    designSystem: `metadata-version-retry-${formatVersion}`,
    segment: 'default',
    theme: 'light',
    classesMap: {},
    setTheme() {},
    setSegment() {},
    setDesignSystem() {},
    loadComponentArtifact: load
  };
  render(
    <KiskadeeContext.Provider value={value}>
      <Probe />
    </KiskadeeContext.Provider>
  );
  await waitFor(() => expect(screen.getByRole('button').textContent).toBe('error:'));
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByRole('button').textContent).toBe('ready:test'));
  expect(load).toHaveBeenCalledTimes(2);
});

it('rejects incompatible preloaded metadata before the consumer predicate can use it', () => {
  const value: KiskadeeContextValue = {
    designSystem: 'metadata-version-preload',
    segment: 'default',
    theme: 'light',
    classesMap: {},
    setTheme() {},
    setSegment() {},
    setDesignSystem() {},
    componentArtifacts: {
      test: { formatVersion: 2, component: 'test' }
    } as unknown as KiskadeeContextValue['componentArtifacts']
  };
  render(
    <KiskadeeContext.Provider value={value}>
      <Probe />
    </KiskadeeContext.Provider>
  );
  expect(screen.getByRole('button').textContent).toBe('error:');
});

it('publishes error and retries with the same mounted consumer, then reuses warm metadata', async () => {
  const load = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue({ formatVersion: 3, component: 'test' });
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
