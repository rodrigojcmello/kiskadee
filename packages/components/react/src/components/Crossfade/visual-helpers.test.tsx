/** @vitest-environment jsdom */
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Rotate } from '../Rotate/Rotate.tsx';
import { Crossfade } from './Crossfade.tsx';

const state = vi.hoisted(() => ({
  ready: true,
  rotate: vi.fn(),
  crossfade: vi.fn(),
  cancel: vi.fn(),
  completions: [] as (() => void)[]
}));
vi.mock('../../shared/utils/lazyModule.ts', () => {
  const module = { rotate: state.rotate, crossfade: state.crossfade };
  return {
    createLazyModuleCache: () => ({}),
    useLazyModule: (_cache: unknown, enabled: boolean) => (enabled && state.ready ? module : null)
  };
});
const timing = { durationMs: 180, easing: 'ease-out' } as const;
beforeEach(() => {
  state.ready = true;
  state.completions = [];
  state.rotate.mockReset().mockReturnValue(state.cancel);
  state.crossfade.mockReset().mockImplementation((_current, _previous, _timing, finish) => {
    state.completions.push(finish);
    return state.cancel;
  });
  state.cancel.mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('updates content without fading when its explicit transition key is unchanged', () => {
  const view = render(
    <Crossfade {...timing} transitionKey="same">
      <span>First</span>
    </Crossfade>
  );
  view.rerender(
    <Crossfade {...timing} transitionKey="same">
      <span>Updated</span>
    </Crossfade>
  );
  expect(view.getByText('Updated')).toBeTruthy();
  expect(view.container.querySelectorAll('.k-cfd-x1')).toHaveLength(1);
  expect(state.crossfade).not.toHaveBeenCalled();
});
it('keeps the exiting snapshot inert and hides it from accessibility until completion', () => {
  const view = render(
    <Crossfade {...timing} transitionKey="a">
      First
    </Crossfade>
  );
  view.rerender(
    <Crossfade {...timing} transitionKey="b">
      Second
    </Crossfade>
  );
  const previous = view.getByText('First');
  expect(previous.getAttribute('aria-hidden')).toBe('true');
  expect(previous.hasAttribute('inert')).toBe(true);
  expect(state.crossfade).toHaveBeenCalledOnce();
  act(() => state.completions[0]?.());
  expect(view.queryByText('First')).toBeNull();
  expect(view.getByText('Second')).toBeTruthy();
});
it('bounds rapid swaps to two snapshots and ignores an outdated completion', () => {
  const view = render(
    <Crossfade {...timing} transitionKey="a">
      A
    </Crossfade>
  );
  view.rerender(
    <Crossfade {...timing} transitionKey="b">
      B
    </Crossfade>
  );
  view.rerender(
    <Crossfade {...timing} transitionKey="c">
      C
    </Crossfade>
  );
  expect(state.cancel).toHaveBeenCalledOnce();
  expect(view.container.querySelectorAll('.k-cfd-x1')).toHaveLength(2);
  act(() => state.completions[0]?.());
  expect(view.getByText('B')).toBeTruthy();
  act(() => state.completions[1]?.());
  expect(view.queryByText('B')).toBeNull();
});
it('does not replay a swap or rotation when the module arrives late', () => {
  state.ready = false;
  const view = render(
    <>
      <Crossfade {...timing} transitionKey="a">
        A
      </Crossfade>
      <Rotate {...timing} angle={0}>
        Icon
      </Rotate>
    </>
  );
  view.rerender(
    <>
      <Crossfade {...timing} transitionKey="b">
        B
      </Crossfade>
      <Rotate {...timing} angle={180}>
        Icon
      </Rotate>
    </>
  );
  state.ready = true;
  view.rerender(
    <>
      <Crossfade {...timing} transitionKey="b">
        B
      </Crossfade>
      <Rotate {...timing} angle={180}>
        Icon
      </Rotate>
    </>
  );
  expect(state.crossfade).not.toHaveBeenCalled();
  expect(state.rotate).not.toHaveBeenCalled();
  expect(view.container.querySelector('.k-rot')?.getAttribute('style')).toContain('180deg');
});
it('renders the initial angle immediately and cancels rotation on reversal and unmount', () => {
  const view = render(
    <Rotate {...timing} angle={45}>
      Icon
    </Rotate>
  );
  expect(state.rotate).not.toHaveBeenCalled();
  expect(view.container.querySelector('.k-rot')?.getAttribute('style')).toContain('45deg');
  view.rerender(
    <Rotate {...timing} angle={180}>
      Icon
    </Rotate>
  );
  view.rerender(
    <Rotate {...timing} angle={0}>
      Icon
    </Rotate>
  );
  expect(state.cancel).toHaveBeenCalledOnce();
  expect(state.rotate.mock.calls.map((call) => call[1])).toEqual([180, 0]);
  view.unmount();
  expect(state.cancel).toHaveBeenCalledTimes(2);
});
it('applies reduced motion immediately for both helpers', () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {}
  }));
  const view = render(
    <>
      <Crossfade {...timing} transitionKey="a">
        A
      </Crossfade>
      <Rotate {...timing} angle={0}>
        Icon
      </Rotate>
    </>
  );
  view.rerender(
    <>
      <Crossfade {...timing} transitionKey="b">
        B
      </Crossfade>
      <Rotate {...timing} angle={180}>
        Icon
      </Rotate>
    </>
  );
  expect(state.rotate).not.toHaveBeenCalled();
  expect(state.crossfade).not.toHaveBeenCalled();
  expect(view.queryByText('A')).toBeNull();
});
