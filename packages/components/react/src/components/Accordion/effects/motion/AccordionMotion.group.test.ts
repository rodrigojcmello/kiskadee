/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { TransitionSpeed } from '../../../../shared/motion/transitionSpeed.ts';
import { createAccordionMotionGroup } from './AccordionMotion.group.ts';
import { resolveAccordionTransition } from './AccordionMotion.recipes.ts';

let tasks: (() => void)[];
const flush = () => {
  for (const task of tasks.splice(0)) task();
};
const makeEntry = (open: boolean) => ({
  panel: document.createElement('div'),
  content: document.createElement('div'),
  open,
  finish: vi.fn()
});
function fixture(
  coordination: 'synchronized' | 'independent' = 'synchronized',
  speed: TransitionSpeed = 'normal'
) {
  const group = createAccordionMotionGroup();
  const cancel = vi.fn();
  const animate = vi.fn().mockReturnValue(cancel);
  group.configure({ animate, speed, coordination });
  const a = makeEntry(true),
    b = makeEntry(false),
    c = makeEntry(false);
  group.update('a', a);
  group.update('b', b);
  group.update('c', c);
  return { group, a, b, c, animate, cancel };
}
beforeEach(() => {
  tasks = [];
  vi.stubGlobal('queueMicrotask', (task: () => void) => tasks.push(task));
});
afterEach(() => vi.unstubAllGlobals());
it.each([
  'normal',
  'fast',
  'slow',
  'debugSlow'
] as const)('preserves separate isolated recipes for %s', (speed) => {
  const { group, a, b, animate } = fixture('synchronized', speed);
  group.update('a', { ...a, open: false });
  flush();
  expect(animate.mock.calls[0]![1]).toEqual(resolveAccordionTransition(speed, false));
  group.update('b', { ...b, open: true });
  flush();
  expect(animate.mock.calls[1]![1]).toEqual(resolveAccordionTransition(speed, true));
});
it('batches a replacement using the opening recipe and avoids initial animation', () => {
  const { group, a, b, animate } = fixture();
  expect(animate).not.toHaveBeenCalled();
  group.update('a', { ...a, open: false });
  group.update('b', { ...b, open: true });
  expect(animate).not.toHaveBeenCalled();
  flush();
  expect(animate).toHaveBeenCalledOnce();
  expect(animate.mock.calls[0]![0].map((entry: { open: boolean }) => entry.open)).toEqual([
    false,
    true
  ]);
  expect(animate.mock.calls[0]![1]).toEqual(resolveAccordionTransition('normal', true));
});
it('keeps independent entry and exit recipes in the same update when requested', () => {
  const { group, a, b, animate } = fixture('independent');
  group.update('a', { ...a, open: false });
  group.update('b', { ...b, open: true });
  flush();
  expect(animate.mock.calls.map((call) => call[1].durationMs)).toEqual([120, 180]);
});
it('includes still-moving panels when a synchronized replacement is interrupted', () => {
  const { group, a, b, c, animate, cancel } = fixture();
  group.update('a', { ...a, open: false });
  group.update('b', { ...b, open: true });
  flush();
  a.panel.style.height = '30px';
  b.panel.style.height = '60px';
  group.update('b', { ...b, open: false });
  group.update('c', { ...c, open: true });
  flush();
  expect(cancel).toHaveBeenCalledOnce();
  expect(animate.mock.calls[1]![0]).toHaveLength(3);
  expect(a.panel.style.height).toBe('30px');
  animate.mock.calls[0]![2]();
  expect(a.finish).toHaveBeenCalledTimes(1); // Initial registration only; cancelled completion ignored.
});
it('settles immediately when the enhancer is missing and never replays on arrival', () => {
  const { group, a, animate } = fixture();
  group.configure({ animate: null, speed: 'normal', coordination: 'synchronized' });
  group.update('a', { ...a, open: false });
  flush();
  expect(a.panel.style.height).toBe('0px');
  group.configure({ animate, speed: 'normal', coordination: 'synchronized' });
  flush();
  expect(animate).not.toHaveBeenCalled();
});
it('isolates group clocks and ignores queued work after destruction', () => {
  const first = fixture(),
    second = fixture();
  first.group.update('a', { ...first.a, open: false });
  second.group.update('b', { ...second.b, open: true });
  first.group.destroy();
  flush();
  expect(first.animate).not.toHaveBeenCalled();
  expect(second.animate).toHaveBeenCalledOnce();
});
