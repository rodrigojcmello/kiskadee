/** @vitest-environment jsdom */

import { afterEach, expect, it, vi } from 'vitest';
import type { DesignSystemKey } from '../registry/registry-utils';
import { act, cleanup, renderHook, waitFor } from '../test-utils/react';

const fixtures = vi.hoisted(() => {
  let finishA: (value: unknown) => void = () => {};
  const coreA = new Promise((resolve) => {
    finishA = resolve;
  });
  return { coreA, finishA, paletteA: vi.fn(async () => ({})) };
});
vi.mock('@/registry/design-systems.registry', () => ({
  coreMaps: { A: () => fixtures.coreA, B: async () => ({ text: { e1: { d: 'B' } } }) },
  paletteMaps: { 'A|default|light': fixtures.paletteA }
}));

import { useClassMapLoader } from './use-class-map-loader';

afterEach(cleanup);
it('starts both scopes concurrently and ignores an obsolete result', async () => {
  const view = renderHook(
    ({ designSystem }) =>
      useClassMapLoader({
        designSystem: designSystem as DesignSystemKey,
        segment: 'default',
        theme: 'light'
      }),
    { initialProps: { designSystem: 'A' } }
  );
  expect(fixtures.paletteA).toHaveBeenCalledOnce();
  view.rerender({ designSystem: 'B' });
  await waitFor(() => expect(view.result.current).toEqual({ text: { e1: { d: 'B' } } }));
  await act(async () => fixtures.finishA({ text: { e1: { d: 'A' } } }));
  expect(view.result.current).toEqual({ text: { e1: { d: 'B' } } });
});
