/** @vitest-environment jsdom */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { useRouteControlCursor } from './use-route-control-cursor.ts';

it('isolates formerly excluded routes, resets overrides, and starts fresh after reload', () => {
  const container = document.createElement('div');
  document.body.append(container);
  let state: ReturnType<typeof useRouteControlCursor>;
  function Scenario({ path }: { path: string }) {
    state = useRouteControlCursor(path);
    return <p>{state.override ?? 'preset'}</p>;
  }
  const root = createRoot(container);
  const render = (path: string) => act(() => root.render(<Scenario path={path} />));
  render('/accordion');
  act(() => state.setOverride('default'));
  render('/layout');
  expect(container.textContent).toBe('preset');
  act(() => state.setOverride('pointer'));
  render('/accordion');
  expect(container.textContent).toBe('default');
  act(() => state.setOverride(undefined));
  expect(container.textContent).toBe('preset');
  render('/layout');
  expect(container.textContent).toBe('pointer');
  act(() => root.unmount());
  const fresh = createRoot(container);
  act(() => fresh.render(<Scenario path="/layout" />));
  expect(container.textContent).toBe('preset');
  act(() => fresh.unmount());
  container.remove();
});
