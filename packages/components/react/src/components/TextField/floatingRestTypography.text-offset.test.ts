/** @vitest-environment jsdom */
import { stateActivator } from '@kiskadee/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindFloatingRestTypography } from './floatingRestTypography.runtime.ts';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function createField() {
  const root = document.createElement('div');
  root.dataset.textFieldRoot = '';
  const control = document.createElement('div');
  const label = document.createElement('label');
  const input = document.createElement('input');
  const region = document.createElement('span');
  const text = document.createElement('bdi');
  text.textContent = 'R$';
  region.dataset.textFieldContent = 'start';
  region.append(text);
  input.style.fontSize = '14px';
  input.style.lineHeight = '20px';
  control.append(label, region, input);
  root.append(control);
  document.body.append(root);
  Object.defineProperty(input, 'clientHeight', { value: 30 });
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    left: 0,
    right: 200
  } as DOMRect);
  return { root, control, label, input, region, text };
}

describe('floating TextField passive text alignment', () => {
  it('aligns with the padded editable line using fractional geometry without accumulating offsets', async () => {
    const { control, label, input, region, text } = createField();
    input.style.paddingBlockStart = '10px';
    input.style.paddingBlockEnd = '0px';
    input.style.borderBlockStartWidth = '0px';
    input.style.borderBlockEndWidth = '0px';
    control.style.setProperty('--k-bxh', '48px');
    const measureInput = vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
      top: 507.203,
      height: 29.984,
      left: 40,
      right: 190
    } as DOMRect);
    vi.spyOn(region, 'getBoundingClientRect').mockReturnValue({
      top: 503.219,
      height: 19.984
    } as DOMRect);

    const dispose = bindFloatingRestTypography({ labelElement: label, inputElement: input });
    const readOffset = () => Number.parseFloat(region.style.getPropertyValue('--k-txf-tbo'));
    expect(readOffset()).toBeCloseTo(13.984);

    const initialMeasurements = measureInput.mock.calls.length;
    text.textContent = 'BRL';
    await vi.waitFor(() =>
      expect(measureInput.mock.calls.length).toBeGreaterThan(initialMeasurements)
    );
    expect(readOffset()).toBeCloseTo(13.984);
    expect(text.style.getPropertyValue('--k-txf-tbo')).toBe('');

    region.remove();
    await vi.waitFor(() => expect(region.style.getPropertyValue('--k-txf-tbo')).toBe(''));
    control.append(region);
    await vi.waitFor(() => expect(readOffset()).toBeCloseTo(13.984));
    dispose();
    expect(region.style.getPropertyValue('--k-txf-tbo')).toBe('');
  });

  it('measures after floating clearance changes and includes asymmetric input borders', async () => {
    const { root, control, label, input, region, text } = createField();
    root.className = stateActivator.filled;
    const connectedRow = document.createElement('div');
    const connectedAction = document.createElement('button');
    root.append(connectedRow);
    connectedRow.append(control, connectedAction);
    control.style.setProperty('--k-bxh', '40px');
    control.style.paddingBlockStart = '10px';
    control.style.paddingBlockEnd = '6px';
    input.style.paddingBlockStart = '10px';
    input.style.paddingBlockEnd = '0px';
    input.style.borderBlockStartWidth = '2px';
    input.style.borderBlockEndWidth = '0px';
    const measureInput = vi.spyOn(input, 'getBoundingClientRect').mockImplementation(
      () =>
        ({
          top: 20 + Number.parseFloat(control.style.getPropertyValue('--k-txf-fbo') || '0'),
          height: 32,
          left: 40,
          right: 190
        }) as DOMRect
    );
    vi.spyOn(label, 'getBoundingClientRect').mockReturnValue({ bottom: 34 } as DOMRect);
    vi.spyOn(region, 'getBoundingClientRect').mockReturnValue({ top: 20, height: 40 } as DOMRect);

    const dispose = bindFloatingRestTypography({ labelElement: label, inputElement: input });
    expect(control.style.getPropertyValue('--k-txf-fbo')).toBe('2px');
    expect(region.style.getPropertyValue('--k-txf-tbo')).toBe('4px');

    const initialMeasurements = measureInput.mock.calls.length;
    text.textContent = 'BRL';
    await vi.waitFor(() =>
      expect(measureInput.mock.calls.length).toBeGreaterThan(initialMeasurements)
    );
    expect(region.style.getPropertyValue('--k-txf-tbo')).toBe('4px');
    expect(control.style.getPropertyValue('--k-txf-fbo')).toBe('2px');
    root.className = '';
    await vi.waitFor(() => expect(control.style.getPropertyValue('--k-txf-fbo')).toBe('0px'));
    root.className = stateActivator.filled;
    await vi.waitFor(() => expect(control.style.getPropertyValue('--k-txf-fbo')).toBe('2px'));
    dispose();
    expect(region.style.getPropertyValue('--k-txf-tbo')).toBe('');
  });
});
