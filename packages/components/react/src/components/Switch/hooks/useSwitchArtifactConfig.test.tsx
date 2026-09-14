/** @vitest-environment jsdom */

import { cleanup, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { KiskadeeContext } from '../../../shared/contexts/KiskadeeContext.tsx';
import { supportsSwitchThumbShrink, useSwitchArtifactConfig } from './useSwitchArtifactConfig';

const calls = vi.hoisted(() => ({ load: vi.fn(() => null) }));
vi.mock('../effects/thumb-shrink/index.ts', () => ({ useSwitchThumbShrinkEffect: calls.load }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it('gates the shared effect at the resolved size, including transitions from md to sm', () => {
  const context = {
    classesMap: {},
    segment: 'default',
    theme: 'light',
    global: { components: { switch: { effects: { thumbShrink: true } } } }
  };
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(KiskadeeContext.Provider, { value: context as never }, children);
  const { rerender } = renderHook(
    ({ size }: { size: 'sm' | 'md' | 'lg' }) => useSwitchArtifactConfig(undefined, size),
    { wrapper, initialProps: { size: 'md' as 'sm' | 'md' | 'lg' } }
  );
  expect(calls.load).toHaveBeenLastCalledWith(true);
  rerender({ size: 'sm' });
  expect(calls.load).toHaveBeenLastCalledWith(false);
  rerender({ size: 'lg' });
  expect(calls.load).toHaveBeenLastCalledWith(true);
  for (const scale of ['s:sm:1', 's:sm:5']) expect(supportsSwitchThumbShrink(scale)).toBe(false);
});

it('disables shrink when density resolves to small even without an explicit instance size', () => {
  const context = {
    classesMap: {},
    segment: 'default',
    theme: 'light',
    density: 'compact',
    global: {
      density: { switch: { c: 's:sm:1', r: 's:md:1', s: 's:lg:1' } },
      components: { switch: { effects: { thumbShrink: true } } }
    }
  };
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(KiskadeeContext.Provider, { value: context as never }, children);
  renderHook(() => useSwitchArtifactConfig(), { wrapper });
  expect(calls.load).toHaveBeenLastCalledWith(false);
});
