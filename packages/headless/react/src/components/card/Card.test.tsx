/** @vitest-environment jsdom */

import { stateActivator as cn } from '@kiskadee/core';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CardAction } from './Card.tsx';

afterEach(cleanup);

function pointer(
  type: string,
  {
    x = 50,
    y = 50,
    pointerId = 1,
    pointerType = 'mouse',
    isPrimary = true,
    relatedTarget = null
  }: {
    x?: number;
    y?: number;
    pointerId?: number;
    pointerType?: string;
    isPrimary?: boolean;
    relatedTarget?: EventTarget | null;
  } = {}
) {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, {
    clientX: x,
    clientY: y,
    pointerId,
    pointerType,
    isPrimary,
    relatedTarget,
    button: 0
  });
  fireEvent(window, event);
}

function setBounds(button: HTMLElement) {
  vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 100,
    bottom: 100,
    width: 100,
    height: 100,
    toJSON: () => ({})
  });
}

describe('CardAction', () => {
  it('exposes its resolved uncontrolled control state to render children', () => {
    const result = render(
      <CardAction defaultControlState={false}>
        {({ controlState }) => (controlState ? 'selected' : 'rest')}
      </CardAction>
    );
    const action = result.getByRole('button');

    expect(action.getAttribute('aria-pressed')).toBe('false');
    expect(action.textContent).toBe('rest');

    fireEvent.click(action);

    expect(action.getAttribute('aria-pressed')).toBe('true');
    expect(action.textContent).toBe('selected');
  });

  it('keeps ordinary actions distinct from controlled selection and respects cancellation', () => {
    const onClick = vi.fn();
    const onControlStateChange = vi.fn();
    const result = render(<CardAction onClick={onClick}>Action</CardAction>);
    const action = result.getByRole<HTMLButtonElement>('button');
    expect(action.type).toBe('button');
    expect(action.hasAttribute('aria-pressed')).toBe(false);
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledOnce();

    result.rerender(
      <CardAction controlState={false} onControlStateChange={onControlStateChange}>
        Action
      </CardAction>
    );
    fireEvent.click(action);
    expect(onControlStateChange).toHaveBeenCalledWith(true);
    expect(action.getAttribute('aria-pressed')).toBe('false');
    result.rerender(
      <CardAction
        controlState
        onControlStateChange={onControlStateChange}
        onClick={(event) => event.preventDefault()}
      >
        Action
      </CardAction>
    );
    fireEvent.click(action);
    expect(onControlStateChange).toHaveBeenCalledOnce();
    expect(action.getAttribute('aria-pressed')).toBe('true');
  });

  it('locks activation without changing native semantics or selected presentation', () => {
    const onClick = vi.fn();
    const onControlStateChange = vi.fn();
    const result = render(
      <CardAction
        interactionLocked
        controlState
        onClick={onClick}
        onControlStateChange={onControlStateChange}
      >
        Action
      </CardAction>
    );
    const action = result.getByRole<HTMLButtonElement>('button');
    fireEvent.click(action);
    expect(onClick).not.toHaveBeenCalled();
    expect(onControlStateChange).not.toHaveBeenCalled();
    expect(action.disabled).toBe(false);
    expect(action.hasAttribute('aria-busy')).toBe(false);
    expect(action.getAttribute('aria-pressed')).toBe('true');
    expect(action.classList.contains(cn.selected)).toBe(true);
    expect(action.classList.contains(cn.nativeInteraction)).toBe(true);
  });

  it('gives terminal visuals precedence while preserving selection and actionable pending', () => {
    const onClick = vi.fn();
    const result = render(
      <CardAction defaultControlState status="pending" onClick={onClick}>
        Action
      </CardAction>
    );
    const action = result.getByRole<HTMLButtonElement>('button');
    expect(action.getAttribute('aria-pressed')).toBe('true');
    expect(action.classList.contains(cn.selected)).toBe(false);
    expect(action.classList.contains(cn.pending)).toBe(true);
    expect(action.classList.contains(cn.nativeInteraction)).toBe(false);
    expect(action.disabled).toBe(false);
    expect(action.hasAttribute('aria-busy')).toBe(false);
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledOnce();
    expect(action.getAttribute('aria-pressed')).toBe('false');

    result.rerender(
      <CardAction controlState disabled status="pending" onClick={onClick}>
        Action
      </CardAction>
    );
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledOnce();
    expect(action.disabled).toBe(true);
    expect(action.getAttribute('aria-pressed')).toBe('true');
    expect(action.classList.contains(cn.disabled)).toBe(true);
    for (const className of [cn.selected, cn.pending, cn.nativeInteraction]) {
      expect(action.classList.contains(className)).toBe(false);
    }
    result.rerender(<CardAction controlState>Action</CardAction>);
    expect(action.classList.contains(cn.selected)).toBe(true);
  });

  it.each([
    'hover',
    'pressed',
    'focus'
  ] as const)('suppresses forced %s when natively disabled', (status) => {
    const result = render(
      <CardAction disabled status={status}>
        Action
      </CardAction>
    );
    const action = result.getByRole('button');
    for (const className of [
      cn.hover,
      cn.pressed,
      cn.focus,
      cn.focusVisible,
      cn.nativeInteraction
    ]) {
      expect(action.classList.contains(className)).toBe(false);
    }
    expect(action.classList.contains(cn.disabled)).toBe(true);
  });

  it('projects bounds only for the active primary pointer and drops hover during a press', () => {
    const result = render(<CardAction interactionStateSource="bounds">Action</CardAction>);
    const action = result.getByRole('button');
    setBounds(action);
    pointer('pointermove');
    expect(action.classList.contains(cn.hover)).toBe(true);
    pointer('pointerdown');
    expect(action.classList.contains(cn.pressed)).toBe(true);
    expect(action.classList.contains(cn.hover)).toBe(false);
    expect(action.classList.contains(cn.nativeInteraction)).toBe(false);
    pointer('pointermove', { x: 150, pointerId: 2, isPrimary: false });
    expect(action.classList.contains(cn.pressed)).toBe(true);
    pointer('pointermove', { x: 150 });
    expect(action.classList.contains(cn.pressed)).toBe(false);
    expect(action.classList.contains(cn.nativeInteraction)).toBe(false);
    pointer('pointermove');
    expect(action.classList.contains(cn.pressed)).toBe(true);
    pointer('pointerup');
    expect(action.classList.contains(cn.pressed)).toBe(false);
    expect(action.classList.contains(cn.hover)).toBe(true);
    expect(action.classList.contains(cn.nativeInteraction)).toBe(true);
  });

  it.each(['pointercancel', 'pointerout', 'blur'])('clears bounds feedback on %s', (event) => {
    const result = render(<CardAction interactionStateSource="bounds">Action</CardAction>);
    const action = result.getByRole('button');
    setBounds(action);
    pointer('pointerdown');
    if (event === 'blur') fireEvent.blur(window);
    else pointer(event);
    expect(action.classList.contains(cn.hover)).toBe(false);
    expect(action.classList.contains(cn.pressed)).toBe(false);
    pointer('pointermove');
    expect(action.classList.contains(cn.pressed)).toBe(false);
  });

  it('keeps internal pointer transitions, ignores touch hover and clears stale bounds at terminal states', () => {
    const result = render(<CardAction interactionStateSource="bounds">Action</CardAction>);
    const action = result.getByRole('button');
    setBounds(action);
    pointer('pointermove');
    pointer('pointerout', { relatedTarget: action });
    expect(action.classList.contains(cn.hover)).toBe(true);
    pointer('pointerdown', { pointerType: 'touch' });
    pointer('pointerup', { pointerType: 'touch' });
    expect(action.classList.contains(cn.hover)).toBe(false);
    pointer('pointerdown');
    result.rerender(
      <CardAction interactionStateSource="bounds" status="disabled">
        Action
      </CardAction>
    );
    expect(action.classList.contains(cn.pressed)).toBe(false);
    expect(action.classList.contains(cn.nativeInteraction)).toBe(false);
    result.rerender(<CardAction interactionStateSource="bounds">Action</CardAction>);
    expect(action.classList.contains(cn.pressed)).toBe(false);
    expect(action.classList.contains(cn.hover)).toBe(false);
  });
});
