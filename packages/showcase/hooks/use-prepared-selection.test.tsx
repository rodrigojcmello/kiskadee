/** @vitest-environment jsdom */

import { afterEach, expect, it, vi } from 'vitest';
import type { DesignSystemKey } from '../registry/registry-utils';
import { act, cleanup, renderHook, waitFor } from '../test-utils/react';

const fixtures = vi.hoisted(() => ({
  prepare: vi.fn(),
  activate: vi.fn(),
  json: vi.fn(async (path: string): Promise<unknown> => ({ key: path.split('/')[0] }))
}));
vi.mock('./use-stylesheet-manager', () => ({
  prepareSelectionStylesheets: fixtures.prepare,
  activateSelectionStylesheets: fixtures.activate
}));
vi.mock('@/utils/build-artifacts.client', () => ({
  loadJsonFromBuild: fixtures.json
}));

import { usePreparedSelection } from './use-prepared-selection';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it('keeps the last selection through CSS failure, supports retry and ignores obsolete completion', async () => {
  let finishB: (links: HTMLLinkElement[]) => void = () => {};
  fixtures.prepare
    .mockResolvedValueOnce([])
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishB = resolve;
        })
    )
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce([]);
  const view = renderHook(
    ({ designSystem }) =>
      usePreparedSelection({
        designSystem: designSystem as DesignSystemKey,
        segment: 'default',
        theme: 'light'
      }),
    { initialProps: { designSystem: 'A' } }
  );
  await waitFor(() => expect(view.result.current.prepared?.designSystem).toBe('A'));
  view.rerender({ designSystem: 'B' });
  expect(view.result.current.prepared?.designSystem).toBe('A');
  view.rerender({ designSystem: 'C' });
  await waitFor(() => expect(view.result.current.error).toBeInstanceOf(Error));
  expect(view.result.current.prepared?.designSystem).toBe('A');
  await act(async () => finishB([]));
  expect(view.result.current.prepared?.designSystem).toBe('A');
  act(() => view.result.current.retry());
  await waitFor(() => expect(view.result.current.prepared?.designSystem).toBe('C'));
  expect(fixtures.activate).toHaveBeenCalledTimes(2);
});

it('waits for consumed component maps and retries only failed transport', async () => {
  fixtures.prepare.mockResolvedValue([]);
  let failPalette = true;
  fixtures.json.mockImplementation(async (path: string) => {
    if (path.endsWith('manifest.json'))
      return {
        key: 'resources',
        version: '1',
        components: {
          button: {
            artifacts: {
              metadata: 'button.metadata.json',
              classMaps: {
                core: 'button.core.json',
                palettes: { 'default.light': 'button.palette.json' }
              }
            }
          }
        }
      };
    if (path.endsWith('global.kiskadee.json')) return {};
    if (path.endsWith('button.metadata.json')) return { component: 'button', options: {} };
    if (path.endsWith('button.palette.json') && failPalette) throw new Error('offline');
    return {
      component: 'button',
      classMap: {
        e1: path.endsWith('button.core.json')
          ? { d: 'base' }
          : { c: { s: { neutral: { m: 'color' } } } }
      }
    };
  });
  const names = new Set(['button']);
  const view = renderHook(
    () =>
      usePreparedSelection(
        { designSystem: 'resources' as DesignSystemKey, segment: 'default', theme: 'light' },
        names
      ),
    { initialProps: {} }
  );
  await waitFor(() => expect(view.result.current.error).toBeInstanceOf(Error));
  expect(view.result.current.prepared).toBeUndefined();
  expect(fixtures.activate).not.toHaveBeenCalled();
  failPalette = false;
  act(() => view.result.current.retry());
  await waitFor(() =>
    expect(view.result.current.prepared?.classMaps).toEqual({
      button: { e1: { d: 'base', c: { s: { neutral: { m: 'color' } } } } }
    })
  );
  expect(
    fixtures.json.mock.calls.filter(([path]) => path.endsWith('button.core.json'))
  ).toHaveLength(1);
  expect(
    fixtures.json.mock.calls.filter(([path]) => path.endsWith('button.palette.json'))
  ).toHaveLength(2);
});
