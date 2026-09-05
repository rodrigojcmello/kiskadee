/** @vitest-environment jsdom */

import { act, cleanup, render } from '@testing-library/react';
import type { PointerEvent, RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SwitchRuntimeMotionThumb } from './SwitchRuntimeMotion.effect.tsx';

type MotionValueStub = {
  get: () => number;
  set: (value: number) => void;
};

type CapturedMotionHandlers = {
  onDrag?: () => void;
  onDragEnd?: () => void;
  onDragStart?: () => void;
  onPointerCancel?: (event: PointerEvent<HTMLSpanElement>) => void;
};

const motionHarness = vi.hoisted(() => ({
  handlers: {} as CapturedMotionHandlers,
  value: null as MotionValueStub | null
}));

vi.mock('motion/react', async () => {
  const React = await import('react');
  const MotionSpan = React.forwardRef<HTMLSpanElement, Record<string, unknown>>(
    function MotionSpan(props, ref) {
      const {
        children,
        drag: _drag,
        dragConstraints: _dragConstraints,
        dragControls: _dragControls,
        dragElastic: _dragElastic,
        dragListener: _dragListener,
        dragMomentum: _dragMomentum,
        initial: _initial,
        onDrag,
        onDragEnd,
        onDragStart,
        onPointerCancel,
        onPointerDown: _onPointerDown,
        onPointerMove: _onPointerMove,
        onPointerUp: _onPointerUp,
        style: _style,
        ...domProps
      } = props;

      motionHarness.handlers = {
        onDrag: onDrag as CapturedMotionHandlers['onDrag'],
        onDragEnd: onDragEnd as CapturedMotionHandlers['onDragEnd'],
        onDragStart: onDragStart as CapturedMotionHandlers['onDragStart'],
        onPointerCancel: onPointerCancel as CapturedMotionHandlers['onPointerCancel']
      };

      return React.createElement('span', { ...domProps, ref }, children as React.ReactNode);
    }
  );

  return {
    animate: (value: MotionValueStub, target: number) => {
      value.set(target);
      return { stop: vi.fn() };
    },
    motion: { span: MotionSpan },
    useDragControls: () => ({ start: vi.fn() }),
    useMotionValue: (initial: number) => {
      let current = initial;
      const value: MotionValueStub = {
        get: () => current,
        set: (next) => {
          current = next;
        }
      };
      motionHarness.value = value;
      return value;
    },
    useReducedMotion: () => false
  };
});

afterEach(() => {
  cleanup();
  motionHarness.handlers = {};
  motionHarness.value = null;
});

function renderMotionThumb(options?: {
  onDragStart?: () => void;
  setControlState?: (controlState: boolean) => void;
  setDragPreviewControlState?: (controlState: boolean | null) => void;
}) {
  const setControlState = options?.setControlState ?? vi.fn();
  const setDragPreviewControlState = options?.setDragPreviewControlState ?? vi.fn();
  const track = document.createElement('span');
  const trackRef = { current: track } as RefObject<HTMLSpanElement | null>;

  render(
    <SwitchRuntimeMotionThumb
      activationMotion="standard"
      semanticControlState={false}
      isControlled={false}
      onDragStart={options?.onDragStart}
      requestSuppressNextClick={vi.fn()}
      setControlState={setControlState}
      setDragPreviewControlState={setDragPreviewControlState}
      thumbClassName="thumb"
      thumbRefCallback={() => undefined}
      thumbTranslation={20}
      trackRef={trackRef}
    />
  );

  return { setControlState, setDragPreviewControlState };
}

describe('SwitchRuntimeMotionThumb drag boundary', () => {
  it('cancels activation feedback when a drag actually starts', () => {
    const onDragStart = vi.fn();
    renderMotionThumb({ onDragStart });

    act(() => {
      motionHarness.handlers.onDragStart?.();
    });

    expect(onDragStart).toHaveBeenCalledTimes(1);
  });

  it('clears preview and never requests a semantic change after pointer cancellation', () => {
    const { setControlState, setDragPreviewControlState } = renderMotionThumb();

    act(() => {
      motionHarness.handlers.onDragStart?.();
      motionHarness.value?.set(16);
      motionHarness.handlers.onDrag?.();
      motionHarness.handlers.onPointerCancel?.({
        type: 'pointercancel',
        pointerId: 1
      } as PointerEvent<HTMLSpanElement>);
      motionHarness.handlers.onDragEnd?.();
    });

    expect(setControlState).not.toHaveBeenCalled();
    expect(setDragPreviewControlState).toHaveBeenLastCalledWith(null);
  });

  it('requests the release-position state exactly once after a completed drag', () => {
    const setControlState = vi.fn();
    renderMotionThumb({ setControlState });

    act(() => {
      motionHarness.handlers.onDragStart?.();
      motionHarness.value?.set(16);
      motionHarness.handlers.onDrag?.();
      motionHarness.handlers.onDragEnd?.();
    });

    expect(setControlState).toHaveBeenCalledTimes(1);
    expect(setControlState).toHaveBeenCalledWith(true);
  });
});
