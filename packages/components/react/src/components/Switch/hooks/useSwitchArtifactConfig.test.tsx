/** @vitest-environment jsdom */

import { act, cleanup, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { KiskadeeContext } from '../../../shared/contexts/KiskadeeContext.tsx';
import { supportsSwitchThumbShrink, useSwitchArtifactConfig } from './useSwitchArtifactConfig';

const metadata = {
  switch: {
    component: 'switch',
    sizeSupport: { sizes: ['sm:1', 'md:1', 'lg:1'] },
    effects: { thumbShrink: true }
  }
};

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
    componentArtifacts: metadata
  };
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(KiskadeeContext.Provider, { value: context as never }, children);
  const { rerender } = renderHook(
    ({ size }: { size: 'sm' | 'md' | 'lg' }) => useSwitchArtifactConfig(undefined, size),
    { wrapper, initialProps: { size: 'md' as 'sm' | 'md' | 'lg' } }
  );
  expect(calls.load).toHaveBeenLastCalledWith(false);
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
    componentArtifacts: metadata,
    global: {
      density: { c: 'sm:1', r: 'md:1', s: 'lg:1' }
    }
  };
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(KiskadeeContext.Provider, { value: context as never }, children);
  renderHook(() => useSwitchArtifactConfig(), { wrapper });
  expect(calls.load).toHaveBeenLastCalledWith(false);
});

it('resolves adaptive and compiled density sizes before gating the effect', () => {
  const callbacks = new Set<() => void>();
  vi.stubGlobal('matchMedia', () => ({
    addEventListener: (_: string, cb: () => void) => callbacks.add(cb),
    removeEventListener: (_: string, cb: () => void) => callbacks.delete(cb)
  }));
  const originalWidth = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1500 });
  const context = {
    classesMap: {},
    segment: 'default',
    theme: 'light',
    density: 'adaptive',
    componentArtifacts: metadata,
    global: {
      density: { c: 'sm:1', r: 'md:1', s: 'lg:1' }
    }
  };
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(KiskadeeContext.Provider, { value: context as never }, children);
  const { unmount } = renderHook(() => useSwitchArtifactConfig(), { wrapper });
  expect(calls.load).toHaveBeenLastCalledWith(false);
  act(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    callbacks.forEach((cb) => {
      cb();
    });
  });
  expect(calls.load).toHaveBeenLastCalledWith(true);
  act(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 900 });
    callbacks.forEach((cb) => {
      cb();
    });
  });
  expect(calls.load).toHaveBeenLastCalledWith(false);
  unmount();
  context.density = 'spacious';
  renderHook(() => useSwitchArtifactConfig(), { wrapper });
  expect(calls.load).toHaveBeenLastCalledWith(true);
  expect(supportsSwitchThumbShrink('lg:1')).toBe(true);
  expect(supportsSwitchThumbShrink('s:md:1')).toBe(false);
  cleanup();
  vi.unstubAllGlobals();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
});

it('uses Medium for an unsupported explicit large size before considering thumb shrink', () => {
  const context = {
    classesMap: {},
    segment: 'default',
    theme: 'light',
    componentArtifacts: { switch: { ...metadata.switch, sizeSupport: { sizes: ['md:1'] } } }
  };
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(KiskadeeContext.Provider, { value: context as never }, children);
  renderHook(() => useSwitchArtifactConfig(undefined, 'lg'), { wrapper });
  expect(calls.load).toHaveBeenLastCalledWith(false);
});
