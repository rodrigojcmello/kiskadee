/** @vitest-environment jsdom */
import { afterEach, expect, it } from 'vitest';
import { cleanup, renderHook, waitFor } from '../test-utils/react';
import { useDesignSystemSelection } from './use-design-system-selection';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

it('migrates the existing Carbon selection without losing its theme', async () => {
  window.localStorage.setItem('kiskadee:design-system', 'carbon-1-ibm');
  window.localStorage.setItem('kiskadee:segment', 'default');
  window.localStorage.setItem('kiskadee:theme', 'dark');
  const { result } = renderHook(() => useDesignSystemSelection(), { initialProps: undefined });
  await waitFor(() => expect(result.current.designSystem).toBe('carbon-11-ibm'));
  expect(result.current.theme).toBe('dark');
  expect(result.current.designSystemKeys).not.toContain('carbon-1-ibm');
  expect(window.localStorage.getItem('kiskadee:design-system')).toBe('carbon-11-ibm');
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

it.each([
  ['modern', 'default'],
  ['purple', 'purple'],
  ['default', 'default']
])('migrates retired Material selection %s to Google/%s', async (previous, expected) => {
  window.localStorage.setItem('kiskadee:design-system', 'material-design-3-kiskadee');
  window.localStorage.setItem('kiskadee:segment', previous);
  window.localStorage.setItem('kiskadee:theme', 'dark');
  const { result } = renderHook(() => useDesignSystemSelection(), { initialProps: undefined });
  await waitFor(() => expect(result.current.designSystem).toBe('material-design-3-google'));
  expect(result.current.segment).toBe(expected);
  expect(result.current.theme).toBe('dark');
  expect(result.current.designSystemKeys).not.toContain('material-design-3-kiskadee');
  expect(window.localStorage.getItem('kiskadee:design-system')).toBe('material-design-3-google');
});
