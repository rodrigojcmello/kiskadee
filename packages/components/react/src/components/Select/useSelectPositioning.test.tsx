// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { useSelectPositioning } from './useSelectPositioning.ts';

afterEach(cleanup);
it('consumes e13 geometry, reacts to density changes and never invents missing distances', () => {
  const element = document.createElement('div');
  document.body.append(element);
  const hook = renderHook(({ className }) => useSelectPositioning(className), {
    initialProps: { className: 'geometry' as string | undefined }
  });
  act(() => hook.result.current.ref(element));
  expect(hook.result.current.offset).toBeNull();
  expect(hook.result.current.collisionPadding).toBeNull();
  for (const [key, value] of Object.entries({
    '--k-mgt': 13,
    '--k-pdt': 3,
    '--k-pdr': 5,
    '--k-pdb': 7,
    '--k-pdl': 11
  }))
    element.style.setProperty(key, `${value}px`);
  act(() => window.dispatchEvent(new Event('resize')));
  expect(hook.result.current.offset).toBe(13);
  expect(hook.result.current.collisionPadding).toEqual({ top: 3, right: 5, bottom: 7, left: 11 });
  element.style.setProperty('--k-mgt', '21px');
  hook.rerender({ className: 'geometry-large' });
  expect(hook.result.current.offset).toBe(21);
  hook.rerender({ className: undefined });
  expect(hook.result.current.offset).toBeNull();
  element.remove();
});
