/** @vitest-environment jsdom */
import { act, cleanup, render } from '@testing-library/react';
import { createElement as h, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { SurfaceContextProvider } from '../../shared/contexts/SurfaceContext.tsx';
import { Slider } from './Slider.tsx';

vi.mock('../RollingNumber/RollingNumber.tsx', () => ({
  RollingNumber: () => null
}));

const resizeCallbacks = new Set<() => void>();
let renderedIndicatorHeight = 24;

class ResizeObserverMock implements ResizeObserver {
  readonly notify: () => void;

  constructor(callback: ResizeObserverCallback) {
    this.notify = () => callback([], this);
    resizeCallbacks.add(this.notify);
  }

  disconnect() {
    resizeCallbacks.delete(this.notify);
  }

  observe() {}

  unobserve() {}
}

function createContextValue(): KiskadeeContextValue {
  return {
    classesMap: {},
    segment: 'global',
    theme: 'light',
    setSegment: () => {},
    setTheme: () => {},
    designSystem: 'slider-test',
    setDesignSystem: () => {},
    global: {
      radius: 'rounded'
    }
  };
}

function renderSlider(node: ReactElement) {
  return render(
    h(
      KiskadeeContext.Provider,
      {
        value: createContextValue()
      },
      node
    )
  );
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    const height = this.classList.contains('value-indicator-test') ? renderedIndicatorHeight : 0;
    return {
      bottom: height,
      height,
      left: 0,
      right: 0,
      toJSON: () => ({}),
      top: 0,
      width: 0,
      x: 0,
      y: 0
    };
  });

  const style = document.createElement('style');
  style.dataset.sliderTest = 'true';
  style.textContent = '.value-indicator-test { --k-mgt: 18px; --k-bxh: 24px; height: 24px; }';
  document.head.appendChild(style);
});

afterEach(() => {
  cleanup();
  document.querySelector('style[data-slider-test]')?.remove();
  resizeCallbacks.clear();
  renderedIndicatorHeight = 24;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Slider value indicator lane', () => {
  it('uses the rendered indicator height and updates when typography grows', () => {
    const { container } = renderSlider(
      h(Slider, {
        'aria-label': 'Volume',
        classNames: {
          e14: 'value-indicator-test'
        },
        valueDisplay: 'tooltip'
      })
    );
    const root = container.querySelector<HTMLElement>('.k-sld-e1-a');

    expect(root?.style.getPropertyValue('--k-sld-value-indicator-lane')).toBe(
      'calc(18px + max(0px, 24px - 24px))'
    );

    renderedIndicatorHeight = 40;
    act(() => {
      for (const notifyResize of resizeCallbacks) notifyResize();
    });

    expect(root?.style.getPropertyValue('--k-sld-value-indicator-lane')).toBe(
      'calc(18px + max(0px, 40px - 24px))'
    );
  });
});

it('selects the inherited surface palette as the nearest painted context changes', () => {
  const context: KiskadeeContextValue = {
    ...createContextValue(),
    classesMap: {
      slider: {
        standard: {
          base: {
            e9: {
              c: {
                s: { neutral: { m: 'subtle-active-track' } },
                v: { neutral: { m: 'vivid-active-track' } }
              }
            },
            e11: {
              c: {
                s: { neutral: { m: 'subtle-thumb-inner' } },
                v: { neutral: { m: 'vivid-thumb-inner' } }
              }
            }
          }
        }
      }
    }
  };
  const tree = (surfaceContext: 'onSubtle' | 'onVivid') =>
    h(
      KiskadeeContext.Provider,
      { value: context },
      h(
        SurfaceContextProvider,
        { value: surfaceContext },
        h(Slider, { 'aria-label': 'Volume', defaultValue: 50 })
      )
    );
  const view = render(tree('onVivid'));
  expect(view.container.querySelector('.k-sld-e9-a')?.className).toContain('vivid-active-track');
  expect(view.container.querySelector('.k-sld-e11-a')?.className).toContain('vivid-thumb-inner');
  view.rerender(tree('onSubtle'));
  expect(view.container.querySelector('.k-sld-e9-a')?.className).toContain('subtle-active-track');
  expect(view.container.querySelector('.k-sld-e11-a')?.className).toContain('subtle-thumb-inner');
});
