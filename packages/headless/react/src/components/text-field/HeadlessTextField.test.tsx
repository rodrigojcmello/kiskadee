/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeadlessTextField } from './HeadlessTextField';

afterEach(() => {
  cleanup();
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
