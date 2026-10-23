/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeadlessTextField, type TextFieldRootProps } from './HeadlessTextField';

afterEach(() => {
  cleanup();
});

function pointer(
  target: Element | Window,
  type: string,
  options: {
    pointerId?: number;
    pointerType?: string;
    isPrimary?: boolean;
    button?: number;
    relatedTarget?: EventTarget | null;
  } = {}
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, {
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    button: 0,
    relatedTarget: null,
    ...options
  });
  fireEvent(target, event);
  return event;
}

function InteractionField(props: Omit<TextFieldRootProps, 'children'>) {
  return (
    <HeadlessTextField.Root
      data-testid="field"
      stateProjection={{
        activatorClassName: 'active',
        interactiveClassName: 'interactive',
        projections: {
          hovered: { className: 'hovered' },
          pressed: { className: 'pressed' }
        }
      }}
      {...props}
    >
      <HeadlessTextField.Label>Value</HeadlessTextField.Label>
      <HeadlessTextField.Control data-testid="shell">
        <span>R$</span>
        <HeadlessTextField.Input />
        <button type="button">
          <svg aria-hidden="true" data-testid="action-artwork" />
          Send
        </button>
        {createPortal(<button type="button">Pick emoji</button>, document.body)}
      </HeadlessTextField.Control>
      <button type="button">Connected send</button>
    </HeadlessTextField.Root>
  );
}

describe('TextField pointer interaction ownership', () => {
  it.each([
    { tabIndex: -1 },
    { role: 'combobox' },
    { role: 'option' }
  ])('keeps shell interaction inside an interactive ancestor: %j', (ancestorProps) => {
    render(
      <div {...ancestorProps}>
        <InteractionField />
      </div>
    );
    const root = screen.getByTestId('field');
    const input = screen.getByLabelText('Value');
    for (const target of [screen.getByTestId('shell'), screen.getByText('R$')]) {
      pointer(target, 'pointerdown');
      expect(root.hasAttribute('data-pressed')).toBe(true);
      pointer(target, 'pointerup');
      fireEvent.click(target);
      expect(document.activeElement).toBe(input);
    }
    pointer(screen.getByTestId('action-artwork'), 'pointerdown');
    expect(root.hasAttribute('data-pressed')).toBe(false);
  });

  it('projects input, shell, and passive pressing while preserving hover and native selection', () => {
    render(<InteractionField defaultValue="Amount" />);
    const root = screen.getByTestId('field');
    const shell = screen.getByTestId('shell');
    const input = screen.getByLabelText('Value') as HTMLInputElement;
    input.setSelectionRange(1, 4);
    pointer(shell, 'pointerover');
    expect(root.hasAttribute('data-hovered')).toBe(true);

    for (const target of [input, shell, screen.getByText('R$')]) {
      const event = pointer(target, 'pointerdown');
      expect(event.defaultPrevented).toBe(false);
      expect(root.classList.contains('pressed')).toBe(true);
      expect(root.classList.contains('active')).toBe(true);
      expect(root.hasAttribute('data-hovered')).toBe(false);
      expect(shell.hasAttribute('data-pressed')).toBe(true);
      pointer(target, 'pointerup');
      expect(root.hasAttribute('data-pressed')).toBe(false);
      expect(root.hasAttribute('data-hovered')).toBe(true);
    }
    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(4);
  });

  it('excludes button artwork, keyboard activation, and portalled controls', () => {
    render(<InteractionField />);
    const root = screen.getByTestId('field');
    for (const target of [screen.getByTestId('action-artwork'), screen.getByText('Pick emoji')]) {
      pointer(target, 'pointerdown');
      expect(root.hasAttribute('data-pressed')).toBe(false);
      fireEvent.keyDown(target, { key: ' ' });
      expect(root.hasAttribute('data-pressed')).toBe(false);
      fireEvent.keyUp(target, { key: ' ' });
      fireEvent.keyDown(target, { key: 'Enter' });
      expect(root.hasAttribute('data-pressed')).toBe(false);
      pointer(target, 'pointerup');
    }
    const input = screen.getByLabelText('Value');
    expect(fireEvent.keyDown(input, { key: ' ' })).toBe(true);
    expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(true);
    expect(root.hasAttribute('data-pressed')).toBe(false);
  });

  it('keeps a connected action outside shell hover, pressing, and focus handoff', () => {
    const onPointerOver = vi.fn();
    const onPointerOut = vi.fn();
    const onPointerDown = vi.fn();
    const onClick = vi.fn();
    render(
      <InteractionField
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onPointerDown={onPointerDown}
        onClick={onClick}
      />
    );
    const root = screen.getByTestId('field');
    const shell = screen.getByTestId('shell');
    const connected = screen.getByRole('button', { name: 'Connected send' });
    const input = screen.getByLabelText('Value');
    pointer(connected, 'pointerover');
    expect(root.hasAttribute('data-hovered')).toBe(false);
    pointer(connected, 'pointerdown');
    expect(root.hasAttribute('data-pressed')).toBe(false);

    pointer(shell, 'pointerover', { relatedTarget: connected });
    expect(root.hasAttribute('data-hovered')).toBe(true);
    pointer(shell, 'pointerout', { relatedTarget: connected });
    pointer(connected, 'pointerover', { relatedTarget: shell });
    expect(root.hasAttribute('data-hovered')).toBe(false);

    act(() => connected.focus());
    const focusInput = vi.spyOn(input, 'focus');
    fireEvent.click(connected);
    expect(focusInput).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(connected);
    expect(root.hasAttribute('data-focused')).toBe(false);
    expect(onPointerOver).toHaveBeenCalledTimes(3);
    expect(onPointerOut).toHaveBeenCalledOnce();
    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
    expect(root.hasAttribute('data-text-field-root')).toBe(true);
    expect(shell.hasAttribute('data-text-field-control')).toBe(true);
  });

  it('clears pressing on an outside release, cancellation, pointer exit, window blur, and input blur', () => {
    render(<InteractionField />);
    const root = screen.getByTestId('field');
    const input = screen.getByLabelText('Value');
    const endings = [
      () => pointer(window, 'pointerup'),
      () => pointer(input, 'pointercancel'),
      () => pointer(root, 'pointerout', { relatedTarget: document.body }),
      () => fireEvent(window, new Event('blur')),
      () => fireEvent.blur(input, { relatedTarget: screen.getByRole('button', { name: 'Send' }) })
    ];
    for (const end of endings) {
      pointer(screen.getByTestId('shell'), 'pointerover');
      pointer(input, 'pointerdown');
      expect(root.hasAttribute('data-pressed')).toBe(true);
      end();
      expect(root.hasAttribute('data-pressed')).toBe(false);
    }
  });

  it('ignores secondary pointers and does not clear another pointer gesture', () => {
    render(<InteractionField />);
    const root = screen.getByTestId('field');
    const input = screen.getByLabelText('Value');
    pointer(input, 'pointerdown', { button: 2 });
    pointer(input, 'pointerdown', { pointerId: 2, isPrimary: false });
    expect(root.hasAttribute('data-pressed')).toBe(false);
    pointer(input, 'pointerdown');
    pointer(input, 'pointerdown', { pointerId: 2 });
    pointer(window, 'pointerup', { pointerId: 2 });
    expect(root.hasAttribute('data-pressed')).toBe(true);
    pointer(window, 'pointerup');
    expect(root.hasAttribute('data-pressed')).toBe(false);
  });

  it('preserves passive pressing while native pointer focus leaves the input temporarily', () => {
    render(<InteractionField />);
    const root = screen.getByTestId('field');
    const input = screen.getByLabelText('Value');
    act(() => (input as HTMLInputElement).focus());
    pointer(screen.getByText('R$'), 'pointerdown');
    fireEvent.blur(input, { relatedTarget: null });
    expect(root.hasAttribute('data-pressed')).toBe(true);
    pointer(screen.getByText('R$'), 'pointerup');
    fireEvent.click(screen.getByText('R$'));
    expect(root.hasAttribute('data-pressed')).toBe(false);
    expect(document.activeElement).toBe(input);
  });

  it('suppresses touch hover and does not retain hover after touch pressing', () => {
    render(<InteractionField />);
    const root = screen.getByTestId('field');
    const input = screen.getByLabelText('Value');
    pointer(screen.getByTestId('shell'), 'pointerover', { pointerType: 'touch' });
    expect(root.hasAttribute('data-hovered')).toBe(false);
    pointer(input, 'pointerdown', { pointerType: 'touch' });
    expect(root.hasAttribute('data-pressed')).toBe(true);
    pointer(input, 'pointerup', { pointerType: 'touch' });
    expect(root.hasAttribute('data-hovered')).toBe(false);
    expect(root.hasAttribute('data-pressed')).toBe(false);
  });

  it.each([
    'disabled',
    'readOnly'
  ] as const)('clears and gates interactions when %s changes', (terminal) => {
    const view = render(<InteractionField />);
    const root = screen.getByTestId('field');
    pointer(screen.getByTestId('shell'), 'pointerover');
    pointer(screen.getByLabelText('Value'), 'pointerdown');
    view.rerender(<InteractionField {...{ [terminal]: true }} />);
    expect(root.hasAttribute('data-hovered')).toBe(false);
    expect(root.hasAttribute('data-pressed')).toBe(false);
    pointer(screen.getByTestId('shell'), 'pointerover');
    pointer(screen.getByTestId('shell'), 'pointerdown');
    expect(root.hasAttribute('data-pressed')).toBe(false);
    view.rerender(<InteractionField />);
    expect(root.hasAttribute('data-pressed')).toBe(false);
  });

  it('composes public handlers and honors prevented pointer starts', () => {
    const onPointerDown = vi.fn((event) => event.preventDefault());
    const onPointerUp = vi.fn();
    const onPointerEnter = vi.fn();
    const onPointerLeave = vi.fn();
    render(
      <InteractionField
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      />
    );
    const root = screen.getByTestId('field');
    pointer(screen.getByTestId('shell'), 'pointerover');
    pointer(screen.getByLabelText('Value'), 'pointerdown');
    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(root.hasAttribute('data-pressed')).toBe(false);
    pointer(screen.getByLabelText('Value'), 'pointerup');
    pointer(root, 'pointerout', { relatedTarget: document.body });
    expect(onPointerUp).toHaveBeenCalledOnce();
    expect(onPointerEnter).toHaveBeenCalledOnce();
    expect(onPointerLeave).toHaveBeenCalledOnce();
  });
});

describe('HeadlessTextField', () => {
  it('links the label, input, and message for accessible form semantics', () => {
    render(
      <HeadlessTextField.Root inputId="email" message="Use your work email.">
        <HeadlessTextField.Label>Email</HeadlessTextField.Label>
        <HeadlessTextField.Control>
          <HeadlessTextField.Input />
        </HeadlessTextField.Control>
        <HeadlessTextField.Message />
      </HeadlessTextField.Root>
    );

    const input = screen.getByLabelText('Email');
    const message = screen.getByText('Use your work email.');

    expect(input.getAttribute('id')).toBe('email');
    expect(input.getAttribute('aria-describedby')).toBe('email-message');
    expect(message.getAttribute('id')).toBe('email-message');
  });

  it('supports controlled value changes through the root API', () => {
    const handleValueChange = vi.fn();

    render(
      <HeadlessTextField.Root value="A" onValueChange={handleValueChange}>
        <HeadlessTextField.Label>Name</HeadlessTextField.Label>
        <HeadlessTextField.Control>
          <HeadlessTextField.Input />
        </HeadlessTextField.Control>
      </HeadlessTextField.Root>
    );

    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'Ada' } });

    expect(handleValueChange).toHaveBeenCalledWith('Ada');
    expect((input as HTMLInputElement).value).toBe('A');
  });

  it('marks errors with aria-invalid and alert message semantics', () => {
    render(
      <HeadlessTextField.Root inputId="username" validationStatus="error" message="Required.">
        <HeadlessTextField.Label>Username</HeadlessTextField.Label>
        <HeadlessTextField.Control>
          <HeadlessTextField.Input />
        </HeadlessTextField.Control>
        <HeadlessTextField.Message />
      </HeadlessTextField.Root>
    );

    expect(screen.getByLabelText('Username').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe('Required.');
  });

  it('applies classNames and focus/filled data attributes', () => {
    const { container } = render(
      <HeadlessTextField.Root
        inputId="city"
        defaultValue="Rio"
        classNames={{
          e1: 'root-class',
          e2: 'label-class',
          e3: 'control-class',
          e4: 'input-class',
          e5: 'message-class'
        }}
        message="Optional."
      >
        <HeadlessTextField.Label>City</HeadlessTextField.Label>
        <HeadlessTextField.Control>
          <HeadlessTextField.Input />
        </HeadlessTextField.Control>
        <HeadlessTextField.Message />
      </HeadlessTextField.Root>
    );

    const root = container.querySelector('.root-class');
    const control = container.querySelector('.control-class');
    const input = screen.getByLabelText('City');

    expect(root?.getAttribute('data-filled')).toBe('');
    expect(control?.getAttribute('data-filled')).toBe('');
    expect(container.querySelector('.label-class')).toBeTruthy();
    expect(container.querySelector('.input-class')).toBeTruthy();
    expect(container.querySelector('.message-class')).toBeTruthy();

    fireEvent.focus(input);
    expect(root?.getAttribute('data-focused')).toBe('');
    expect(control?.getAttribute('data-focused')).toBe('');
  });

  it('focuses the input from passive shell content, including in read-only fields', () => {
    render(
      <HeadlessTextField.Root readOnly defaultValue="25">
        <HeadlessTextField.Label>Amount</HeadlessTextField.Label>
        <HeadlessTextField.Control data-testid="control">
          <span role="img" aria-label="Currency">
            R$
          </span>
          <HeadlessTextField.Input />
        </HeadlessTextField.Control>
      </HeadlessTextField.Root>
    );

    const input = screen.getByLabelText('Amount');
    fireEvent.click(screen.getByRole('img', { name: 'Currency' }));
    expect(document.activeElement).toBe(input);

    act(() => (input as HTMLInputElement).blur());
    fireEvent.click(screen.getByTestId('control'));
    expect(document.activeElement).toBe(input);
  });

  it('preserves an internal button action and keeps input focus state input-owned', () => {
    const handleAction = vi.fn();
    const { container } = render(
      <HeadlessTextField.Root>
        <HeadlessTextField.Label>Message</HeadlessTextField.Label>
        <HeadlessTextField.Control>
          <HeadlessTextField.Input />
          <button type="button" onClick={handleAction}>
            <svg aria-hidden="true" data-testid="send-artwork">
              <path d="M0 0" />
            </svg>
            Send
          </button>
        </HeadlessTextField.Control>
      </HeadlessTextField.Root>
    );

    const input = screen.getByLabelText('Message');
    const button = screen.getByRole('button', { name: 'Send' });
    act(() => (input as HTMLInputElement).focus());
    expect(container.firstElementChild?.hasAttribute('data-focused')).toBe(true);

    act(() => button.focus());
    const focusInput = vi.spyOn(input, 'focus');
    fireEvent.click(screen.getByTestId('send-artwork'));

    expect(handleAction).toHaveBeenCalledOnce();
    expect(focusInput).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(button);
    expect(container.firstElementChild?.hasAttribute('data-focused')).toBe(false);
  });

  it('does not steal focus from portalled content composed inside the shell', () => {
    render(
      <HeadlessTextField.Root>
        <HeadlessTextField.Label>Message</HeadlessTextField.Label>
        <HeadlessTextField.Control>
          <HeadlessTextField.Input />
          {createPortal(
            <button type="button">
              <span>Choose emoji</span>
            </button>,
            document.body
          )}
        </HeadlessTextField.Control>
      </HeadlessTextField.Root>
    );

    const input = screen.getByLabelText('Message');
    const action = screen.getByRole('button', { name: 'Choose emoji' });
    act(() => action.focus());
    const focusInput = vi.spyOn(input, 'focus');
    fireEvent.click(screen.getByText('Choose emoji'));
    expect(focusInput).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(action);
  });

  it.each([
    <a key="link" href="#details">
      Details
    </a>,
    // biome-ignore lint/a11y/useSemanticElements: exercises a consumer-provided ARIA control.
    <span key="button" role="button" tabIndex={0}>
      Open picker
    </span>,
    <span key="focusable" tabIndex={-1}>
      Focusable detail
    </span>,
    <span key="editable" contentEditable suppressContentEditableWarning>
      Edit me
    </span>
  ])('does not redirect clicks from interactive descendants: %s', (action) => {
    render(
      <HeadlessTextField.Root>
        <HeadlessTextField.Label>Value</HeadlessTextField.Label>
        <HeadlessTextField.Control>
          <HeadlessTextField.Input />
          {action}
        </HeadlessTextField.Control>
      </HeadlessTextField.Root>
    );

    const input = screen.getByLabelText('Value');
    const focusInput = vi.spyOn(input, 'focus');
    fireEvent.click(screen.getByText(String(action.props.children)));
    expect(focusInput).not.toHaveBeenCalled();
  });

  it('does not focus the input after a prevented passive click or while disabled', () => {
    const { rerender } = render(
      <HeadlessTextField.Root>
        <HeadlessTextField.Label>Value</HeadlessTextField.Label>
        <HeadlessTextField.Control onClick={(event) => event.preventDefault()}>
          <span>Prefix</span>
          <HeadlessTextField.Input />
        </HeadlessTextField.Control>
      </HeadlessTextField.Root>
    );

    const input = screen.getByLabelText('Value');
    const focusInput = vi.spyOn(input, 'focus');
    fireEvent.click(screen.getByText('Prefix'));
    expect(focusInput).not.toHaveBeenCalled();

    rerender(
      <HeadlessTextField.Root disabled>
        <HeadlessTextField.Label>Value</HeadlessTextField.Label>
        <HeadlessTextField.Control>
          <span>Prefix</span>
          <HeadlessTextField.Input />
        </HeadlessTextField.Control>
      </HeadlessTextField.Root>
    );
    fireEvent.click(screen.getByText('Prefix'));
    expect(focusInput).not.toHaveBeenCalled();
  });

  it('throws when compound parts are rendered outside TextField.Root', () => {
    expect(() => render(<HeadlessTextField.Label>Orphan</HeadlessTextField.Label>)).toThrow(
      'TextField compound components must be used within a TextField.Root'
    );
    expect(() => render(<HeadlessTextField.Control />)).toThrow(
      'TextField compound components must be used within a TextField.Root'
    );
    expect(() => render(<HeadlessTextField.Input />)).toThrow(
      'TextField compound components must be used within a TextField.Root'
    );
    expect(() => render(<HeadlessTextField.Message />)).toThrow(
      'TextField compound components must be used within a TextField.Root'
    );
  });
});
