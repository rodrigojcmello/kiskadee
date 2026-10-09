/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { animateAccordionPanel } from './AccordionMotion.effect.ts';

const state = vi.hoisted(() => ({
  calls: [] as { target: object; values: any; stop: ReturnType<typeof vi.fn>; finish: () => void }[]
}));
vi.mock('motion', () => ({
  animate: (target: object, values: object) => {
    const call = { target, values, stop: vi.fn(), finish: () => {} };
    state.calls.push(call);
    return {
      stop: call.stop,
      // biome-ignore lint/suspicious/noThenProperty: Motion controls are intentionally thenable.
      then: (callback: () => void) => {
        call.finish = callback;
      }
    };
  }
}));
const timing = {
  enterDurationMs: 180,
  exitDurationMs: 120,
  enterEasing: 'ease-out',
  exitEasing: 'ease-in'
} as const;
let resize: () => void;
const disconnect = vi.fn();
beforeEach(() => {
  state.calls = [];
  disconnect.mockReset();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect = disconnect;
    }
  );
});
afterEach(() => vi.unstubAllGlobals());
it('remeasures dynamic content and ignores superseded completion callbacks', () => {
  const panel = document.createElement('div');
  const body = document.createElement('div');
  let current = 0;
  let target = 100;
  panel.getBoundingClientRect = () => ({ height: current }) as DOMRect;
  body.getBoundingClientRect = () => ({ height: target }) as DOMRect;
  const complete = vi.fn();
  const cancel = animateAccordionPanel(panel, body, true, timing, complete);
  expect(state.calls[0]?.values.height).toEqual(['0px', '100px']);
  current = 40;
  target = 180;
  resize();
  expect(state.calls[0]?.stop).toHaveBeenCalledOnce();
  expect(state.calls[1]?.values.height).toEqual(['40px', '180px']);
  state.calls[0]?.finish();
  expect(complete).not.toHaveBeenCalled();
  state.calls[1]?.finish();
  expect(panel.style.height).toBe('auto');
  expect(complete).toHaveBeenCalledOnce();
  cancel();
  expect(disconnect).toHaveBeenCalled();
});
it('stops an exit without hiding a newly reopened panel', () => {
  const panel = document.createElement('div');
  const body = document.createElement('div');
  panel.getBoundingClientRect = () => ({ height: 37 }) as DOMRect;
  const complete = vi.fn();
  const cancel = animateAccordionPanel(panel, body, false, timing, complete);
  expect(state.calls[0]?.values.height).toEqual(['37px', '0px']);
  cancel();
  state.calls[0]?.finish();
  expect(complete).not.toHaveBeenCalled();
});
