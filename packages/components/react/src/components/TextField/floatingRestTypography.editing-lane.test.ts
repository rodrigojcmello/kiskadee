/** @vitest-environment jsdom */
import { stateActivator } from '@kiskadee/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindFloatingRestTypography } from './floatingRestTypography.runtime.ts';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('floating TextField central editing lane', () => {
  it.each([
    { mode: 'notched', inputPadding: 0, initialClearance: 16 },
    { mode: 'inside', inputPadding: 10, initialClearance: 6 }
  ])('preserves enlarged-text clearance and shell-relative offsets in $mode', async (example) => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        disconnect = disconnect;
      }
    );
    const root = document.createElement('div');
    root.dataset.textFieldRoot = '';
    const control = document.createElement('div');
    control.dataset.textFieldControl = '';
    control.style.setProperty('--k-bxh', '40px');
    control.style.paddingBlock = '0px';
    const lane = document.createElement('span');
    lane.dataset.textFieldEditingLane = '';
    lane.style.paddingBlockStart = '8px';
    lane.style.paddingBlockEnd = '4px';
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.style.fontSize = '28px';
    input.style.lineHeight = '36px';
    input.style.paddingBlockStart = '0px';
    input.style.paddingBlockEnd = '0px';
    input.value = 'Preserved';
    lane.append(input);
    control.append(label, lane);
    root.append(control);
    document.body.append(root);
    Object.defineProperty(input, 'offsetParent', { value: lane });
    Object.defineProperty(input, 'offsetTop', { value: 0 });
    Object.defineProperty(input, 'clientWidth', { value: 140 });
    vi.spyOn(control, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 10,
      right: 210
    } as DOMRect);
    const getClearance = () =>
      Number.parseFloat(control.style.getPropertyValue('--k-txf-fbo')) || 0;
    vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() => {
      const lineHeight = Number.parseFloat(input.style.lineHeight);
      const padding = Number.parseFloat(input.style.paddingBlockStart);
      return {
        top:
          100 +
          Number.parseFloat(lane.style.paddingBlockStart) +
          (root.classList.contains(stateActivator.filled) ? getClearance() : 0),
        left: 40,
        right: 180,
        height: lineHeight + padding
      } as DOMRect;
    });
    let labelHeight = 24;
    vi.spyOn(label, 'getBoundingClientRect').mockImplementation(
      () => ({ bottom: 100 + labelHeight }) as DOMRect
    );
    input.focus();
    input.setSelectionRange(1, 4);

    const dispose = bindFloatingRestTypography({ labelElement: label, inputElement: input });
    expect(label.style.getPropertyValue('--k-txf-rbt')).toBe('8px');
    expect(label.style.getPropertyValue('--k-txf-ris')).toBe('30px');
    expect(label.style.getPropertyValue('--k-txf-riw')).toBe('140px');
    expect(observe).toHaveBeenCalledWith(lane);

    input.style.paddingBlockStart = `${example.inputPadding}px`;
    root.className = stateActivator.filled;
    await vi.waitFor(() => expect(getClearance()).toBe(example.initialClearance));
    const inputLineTop =
      input.getBoundingClientRect().top + Number.parseFloat(input.style.paddingBlockStart);
    expect(inputLineTop).toBe(124);

    labelHeight = 32;
    input.style.fontSize = '36px';
    input.style.lineHeight = '44px';
    await vi.waitFor(() => expect(getClearance()).toBe(example.initialClearance + 8));
    lane.style.paddingBlockStart = '12px';
    await vi.waitFor(() => expect(getClearance()).toBe(example.initialClearance + 4));
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('Preserved');
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4]);

    root.className = '';
    input.style.paddingBlockStart = '0px';
    await vi.waitFor(() => expect(getClearance()).toBe(0));
    expect(label.style.getPropertyValue('--k-txf-rbt')).toBe('12px');
    dispose();
    expect(disconnect).toHaveBeenCalled();
    expect(label.style.getPropertyValue('--k-txf-rbt')).toBe('');
    expect(control.style.getPropertyValue('--k-txf-fbo')).toBe('');
  });
});
