/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getTextFieldInlineStartOffset,
  observeTextFieldContentLayout,
  observeTextFieldDirection
} from './TextField.direction.runtime.ts';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function createControl() {
  const ancestor = document.createElement('div');
  const control = document.createElement('div');
  const input = document.createElement('input');
  control.append(input);
  ancestor.append(control);
  document.body.append(ancestor);
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue({
    left: 10,
    right: 210
  } as DOMRect);
  vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
    left: 40,
    right: 160
  } as DOMRect);
  return { ancestor, control, input };
}

describe('TextField logical inline direction', () => {
  it('shares one effective-direction read and disconnects after the last subscriber', async () => {
    const { ancestor, control } = createControl();
    const read = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ direction: 'ltr' } as CSSStyleDeclaration);
    const first = vi.fn();
    const second = vi.fn();
    const stopFirst = observeTextFieldDirection(control, first);
    const stopSecond = observeTextFieldDirection(control, second);
    expect(read).toHaveBeenCalledTimes(1);
    read.mockClear();
    ancestor.className = 'unrelated';
    await Promise.resolve();
    expect(read).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    read.mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration);
    ancestor.dir = 'rtl';
    await vi.waitFor(() => expect(first).toHaveBeenCalledOnce());
    expect(second).toHaveBeenCalledOnce();
    stopFirst();
    read.mockReturnValue({ direction: 'ltr' } as CSSStyleDeclaration);
    ancestor.dir = 'ltr';
    await vi.waitFor(() => expect(second).toHaveBeenCalledTimes(2));
    expect(first).toHaveBeenCalledOnce();
    stopSecond();
    read.mockClear();
    ancestor.className = 'after-cleanup';
    await Promise.resolve();
    expect(read).not.toHaveBeenCalled();
  });

  it('measures the input from the shell start independently of input direction', () => {
    const { control, input } = createControl();
    control.style.direction = 'ltr';
    input.dir = 'rtl';
    expect(getTextFieldInlineStartOffset(control, input)).toBe(30);

    control.style.direction = 'rtl';
    input.dir = 'ltr';
    expect(getTextFieldInlineStartOffset(control, input)).toBe(50);
  });

  it('updates only when effective inherited direction changes and disconnects cleanly', async () => {
    const { ancestor, control, input } = createControl();
    // Model inherited direction explicitly because jsdom does not resolve inherited dir attributes.
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element) =>
        ({
          direction:
            element.closest('[dir]')?.getAttribute('dir') ??
            (element.closest('.rtl') ? 'rtl' : 'ltr')
        }) as CSSStyleDeclaration
    );
    const onChange = vi.fn();
    const disconnect = observeTextFieldDirection(control, onChange);

    input.dir = 'rtl';
    ancestor.className = 'unrelated';
    await Promise.resolve();
    expect(onChange).not.toHaveBeenCalled();

    ancestor.dir = 'rtl';
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(getTextFieldInlineStartOffset(control, input)).toBe(50);

    ancestor.dir = 'ltr';
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));

    ancestor.removeAttribute('dir');
    ancestor.className = 'rtl';
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(3));

    disconnect();
    ancestor.dir = 'ltr';
    await Promise.resolve();
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('observes region content and movement without reacting to native input values', async () => {
    const { control, input } = createControl();
    const region = document.createElement('span');
    region.dataset.textFieldContent = 'end';
    region.textContent = 'Copy';
    control.append(region);
    const observe = vi.fn();
    const disconnectResize = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        disconnect = disconnectResize;
      }
    );
    const onChange = vi.fn();
    const disconnect = observeTextFieldContentLayout(control, onChange);
    expect(observe).toHaveBeenCalledWith(region);
    expect(observe).not.toHaveBeenCalledWith(input);

    input.value = 'Changed';
    input.setAttribute('value', 'Changed');
    await Promise.resolve();
    expect(onChange).not.toHaveBeenCalled();

    (region.firstChild as Text).data = 'Send';
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));

    control.insertBefore(region, input);
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));

    region.dataset.textFieldContent = 'start';
    await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(3));

    disconnect();
    (region.firstChild as Text).data = 'Copy';
    await Promise.resolve();
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(disconnectResize).toHaveBeenCalled();
  });
});
