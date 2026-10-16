/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { animateAccordionPanels } from './AccordionMotion.effect.ts';

const state = vi.hoisted(() => ({
  calls: [] as { options: any; stop: ReturnType<typeof vi.fn>; finish: () => void }[]
}));
vi.mock('motion', () => ({
  animate: (_from: number, _to: number, options: object) => {
    const call = { options, stop: vi.fn(), finish: () => {} };
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
let resize: () => void;
const disconnect = vi.fn();
function participant(open: boolean, initial: number, height: number) {
  const panel = document.createElement('div');
  const content = document.createElement('div');
  let target = height;
  panel.getBoundingClientRect = () =>
    ({ height: Number.parseFloat(panel.style.height) || initial }) as DOMRect;
  content.getBoundingClientRect = () => ({ height: target }) as DOMRect;
  return {
    panel,
    content,
    open,
    resize(height: number) {
      target = height;
      resize();
    }
  };
}
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
it('uses one progress clock for differently sized opening and closing panels', () => {
  const opening = participant(true, 0, 200);
  const closing = participant(false, 100, 100);
  const complete = vi.fn();
  animateAccordionPanels([opening, closing], { durationMs: 180, easing: 'ease-out' }, complete);
  expect(state.calls).toHaveLength(1);
  expect(state.calls[0]!.options.duration).toBe(0.18);
  state.calls[0]!.options.onUpdate(0.5);
  expect(opening.panel.style.height).toBe('100px');
  expect(closing.panel.style.height).toBe('50px');
  state.calls[0]!.finish();
  expect(opening.panel.style.height).toBe('auto');
  expect(closing.panel.style.height).toBe('0px');
  expect(complete).toHaveBeenCalledOnce();
});
it('retargets content continuously on the same clock without restarting the duration', () => {
  const opening = participant(true, 0, 100);
  const closing = participant(false, 200, 200);
  animateAccordionPanels([opening, closing], { durationMs: 1800, easing: 'ease-out' }, vi.fn());
  state.calls[0]!.options.onUpdate(0.5);
  opening.resize(180);
  expect(opening.panel.style.height).toBe('50px');
  state.calls[0]!.options.onUpdate(0.75);
  expect(opening.panel.style.height).toBe('115px');
  expect(closing.panel.style.height).toBe('50px');
  expect(state.calls).toHaveLength(1);
  state.calls[0]!.finish();
  expect(disconnect).toHaveBeenCalledOnce();
});
it('cancels progress and completion without hiding a reopened panel', () => {
  const entry = participant(false, 37, 100);
  const done = vi.fn();
  const cancel = animateAccordionPanels([entry], { durationMs: 120, easing: 'ease-in' }, done);
  cancel();
  state.calls[0]!.options.onUpdate(1);
  state.calls[0]!.finish();
  expect(entry.panel.style.height).toBe('37px');
  expect(done).not.toHaveBeenCalled();
  expect(state.calls[0]!.stop).toHaveBeenCalledOnce();
});
