/** @vitest-environment jsdom */
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Button } from './Button.tsx';
import type { ButtonProps } from './Button.types.ts';

const effectImport = vi.hoisted(() => vi.fn());
vi.mock('./effects/activation-feedback/ButtonActivationFeedback.effect.ts', () => {
  effectImport();
  return { resolveButtonActivationFeedbackEffect: () => ({ classNamePatch: {} }) };
});
const context: KiskadeeContextValue = {
  classesMap: { button: { e1: {}, e2: {}, e7: { d: 'badge-relation' } } },
  designSystem: 'optional-button-test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Button optional composition and loading', () => {
  it.each([
    false,
    true
  ])('preserves label identity without inline badges (overlay=%s)', (overlay) => {
    const mounted = vi.fn();
    function Content() {
      useEffect(mounted, []);
      return <span data-testid="label-content">Save</span>;
    }
    const view = (value: KiskadeeContextValue) => (
      <KiskadeeContext.Provider value={value}>
        <Button activationFeedback={false}>
          <Button.Label>
            <Content />
          </Button.Label>
          {overlay && <Button.Badge>3</Button.Badge>}
        </Button>
      </KiskadeeContext.Provider>
    );
    const result = render(view(context));
    const label = result.getByTestId('label-content');
    expect(result.container.querySelector('.k-btn-x5')).toBeNull();
    result.rerender(view({ ...context, classesMap: { button: { e1: {}, e2: {} } } }));
    expect(result.getByTestId('label-content')).toBe(label);
    result.rerender(view(context));
    expect(result.getByTestId('label-content')).toBe(label);
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it('loads Progress only when allowed and reuses it after pending', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const calls = vi.fn();
    const value: KiskadeeContextValue = {
      ...context,
      designSystem: 'optional-progress-test',
      loadComponentClassMap: async <T,>(component: string): Promise<T | undefined> => {
        calls(component);
        return (
          component === 'progress'
            ? { component, classMap: { e3: { d: 'progress-paint' } } }
            : undefined
        ) as T | undefined;
      }
    };
    const view = (props: ButtonProps) => (
      <KiskadeeContext.Provider value={value}>
        <Button {...props} activationFeedback={false}>
          <Button.Label>Save</Button.Label>
          <Button.Progress value={50} />
        </Button>
      </KiskadeeContext.Provider>
    );
    const result = render(view({}));
    await act(async () => {});
    expect(calls.mock.calls.filter(([name]) => name === 'progress')).toHaveLength(0);
    result.rerender(view({ pending: true, disabled: true }));
    await act(async () => {});
    expect(calls.mock.calls.filter(([name]) => name === 'progress')).toHaveLength(0);
    result.rerender(view({ status: 'pending', disabled: true }));
    await act(async () => {});
    expect(calls.mock.calls.filter(([name]) => name === 'progress')).toHaveLength(0);
    result.rerender(view({ pending: true }));
    await waitFor(() => expect(result.container.querySelector('.progress-paint')).not.toBeNull());
    expect(calls.mock.calls.filter(([name]) => name === 'progress')).toHaveLength(2);
    result.rerender(view({}));
    expect(result.container.querySelector('.progress-paint')).toBeNull();
    result.rerender(view({ status: 'pending' }));
    await waitFor(() => expect(result.container.querySelector('.progress-paint')).not.toBeNull());
    expect(calls.mock.calls.filter(([name]) => name === 'progress')).toHaveLength(2);
  });

  it('defers feedback import for terminal states and reuses it after enabling', async () => {
    const value: KiskadeeContextValue = {
      ...context,
      classesMap: { button: { e1: { e: { afs: 'ripple' } } } }
    };
    const view = (props: ButtonProps) => (
      <KiskadeeContext.Provider value={value}>
        <Button {...props}>Save</Button>
      </KiskadeeContext.Provider>
    );
    const result = render(view({ disabled: true }));
    for (const props of [
      { pending: true },
      { status: 'disabled' },
      { status: 'pending' },
      { disabled: true, status: 'hover' },
      { activationFeedback: false }
    ] satisfies ButtonProps[]) {
      result.rerender(view(props));
      await act(async () => {});
      expect(effectImport).not.toHaveBeenCalled();
    }
    result.rerender(view({}));
    await waitFor(() => expect(effectImport).toHaveBeenCalledTimes(1));
    result.rerender(view({ disabled: true }));
    result.rerender(view({}));
    await act(async () => {});
    expect(effectImport).toHaveBeenCalledTimes(1);
  });
});
