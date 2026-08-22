/** @vitest-environment jsdom */

import type { PresenceProfiles } from '@kiskadee/core';
import { act, cleanup, render } from '@testing-library/react';
import type { HTMLAttributes } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DropdownPresenceEffect } from './DropdownPresence.effect.tsx';

type FakeMotionProps = HTMLAttributes<HTMLDivElement> & {
  animate?: unknown;
  initial?: unknown;
  onAnimationComplete?: () => void;
  transition?: unknown;
};

vi.mock('motion/react', async () => {
  const React = await import('react');
  const MotionDiv = React.forwardRef<HTMLDivElement, FakeMotionProps>(function MotionDiv(
    {
      animate,
      initial: _initial,
      onAnimationComplete: _onAnimationComplete,
      style,
      transition,
      ...props
    },
    ref
  ) {
    return React.createElement('div', {
      ...props,
      ref,
      'data-animate': JSON.stringify(animate),
      'data-style-owns-opacity': String(Object.hasOwn(style ?? {}, 'opacity')),
      'data-transition': JSON.stringify(transition),
      style
    });
  });

  return {
    motion: { div: MotionDiv },
    useReducedMotion: () => false
  };
});

const profiles: PresenceProfiles = {
  'fade-translate': {
    distancePx: 12,
    enterDurationMs: 180,
    exitDurationMs: 90,
    enterEasing: 'ease-out',
    exitEasing: 'ease-in'
  },
  'grow-height': {
    enterDurationMs: 180,
    exitDurationMs: 120,
    enterEasing: 'ease-out',
    exitEasing: 'ease-in'
  }
};

let frameId = 0;
let frames = new Map<number, FrameRequestCallback>();

function flushAnimationFrame(): void {
  const pending = [...frames.values()];
  frames.clear();
  act(() => {
    for (const callback of pending) callback(0);
  });
}

function readAnimation(element: HTMLElement): Record<string, number | string> {
  return JSON.parse(element.dataset.animate ?? '{}') as Record<string, number | string>;
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'development');
  frames = new Map();
  frameId = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frameId += 1;
    frames.set(frameId, callback);
    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames.delete(id);
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('DropdownPresenceEffect placement staging', () => {
  it('uses the resolved top placement before starting fade-translate', () => {
    const renderEffect = (positioned: boolean, placement: 'bottom-start' | 'top-start') => (
      <DropdownPresenceEffect
        onExitComplete={vi.fn()}
        open
        positioned={positioned}
        placement={placement}
        profile="fade-translate"
        profiles={profiles}
        surfaceProps={{ ref: null, 'data-testid': 'surface', children: 'Content' }}
      />
    );
    const result = render(renderEffect(false, 'bottom-start'));
    const surface = result.getByTestId('surface');

    expect(surface.style.opacity).toBe('0');
    expect(surface.style.pointerEvents).toBe('none');
    expect(surface.style.visibility).toBe('');
    expect(readAnimation(surface)).toMatchObject({ opacity: 0, x: 0, y: 0 });

    result.rerender(renderEffect(true, 'top-start'));
    expect(surface.style.opacity).toBe('0');
    expect(readAnimation(surface)).toMatchObject({ opacity: 0, x: 0, y: 12 });

    flushAnimationFrame();
    expect(surface.style.opacity).toBe('0');
    flushAnimationFrame();
    expect(surface.style.opacity).toBe('');
    expect(surface.style.pointerEvents).toBe('');
    expect(readAnimation(surface)).toMatchObject({ opacity: 1, x: 0, y: 0 });
  });

  it('returns opacity ownership to Motion before animating the exit', () => {
    const renderEffect = (open: boolean) => (
      <DropdownPresenceEffect
        onExitComplete={vi.fn()}
        open={open}
        positioned
        placement="bottom-start"
        profile="fade-translate"
        profiles={profiles}
        surfaceProps={{ ref: null, 'data-testid': 'surface', children: 'Content' }}
      />
    );
    const result = render(renderEffect(true));
    const surface = result.getByTestId('surface');

    flushAnimationFrame();
    flushAnimationFrame();
    expect(surface.dataset.styleOwnsOpacity).toBe('false');

    result.rerender(renderEffect(false));
    expect(surface.dataset.styleOwnsOpacity).toBe('false');
    expect(readAnimation(surface)).toMatchObject({ opacity: 0, x: 0, y: -12 });
  });

  it('reserves natural height and grows upward after a top placement resolves', () => {
    const renderEffect = (positioned: boolean, placement: 'bottom-start' | 'top-start') => (
      <DropdownPresenceEffect
        onExitComplete={vi.fn()}
        open
        positioned={positioned}
        placement={placement}
        profile="grow-height"
        profiles={profiles}
        surfaceProps={{ ref: null, 'data-testid': 'surface', children: 'Content' }}
      />
    );
    const result = render(renderEffect(false, 'bottom-start'));
    const surface = result.getByTestId('surface');
    const positioner = surface.parentElement;
    expect(positioner).not.toBeNull();
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ height: 240 } as DOMRect);

    expect(surface.style.opacity).toBe('0');
    expect(surface.style.pointerEvents).toBe('none');
    expect(surface.style.visibility).toBe('');
    expect(readAnimation(surface)).toMatchObject({ height: 'auto' });

    result.rerender(renderEffect(true, 'top-start'));
    expect(positioner?.style.minHeight).toBe('240px');
    expect(positioner?.style.display).toBe('flex');
    expect(positioner?.style.justifyContent).toBe('flex-end');
    expect(surface.style.opacity).toBe('0');
    expect(surface.style.height).toBe('0px');
    expect(readAnimation(surface)).toMatchObject({ height: 0 });

    flushAnimationFrame();
    expect(surface.style.opacity).toBe('0');
    flushAnimationFrame();
    expect(surface.style.opacity).toBe('');
    expect(surface.style.pointerEvents).toBe('');
    expect(readAnimation(surface)).toMatchObject({ height: 'auto' });
  });

  it.each([
    'right-end',
    'left-end'
  ] as const)('grows upward when a lateral submenu resolves to %s', (resolvedPlacement) => {
    const initialPlacement = resolvedPlacement === 'right-end' ? 'right-start' : 'left-start';
    const renderEffect = (
      positioned: boolean,
      placement: 'right-start' | 'right-end' | 'left-start' | 'left-end'
    ) => (
      <DropdownPresenceEffect
        onExitComplete={vi.fn()}
        open
        positioned={positioned}
        placement={placement}
        profile="grow-height"
        profiles={profiles}
        surfaceProps={{ ref: null, 'data-testid': 'surface', children: 'Content' }}
      />
    );
    const result = render(renderEffect(false, initialPlacement));
    const surface = result.getByTestId('surface');
    const positioner = surface.parentElement;
    expect(positioner).not.toBeNull();
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ height: 180 } as DOMRect);

    result.rerender(renderEffect(true, resolvedPlacement));

    expect(positioner?.style.minHeight).toBe('180px');
    expect(positioner?.style.justifyContent).toBe('flex-end');
    expect(surface.style.height).toBe('0px');
    expect(readAnimation(surface)).toMatchObject({ height: 0 });

    flushAnimationFrame();
    flushAnimationFrame();
    expect(readAnimation(surface)).toMatchObject({ height: 'auto' });
  });
});
