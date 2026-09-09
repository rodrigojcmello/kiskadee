/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { afterEach, expect, it } from 'vitest';
import { KiskadeeContext, type KiskadeeContextValue } from './KiskadeeContext.tsx';
import { useControlCursorStyle } from './useControlCursorStyle.ts';

afterEach(cleanup);

function Probe({ portal = false }: { portal?: boolean }) {
  const style = useControlCursorStyle();
  const node = (
    <button type="button" style={style}>
      {portal ? 'Portal' : 'Inline'}
    </button>
  );
  return portal ? createPortal(node, document.body) : node;
}

it('carries an application preference into portals and removes it when returning to preset CSS', () => {
  const base: KiskadeeContextValue = {
    designSystem: 'test',
    segment: 'default',
    theme: 'light',
    classesMap: {},
    setTheme() {},
    setSegment() {},
    setDesignSystem() {}
  };
  const tree = (value: KiskadeeContextValue) => (
    <KiskadeeContext.Provider value={value}>
      <Probe />
      <Probe portal />
    </KiskadeeContext.Provider>
  );
  const view = render(tree({ ...base, controlCursor: { value: 'default', scope: 'all' } }));
  for (const label of ['Inline', 'Portal']) {
    expect(screen.getByRole('button', { name: label }).style.getPropertyValue('--k-cc')).toBe(
      'default'
    );
  }
  view.rerender(tree({ ...base, controlCursor: { value: 'pointer', scope: 'web' } }));
  expect(screen.getByRole('button', { name: 'Portal' }).style.getPropertyValue('--k-cc')).toBe(
    'pointer'
  );
  view.rerender(tree(base));
  expect(screen.getByRole('button', { name: 'Portal' }).style.getPropertyValue('--k-cc')).toBe('');
});
