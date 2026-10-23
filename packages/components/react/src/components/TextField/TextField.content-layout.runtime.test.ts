/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindTextFieldContentLayout } from './TextField.content-layout.runtime.ts';

const resizeObservers: Array<{
  targets: Set<Element>;
  callback: () => void;
}> = [];

afterEach(() => {
  document.body.replaceChildren();
  resizeObservers.length = 0;
  Reflect.deleteProperty(document, 'fonts');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height
  } as DOMRect;
}

function createField() {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      targets = new Set<Element>();
      constructor(public callback: () => void) {
        resizeObservers.push(this);
      }
      observe(target: Element) {
        this.targets.add(target);
      }
      unobserve(target: Element) {
        this.targets.delete(target);
      }
      disconnect() {
        this.targets.clear();
      }
    }
  );
  const control = document.createElement('div');
  const region = document.createElement('span');
  const action = document.createElement('span');
  const button = document.createElement('button');
  const input = document.createElement('input');
  region.dataset.textFieldContent = 'start';
  action.dataset.textFieldAction = '';
  button.textContent = 'Send';
  button.style.padding = '5px 11px';
  action.append(button);
  region.append(action);
  control.append(region, input);
  control.style.direction = 'ltr';
  control.style.borderTop = '1px solid';
  control.style.borderBottom = '3px solid';
  control.style.borderLeft = '2px solid';
  control.style.borderRight = '4px solid';
  control.style.borderTopLeftRadius = '8px';
  control.style.borderTopRightRadius = '10px';
  document.body.append(control);
  const measureControl = vi
    .spyOn(control, 'getBoundingClientRect')
    .mockReturnValue(rect(100, 10, 200, 44));
  let actionHeight = 28;
  const isPhysicalStart = () =>
    (region.dataset.textFieldContent === 'start') !== (control.style.direction === 'rtl');
  const measureRegion = () => {
    const inlineOffset = Number.parseFloat(region.style.getPropertyValue('--k-txf-aio')) || 0;
    const left = isPhysicalStart() ? 110 + inlineOffset : 250 - inlineOffset;
    return rect(left, 33 - actionHeight / 2, 36, actionHeight);
  };
  vi.spyOn(region, 'getBoundingClientRect').mockImplementation(measureRegion);
  vi.spyOn(action, 'getBoundingClientRect').mockImplementation(() => {
    const regionRect = measureRegion();
    const blockOffset = Number.parseFloat(region.style.getPropertyValue('--k-txf-abo')) || 0;
    return rect(regionRect.left, regionRect.top + blockOffset, 36, actionHeight);
  });
  vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() => {
    const regionRect = measureRegion();
    const left = isPhysicalStart() ? regionRect.right + 8 : 104;
    const right = isPhysicalStart() ? 296 : regionRect.left - 8;
    return rect(left, 20, right - left, 20);
  });
  return {
    control,
    region,
    action,
    button,
    input,
    measureControl,
    setActionHeight(height: number) {
      actionHeight = height;
    }
  };
}

function notifyResize(target: Element) {
  for (const observer of resizeObservers) {
    if (observer.targets.has(target)) observer.callback();
  }
}

describe('TextField content layout geometry', () => {
  it('ignores unrelated ancestor styles while retaining local geometry updates', async () => {
    const { control, input, measureControl } = createField();
    const dispose = bindTextFieldContentLayout({ controlElement: control, inputElement: input });
    const measurements = measureControl.mock.calls.length;
    document.body.classList.add('scroll-locked');
    document.body.style.overflow = 'hidden';
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    expect(measureControl).toHaveBeenCalledTimes(measurements);
    control.style.borderTopLeftRadius = '12px';
    await vi.waitFor(() => expect(measureControl.mock.calls.length).toBeGreaterThan(measurements));
    dispose();
    document.body.classList.remove('scroll-locked');
    document.body.style.removeProperty('overflow');
  });

  it('uses the inner shell box for uniform action clearance and independent full-height paint', async () => {
    const { control, region, action, button, input, measureControl } = createField();
    const dispose = bindTextFieldContentLayout({ controlElement: control, inputElement: input });
    expect(region.style.getPropertyValue('--k-txf-aio')).toBe('-2px');
    expect(region.style.getPropertyValue('--k-txf-abo')).toBe('-2px');
    expect(region.style.getPropertyValue('--k-txf-rbs')).toBe('8px');
    expect(region.style.getPropertyValue('--k-txf-rbe')).toBe('4px');
    expect(region.style.getPropertyValue('--k-txf-rio')).toBe('6px');
    expect(region.style.getPropertyValue('--k-txf-rii')).toBe('4px');
    expect(region.style.getPropertyValue('--k-txf-rr')).toBe('6px');
    const initialMeasurements = measureControl.mock.calls.length;
    notifyResize(action);
    await vi.waitFor(() =>
      expect(measureControl.mock.calls.length).toBeGreaterThan(initialMeasurements)
    );
    expect(region.style.getPropertyValue('--k-txf-aio')).toBe('-2px');
    expect(region.style.getPropertyValue('--k-txf-abo')).toBe('-2px');
    expect(button.style.cssText).toBe('padding: 5px 11px;');
    expect(action.style.cssText).toBe('');

    const settledMeasurements = measureControl.mock.calls.length;
    input.value = 'Typed';
    input.setAttribute('value', 'Typed');
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    expect(measureControl.mock.calls.length).toBe(settledMeasurements);
    dispose();
    expect(region.style.cssText).toBe('');
  });

  it('tracks actual action size, direction, and same-width movement between the regions', async () => {
    const { control, region, action, input, setActionHeight } = createField();
    const dispose = bindTextFieldContentLayout({ controlElement: control, inputElement: input });
    setActionHeight(32);
    notifyResize(action);
    await vi.waitFor(() => expect(region.style.getPropertyValue('--k-txf-aio')).toBe('-4px'));
    expect(region.style.getPropertyValue('--k-txf-rio')).toBe('4px');

    control.style.direction = 'rtl';
    await vi.waitFor(() => expect(region.style.getPropertyValue('--k-txf-aio')).toBe('-6px'));
    expect(region.style.getPropertyValue('--k-txf-rio')).toBe('4px');

    control.append(region);
    region.dataset.textFieldContent = 'end';
    await vi.waitFor(() => expect(region.style.getPropertyValue('--k-txf-aio')).toBe('-4px'));
    expect(region.style.getPropertyValue('--k-txf-rio')).toBe('4px');
    dispose();
  });

  it('clears action adjustment for mixed content while preserving region paint and passive geometry', async () => {
    const { control, region, action, input } = createField();
    const dispose = bindTextFieldContentLayout({ controlElement: control, inputElement: input });
    const passive = document.createElement('span');
    passive.textContent = 'R$';
    region.prepend(passive);
    await vi.waitFor(() => expect(region.style.getPropertyValue('--k-txf-aio')).toBe(''));
    expect(region.style.getPropertyValue('--k-txf-abo')).toBe('');
    expect(region.style.getPropertyValue('--k-txf-rio')).toBe('8px');
    expect(passive.style.cssText).toBe('');
    expect(resizeObservers.every((observer) => !observer.targets.has(action))).toBe(true);

    region.remove();
    await vi.waitFor(() => expect(region.style.cssText).toBe(''));
    dispose();
  });

  it('responds to font readiness and loading, then disconnects queued work and observations', async () => {
    const { control, region, input, measureControl, setActionHeight } = createField();
    let resolveFonts: (() => void) | undefined;
    const fonts = Object.assign(new EventTarget(), {
      ready: new Promise<void>((resolve) => {
        resolveFonts = resolve;
      })
    });
    Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });
    const dispose = bindTextFieldContentLayout({ controlElement: control, inputElement: input });
    setActionHeight(32);
    resolveFonts?.();
    await vi.waitFor(() => expect(region.style.getPropertyValue('--k-txf-aio')).toBe('-4px'));
    setActionHeight(28);
    fonts.dispatchEvent(new Event('loadingdone'));
    await vi.waitFor(() => expect(region.style.getPropertyValue('--k-txf-aio')).toBe('-2px'));
    window.dispatchEvent(new Event('resize'));
    dispose();
    const measurements = measureControl.mock.calls.length;
    fonts.dispatchEvent(new Event('loadingdone'));
    control.className = 'changed-after-dispose';
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    expect(measureControl.mock.calls.length).toBe(measurements);
    expect(region.style.cssText).toBe('');
    expect(resizeObservers.every((observer) => observer.targets.size === 0)).toBe(true);
  });
});
