/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindFloatingRestTypography } from './floatingRestTypography.runtime.ts';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('floating TextField label direction', () => {
  it('tracks the shell start when its inherited direction changes with an LTR input', async () => {
    const ancestor = document.createElement('section');
    const root = document.createElement('div');
    root.dataset.textFieldRoot = '';
    const control = document.createElement('div');
    control.dataset.textFieldControl = '';
    const lane = document.createElement('span');
    lane.dataset.textFieldEditingLane = '';
    const input = document.createElement('input');
    const label = document.createElement('label');
    input.dir = 'ltr';
    input.style.fontSize = '14px';
    input.style.lineHeight = '20px';
    control.style.setProperty('--k-bxh', '32px');
    lane.append(input);
    control.append(label, lane);
    Object.defineProperty(input, 'offsetParent', { value: lane });
    root.append(control);
    ancestor.append(root);
    document.body.append(ancestor);
    ancestor.dir = 'rtl';
    vi.spyOn(control, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      left: 10,
      right: 210
    } as DOMRect);
    vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      left: 40,
      right: 160,
      height: 20
    } as DOMRect);
    Object.defineProperty(input, 'clientWidth', { value: 120 });
    const getComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const styles = getComputedStyle(element);
      // Model browser inheritance while retaining real typography metrics in jsdom.
      styles.direction = element.closest('[dir]')?.getAttribute('dir') ?? 'ltr';
      return styles;
    });

    const dispose = bindFloatingRestTypography({ labelElement: label, inputElement: input });
    expect(label.style.getPropertyValue('--k-txf-ris')).toBe('50px');
    expect(label.style.getPropertyValue('--k-txf-riw')).toBe('120px');

    ancestor.dir = 'ltr';
    await vi.waitFor(() => expect(label.style.getPropertyValue('--k-txf-ris')).toBe('30px'));

    dispose();
    ancestor.dir = 'rtl';
    await Promise.resolve();
    expect(label.hasAttribute('data-rest-placeholder')).toBe(false);
    expect(label.style.getPropertyValue('--k-txf-ris')).toBe('');
  });

  it('remeasures a same-width input when content moves from end to start', async () => {
    const root = document.createElement('div');
    root.dataset.textFieldRoot = '';
    const control = document.createElement('div');
    const label = document.createElement('label');
    const input = document.createElement('input');
    const region = document.createElement('span');
    region.dataset.textFieldContent = 'end';
    region.textContent = '@';
    input.style.fontSize = '14px';
    input.style.lineHeight = '20px';
    control.style.setProperty('--k-bxh', '32px');
    control.append(label, input, region);
    root.append(control);
    document.body.append(root);
    vi.spyOn(control, 'getBoundingClientRect').mockReturnValue({ left: 0, right: 200 } as DOMRect);
    vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() => {
      const left = region.nextElementSibling === input ? 40 : 10;
      return { left, right: left + 150, top: 0, height: 20 } as DOMRect;
    });
    Object.defineProperty(input, 'clientWidth', { value: 150 });

    const dispose = bindFloatingRestTypography({ labelElement: label, inputElement: input });
    expect(label.style.getPropertyValue('--k-txf-ris')).toBe('10px');
    expect(label.style.getPropertyValue('--k-txf-riw')).toBe('150px');

    control.insertBefore(region, input);
    region.dataset.textFieldContent = 'start';
    await vi.waitFor(() => expect(label.style.getPropertyValue('--k-txf-ris')).toBe('40px'));
    expect(label.style.getPropertyValue('--k-txf-riw')).toBe('150px');
    dispose();
  });
});
