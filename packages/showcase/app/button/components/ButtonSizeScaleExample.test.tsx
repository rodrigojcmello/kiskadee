/** @vitest-environment jsdom */
import type { HTMLAttributes, ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ButtonSizeScaleExample,
  formatButtonHeight,
  hasButtonHeightMismatch,
  observeButtonBorderBoxHeight,
  resolveButtonExpectedHeight
} from './ButtonSizeScaleExample';

vi.mock('@kiskadee/react-components/text', async () => {
  const { createElement } = await import('react');
  return {
    Text: ({
      as = 'span',
      profile: _profile,
      foreground: _foreground,
      emphasis: _emphasis,
      ...props
    }: HTMLAttributes<HTMLElement> & {
      as?: 'span' | 'p';
      profile: string;
      foreground?: string;
      emphasis?: string;
    }) => createElement(as, props)
  };
});

vi.mock('@/utils/showcase-text-profiles', () => ({
  useShowcaseTextProfiles: () => ({ caption: 'test-caption' })
}));

const originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts');
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let reactRoot: Root | undefined;
let renderedContainer: HTMLDivElement | undefined;

function render(node: ReactNode) {
  const container = document.createElement('div');
  renderedContainer = container;
  document.body.append(container);
  const root = createRoot(container);
  reactRoot = root;
  act(() => root.render(node));
  return { container, rerender: (next: ReactNode) => act(() => root.render(next)) };
}
const observers: Array<{
  callback: () => void;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}> = [];
const disposers = new Set<() => void>();
let measuredHeight = 31.984375;

beforeEach(() => {
  measuredHeight = 31.984375;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ height: measuredHeight }) as DOMRect
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(public callback: () => void) {
        observers.push(this);
      }
    }
  );
});

afterEach(() => {
  act(() => reactRoot?.unmount());
  reactRoot = undefined;
  renderedContainer?.remove();
  renderedContainer = undefined;
  for (const dispose of disposers) dispose();
  disposers.clear();
  observers.length = 0;
  if (originalFonts) Object.defineProperty(document, 'fonts', originalFonts);
  else Reflect.deleteProperty(document, 'fonts');
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function createFonts() {
  let resolveReady: (() => void) | undefined;
  const fonts = Object.assign(new EventTarget(), {
    ready: new Promise<void>((resolve) => {
      resolveReady = resolve;
    })
  });
  Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });
  return { fonts, resolveReady: () => resolveReady?.() };
}

function observe(button: HTMLButtonElement, onHeight: (height: number) => void) {
  const dispose = observeButtonBorderBoxHeight(button, onHeight);
  disposers.add(dispose);
  return dispose;
}

describe('Button inspection height reference', () => {
  it('uses the explicit scale key or the one published scalar without nearby-size fallbacks', () => {
    expect(resolveButtonExpectedHeight(30.5, 's:lg:3')).toBe(30.5);
    const reference = { 's:sm:1': 24, 's:md:1': 32 };
    expect(resolveButtonExpectedHeight(reference, 's:sm:1')).toBe(24);
    expect(resolveButtonExpectedHeight(reference, 's:md:1')).toBe(32);
    expect(resolveButtonExpectedHeight(reference, 's:sm:2')).toBeUndefined();
    expect(resolveButtonExpectedHeight(reference, 's:lg:1')).toBeUndefined();
    expect(resolveButtonExpectedHeight(undefined, 's:md:1')).toBeUndefined();
  });

  it.each([
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY
  ])('rejects an invalid reference %s', (height) => {
    expect(resolveButtonExpectedHeight(height, 's:md:1')).toBeUndefined();
    expect(resolveButtonExpectedHeight({ 's:md:1': height }, 's:md:1')).toBeUndefined();
  });

  it('compares unrounded CSS-pixel measurements at the strict quarter-pixel threshold', () => {
    expect(formatButtonHeight(31.984375)).toBe('31.98');
    expect(hasButtonHeightMismatch(32, 32.25)).toBe(false);
    expect(hasButtonHeightMismatch(32, 31.75)).toBe(false);
    expect(hasButtonHeightMismatch(32, 32.250001)).toBe(true);
    expect(hasButtonHeightMismatch(32, 31.749999)).toBe(true);
    expect(hasButtonHeightMismatch(undefined, 32)).toBe(false);
    expect(hasButtonHeightMismatch(32, undefined)).toBe(false);
  });
});

describe('Button border-box observation', () => {
  it('measures the actual button precisely and batches resize, font, and viewport notifications', async () => {
    const { fonts, resolveReady } = createFonts();
    const button = document.createElement('button');
    button.style.padding = '3px 7px';
    document.body.append(button);
    const onHeight = vi.fn();
    observe(button, onHeight);
    expect(onHeight).toHaveBeenLastCalledWith(31.984375);
    expect(observers[0].observe).toHaveBeenCalledWith(button, { box: 'border-box' });

    measuredHeight = 32.625;
    observers[0].callback();
    fonts.dispatchEvent(new Event('loadingdone'));
    window.dispatchEvent(new Event('resize'));
    await vi.waitFor(() => expect(onHeight).toHaveBeenCalledTimes(2));
    expect(onHeight).toHaveBeenLastCalledWith(32.625);

    measuredHeight = 33.125;
    resolveReady();
    await vi.waitFor(() => expect(onHeight).toHaveBeenCalledTimes(3));
    expect(onHeight).toHaveBeenLastCalledWith(33.125);
    expect(button.style.cssText).toBe('padding: 3px 7px;');
  });

  it('shares document listeners and cancels delayed work when the last observed button is removed', async () => {
    const { fonts, resolveReady } = createFonts();
    const addFontListener = vi.spyOn(fonts, 'addEventListener');
    const removeFontListener = vi.spyOn(fonts, 'removeEventListener');
    const addWindowListener = vi.spyOn(window, 'addEventListener');
    const removeWindowListener = vi.spyOn(window, 'removeEventListener');
    const first = document.createElement('button');
    const second = document.createElement('button');
    const onFirst = vi.fn();
    const onSecond = vi.fn();
    const disposeFirst = observe(first, onFirst);
    const disposeSecond = observe(second, onSecond);
    expect(addFontListener).toHaveBeenCalledOnce();
    expect(addWindowListener.mock.calls.filter(([type]) => type === 'resize')).toHaveLength(1);

    disposeFirst();
    expect(removeFontListener).not.toHaveBeenCalled();
    observers[1].callback();
    disposeSecond();
    expect(removeFontListener).toHaveBeenCalledOnce();
    expect(removeWindowListener.mock.calls.filter(([type]) => type === 'resize')).toHaveLength(1);
    resolveReady();
    fonts.dispatchEvent(new Event('loadingdone'));
    window.dispatchEvent(new Event('resize'));
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    expect(onFirst).toHaveBeenCalledOnce();
    expect(onSecond).toHaveBeenCalledOnce();
    expect(observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
  });

  it('keeps font and viewport measurement available without ResizeObserver', async () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const { fonts } = createFonts();
    const onHeight = vi.fn();
    observe(document.createElement('button'), onHeight);
    measuredHeight = 35.375;
    fonts.dispatchEvent(new Event('loadingdone'));
    await vi.waitFor(() => expect(onHeight).toHaveBeenLastCalledWith(35.375));
  });
});

describe('Button Size / Scale example', () => {
  it('describes the existing button without adding a tab stop or replacing it on metadata changes', () => {
    const example = (reference: number | undefined) => (
      <ButtonSizeScaleExample scale="s:md:1" heightReference={reference}>
        {({ buttonRef, descriptionId }) => (
          <button type="button" ref={buttonRef} aria-describedby={descriptionId}>
            Medium
          </button>
        )}
      </ButtonSizeScaleExample>
    );
    const result = render(example(32));
    const button = result.container.querySelector('button') as HTMLButtonElement;
    const cell = result.container.querySelector('[data-button-size-scale]');
    const description = document.getElementById(button.getAttribute('aria-describedby') ?? '');
    expect(description?.textContent).toContain('Expected 32px.');
    expect(description?.textContent).toContain('Real 31.98px');
    expect(
      result.container.querySelector('[data-button-height-ruler]')?.getAttribute('style')
    ).toContain('block-size: 32px');
    expect(cell?.getAttribute('data-button-real-height')).toBe('31.984375');
    expect(cell?.hasAttribute('data-details-persistent')).toBe(false);
    expect(result.container.querySelector('[tabindex]')).toBeNull();
    expect(result.container.querySelectorAll('button')).toHaveLength(1);
    expect(button.getAttribute('style')).toBeNull();

    act(() => button.focus());
    result.rerender(example(30));
    expect(result.container.querySelector('button')).toBe(button);
    expect(document.activeElement).toBe(button);
    expect(cell?.hasAttribute('data-details-persistent')).toBe(true);
    expect(cell?.getAttribute('data-button-height-difference')).toBe('1.984375');
    expect(observers[0].observe).toHaveBeenCalledOnce();
  });

  it('shows the measured height and No reference without fabricating a ruler', () => {
    const result = render(
      <ButtonSizeScaleExample scale="s:sm:2" heightReference={{ 's:md:1': 32 }}>
        {({ buttonRef, descriptionId }) => (
          <button type="button" ref={buttonRef} aria-describedby={descriptionId}>
            Small 2
          </button>
        )}
      </ButtonSizeScaleExample>
    );
    expect(result.container.querySelector('[aria-hidden="true"]')?.textContent).toBe(
      'No reference'
    );
    expect(result.container.querySelector('[data-button-height-ruler]')).toBeNull();
    expect(result.container.querySelector('[data-button-expected-height]')).toBeNull();
    expect(result.container.querySelector('[data-details-persistent]')).toBeTruthy();
    expect(result.container.textContent).toContain('Real 31.98px');
  });
});
