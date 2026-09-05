/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSwitchRuntimeMotionController } from './SwitchRuntimeMotion.controller.ts';

type ControllerProps = {
  controlState: boolean;
  disabled?: boolean;
  enabled: boolean;
};

function useController(props: ControllerProps) {
  return useSwitchRuntimeMotionController({
    ...props,
    geometryKey: 'test-geometry',
    isControlled: true,
    setControlState: vi.fn()
  });
}

afterEach(() => {
  cleanup();
});

describe('Switch runtime motion controller', () => {
  it('keeps semantic state separate from the drag preview', () => {
    const { result } = renderHook(useController, {
      initialProps: {
        controlState: false,
        enabled: true
      }
    });

    act(() => {
      result.current.thumbProps.setDragPreviewControlState(true);
    });

    expect(result.current.visualControlState).toBe(true);
    expect(result.current.thumbProps.semanticControlState).toBe(false);
  });

  it('clears previews when motion is disabled and does not resurrect them', () => {
    const { result, rerender } = renderHook(useController, {
      initialProps: {
        controlState: false,
        enabled: true
      }
    });

    act(() => {
      result.current.thumbProps.setDragPreviewControlState(true);
    });
    expect(result.current.visualControlState).toBe(true);

    rerender({ controlState: false, enabled: false });
    expect(result.current.visualControlState).toBe(false);

    rerender({ controlState: false, enabled: true });
    expect(result.current.visualControlState).toBe(false);
  });

  it('clears previews when interaction becomes disabled', () => {
    const { result, rerender } = renderHook(useController, {
      initialProps: {
        controlState: false,
        enabled: true
      }
    });

    act(() => {
      result.current.thumbProps.setDragPreviewControlState(true);
    });

    rerender({ controlState: false, disabled: true, enabled: true });

    expect(result.current.visualControlState).toBe(false);
    expect(result.current.thumbProps.semanticControlState).toBe(false);
  });
});
