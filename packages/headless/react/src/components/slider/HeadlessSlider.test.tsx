/** @vitest-environment jsdom */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { type ComponentProps, createElement as h } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HeadlessSlider } from './HeadlessSlider.tsx';

class TestPointerEvent extends MouseEvent {
  readonly pointerId: number;
  readonly isPrimary: boolean;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
    this.isPrimary = init.isPrimary ?? true;
  }
}

beforeEach(() => {
  vi.stubGlobal('PointerEvent', TestPointerEvent);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    const isThumb = this.hasAttribute('data-slider-thumb-index');
    const width = isThumb ? 30 : 200;
    const center = 100 + 2 * Number.parseFloat(this.style.getPropertyValue('--k-sld-value') || '0');
    const left = isThumb ? center - width / 2 : 100;
    return {
      x: left,
      y: 0,
      left,
      right: left + width,
      top: 0,
      bottom: 30,
      width,
      height: 30,
      toJSON: () => ({})
    };
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function setup(props: ComponentProps<typeof HeadlessSlider.Root> = {}) {
  const result = render(
    h(
      HeadlessSlider.Root,
      { defaultValue: 50, ...props },
      h(
        HeadlessSlider.Track,
        { 'data-testid': 'track' },
        h(
          HeadlessSlider.Thumb,
          { index: 0, 'aria-label': 'Value' },
          h('span', { 'data-testid': 'icon' })
        ),
        props.selectionMode === 'range'
          ? h(HeadlessSlider.Thumb, { index: 1, 'aria-label': 'End' })
          : null
      )
    )
  );
  return {
    ...result,
    track: result.getByTestId('track'),
    thumb: result.getByRole('slider', { name: 'Value' })
  };
}

it.each([
  'overflow',
  'contain'
] as const)('keeps the grab offset through movement and release with %s edges', (thumbEdge) => {
  const { thumb, track, getByTestId } = setup({ thumbEdge });
  fireEvent.pointerDown(getByTestId('icon'), { clientX: 210, button: 0 });
  expect(thumb.getAttribute('aria-valuenow')).toBe('50');
  fireEvent.pointerMove(track, { clientX: 244 });
  const expected = thumbEdge === 'contain' ? '70' : '67';
  expect(thumb.getAttribute('aria-valuenow')).toBe(expected);
  fireEvent.pointerUp(track, { clientX: 244 });
  expect(thumb.getAttribute('aria-valuenow')).toBe(expected);
});

it.each([
  -10, 10
])('does not change the committed value when grabbing at offset %s without moving', (offset) => {
  const onValueChange = vi.fn();
  const { thumb, track } = setup({ onValueChange });
  fireEvent.pointerDown(thumb, { clientX: 200 + offset, button: 0 });
  fireEvent.pointerUp(track, { clientX: 200 + offset });
  expect(thumb.getAttribute('aria-valuenow')).toBe('50');
  expect(onValueChange).not.toHaveBeenCalled();
});

it('keeps the gesture offset when range thumbs swap roles', () => {
  const { thumb, track, getAllByRole } = setup({
    selectionMode: 'range',
    defaultValue: [25, 60],
    thumbCrossing: 'swap'
  });
  fireEvent.pointerDown(thumb, { clientX: 160, button: 0 });
  fireEvent.pointerMove(track, { clientX: 260 });
  expect(getAllByRole('slider').map((e) => e.getAttribute('aria-valuenow'))).toEqual(['60', '75']);
  fireEvent.pointerMove(track, { clientX: 270 });
  fireEvent.pointerUp(track, { clientX: 270 });
  expect(getAllByRole('slider').map((e) => e.getAttribute('aria-valuenow'))).toEqual(['60', '80']);
});

it('clamps at the edge and resumes from the original offset when returning', () => {
  const { thumb, track } = setup();
  fireEvent.pointerDown(thumb, { clientX: 210, button: 0 });
  fireEvent.pointerMove(track, { clientX: 340 });
  expect(thumb.getAttribute('aria-valuenow')).toBe('100');
  fireEvent.pointerMove(track, { clientX: 290 });
  fireEvent.pointerUp(track, { clientX: 290 });
  expect(thumb.getAttribute('aria-valuenow')).toBe('90');
});

it.each([
  'snap',
  'hold',
  'stops'
] as const)('preserves %s step behavior with an off-center grab', (thumbStepBehavior) => {
  const onValueChange = vi.fn();
  const { thumb, track } = setup({ defaultValue: 40, step: 20, thumbStepBehavior, onValueChange });
  fireEvent.pointerDown(thumb, { clientX: 190, button: 0 });
  fireEvent.pointerMove(track, { clientX: 216 });
  fireEvent.pointerUp(track, { clientX: 216 });
  expect(onValueChange).toHaveBeenLastCalledWith(60);
  expect(thumb.style.getPropertyValue('--k-sld-value')).toBe(
    thumbStepBehavior === 'hold' ? '53%' : '60%'
  );
  if (thumbStepBehavior === 'hold') {
    fireEvent.pointerDown(thumb, { clientX: 216, button: 0 });
    expect(thumb.style.getPropertyValue('--k-sld-value')).toBe('53%');
  }
});

it('respects the stationary thumb when crossing is prevented', () => {
  const { thumb, track, getAllByRole } = setup({
    selectionMode: 'range',
    defaultValue: [25, 60],
    thumbCrossing: 'prevent'
  });
  fireEvent.pointerDown(thumb, { clientX: 160, button: 0 });
  fireEvent.pointerMove(track, { clientX: 260 });
  fireEvent.pointerUp(track, { clientX: 260 });
  expect(getAllByRole('slider').map((e) => e.getAttribute('aria-valuenow'))).toEqual(['60', '60']);
});

it.each([
  'pointerUp',
  'pointerCancel'
] as const)('resets the offset after %s so track clicks still target the cursor', (endEvent) => {
  const { thumb, track } = setup();
  fireEvent.pointerDown(thumb, { clientX: 210, button: 0 });
  fireEvent[endEvent](track, { clientX: 210 });
  fireEvent.pointerDown(track, { clientX: 240, button: 0 });
  fireEvent.pointerUp(track, { clientX: 240 });
  expect(thumb.getAttribute('aria-valuenow')).toBe('70');
});
