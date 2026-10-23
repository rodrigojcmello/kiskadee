/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  HeadlessTextField,
  type TextFieldInputProps,
  type TextFieldRootProps,
  type UseHeadlessTextFieldActionsOptions,
  useHeadlessTextFieldActions
} from './HeadlessTextField.tsx';

afterEach(cleanup);

function ActionsBody({
  options,
  onChange
}: {
  options?: UseHeadlessTextFieldActionsOptions;
  onChange?: TextFieldInputProps['onChange'];
}) {
  const actions = useHeadlessTextFieldActions(options);
  return (
    <>
      <HeadlessTextField.Label>Value</HeadlessTextField.Label>
      <HeadlessTextField.Control>
        <HeadlessTextField.Input name="value" type={actions.inputType} onChange={onChange} />
        <button type="button" onClick={actions.clear}>
          Clear
        </button>
        <button type="button" onClick={actions.toggleVisibility}>
          {actions.visible ? 'Hide' : 'Show'}
        </button>
      </HeadlessTextField.Control>
      <output data-testid="value">{actions.value}</output>
      <output data-testid="state">
        {JSON.stringify({
          id: actions.inputId,
          disabled: actions.disabled,
          readOnly: actions.readOnly
        })}
      </output>
    </>
  );
}

function ActionsField({
  options,
  onChange,
  ...rootProps
}: Omit<TextFieldRootProps, 'children' | 'onChange'> & {
  options?: UseHeadlessTextFieldActionsOptions;
  onChange?: TextFieldInputProps['onChange'];
}) {
  return (
    <HeadlessTextField.Root {...rootProps}>
      <ActionsBody options={options} onChange={onChange} />
    </HeadlessTextField.Root>
  );
}

describe('HeadlessTextField actions', () => {
  it('clears uncontrolled state after focusing the input without fabricating a change event', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn(() => {
      expect(document.activeElement).toBe(screen.getByLabelText('Value'));
    });
    render(<ActionsField defaultValue="   " onValueChange={onValueChange} onChange={onChange} />);
    const input = screen.getByLabelText('Value') as HTMLInputElement;
    act(() => screen.getByRole('button', { name: 'Clear' }).focus());

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(input.value).toBe('');
    expect(screen.getByTestId('value').textContent).toBe('');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onValueChange).toHaveBeenCalledOnce();
  });

  it('requests a controlled clear and waits for the accepted value', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<ActionsField value="Ada" onValueChange={onValueChange} />);
    const input = screen.getByLabelText('Value') as HTMLInputElement;

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('');
    expect(input.value).toBe('Ada');
    expect(screen.getByTestId('value').textContent).toBe('Ada');

    rerender(<ActionsField value="" onValueChange={onValueChange} />);
    expect(screen.getByLabelText('Value')).toBe(input);
    expect(input.value).toBe('');
    expect(screen.getByTestId('value').textContent).toBe('');
  });

  it.each(['disabled', 'readOnly'] as const)('blocks clear while %s', (terminal) => {
    const onValueChange = vi.fn();
    render(
      <ActionsField
        inputId="protected"
        defaultValue="Kept"
        {...{ [terminal]: true }}
        onValueChange={onValueChange}
      />
    );
    const input = screen.getByLabelText('Value') as HTMLInputElement;
    const focus = vi.spyOn(input, 'focus');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(input.value).toBe('Kept');
    expect(focus).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(JSON.parse(screen.getByTestId('state').textContent ?? '')).toMatchObject({
      id: 'protected',
      [terminal]: true
    });
  });

  it('reveals and hides the same input while preserving selection and action focus', () => {
    const onValueChange = vi.fn();
    render(
      <form>
        <ActionsField
          defaultValue="Secret"
          onValueChange={onValueChange}
          options={{ inputType: 'password', visibilityEnabled: true }}
        />
      </form>
    );
    const input = screen.getByLabelText('Value') as HTMLInputElement;
    const toggle = screen.getByRole('button', { name: 'Show' });
    input.setSelectionRange(1, 5, 'backward');
    act(() => toggle.focus());
    const focus = vi.spyOn(input, 'focus');

    for (const [name, type] of [
      ['Show', 'text'],
      ['Hide', 'password']
    ]) {
      fireEvent.click(screen.getByRole('button', { name }));
      expect(screen.getByLabelText('Value')).toBe(input);
      expect(input.type).toBe(type);
      expect(input.value).toBe('Secret');
      expect(input.selectionStart).toBe(1);
      expect(input.selectionEnd).toBe(5);
      expect(input.selectionDirection).toBe('backward');
      expect(document.activeElement).toBe(toggle);
      expect(new FormData(input.form ?? undefined).get('value')).toBe('Secret');
    }
    expect(focus).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it.each([
    { inputType: 'password' },
    { inputType: 'email', visibilityEnabled: true },
    { visibilityEnabled: true }
  ])('does not toggle without an opted-in password type: %s', (options) => {
    render(<ActionsField defaultValue="Kept" options={options} />);
    const input = screen.getByLabelText('Value') as HTMLInputElement;
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(input.type).toBe(options.inputType ?? 'text');
    expect(screen.queryByRole('button', { name: 'Hide' })).toBeNull();
  });

  it('allows read-only reveal but blocks disabled reveal', () => {
    const options = { inputType: 'password', visibilityEnabled: true } as const;
    const { rerender } = render(<ActionsField readOnly defaultValue="Kept" options={options} />);
    const input = screen.getByLabelText('Value') as HTMLInputElement;
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(input.type).toBe('text');
    rerender(<ActionsField disabled defaultValue="Kept" options={options} />);
    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(input.type).toBe('text');
  });

  it('resets reveal when the capability or password base type is removed', () => {
    const { rerender } = render(
      <ActionsField
        defaultValue="Kept"
        options={{ inputType: 'password', visibilityEnabled: true }}
      />
    );
    const input = screen.getByLabelText('Value') as HTMLInputElement;
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    expect(input.type).toBe('text');
    rerender(
      <ActionsField
        defaultValue="Kept"
        options={{ inputType: 'password', visibilityEnabled: false }}
      />
    );
    expect(input.type).toBe('password');
    rerender(
      <ActionsField
        defaultValue="Kept"
        options={{ inputType: 'password', visibilityEnabled: true }}
      />
    );
    expect(input.type).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    rerender(
      <ActionsField defaultValue="Kept" options={{ inputType: 'email', visibilityEnabled: true }} />
    );
    expect(input.type).toBe('email');
  });

  it.each([
    'email',
    'number'
  ] as const)('skips selection restoration when hiding and changing the base type to %s in one event', (nextType) => {
    const onValueChange = vi.fn();
    function ChangingTypeField() {
      const [inputType, setInputType] = useState<'password' | 'email' | 'number'>('password');
      return (
        <ActionsField
          defaultValue="123456"
          onValueChange={onValueChange}
          options={{ inputType, visibilityEnabled: true }}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('button')?.textContent === 'Hide') {
              setInputType(nextType);
            }
          }}
        />
      );
    }
    render(<ChangingTypeField />);
    const input = screen.getByLabelText('Value') as HTMLInputElement;
    const toggle = screen.getByRole('button', { name: 'Show' });
    fireEvent.click(toggle);
    expect(input.type).toBe('text');
    input.setSelectionRange(1, 4, 'backward');
    act(() => toggle.focus());
    const restore = vi.spyOn(input, 'setSelectionRange');

    expect(() => fireEvent.click(toggle)).not.toThrow();

    expect(screen.getByLabelText('Value')).toBe(input);
    expect(input.type).toBe(nextType);
    expect(input.value).toBe('123456');
    expect(document.activeElement).toBe(toggle);
    expect(restore).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('requires a TextField.Root context', () => {
    expect(() => render(<ActionsBody />)).toThrow(
      'TextField compound components must be used within a TextField.Root'
    );
  });
});
