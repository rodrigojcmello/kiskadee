/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from '@testing-library/react';
import { type MouseEvent as ReactMouseEvent, useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Select, type SelectOption } from './Select.tsx';

const options: SelectOption[] = [
  { value: 'first', label: 'First' },
  { value: 'disabled', label: 'Disabled', disabled: true },
  { value: 'last', label: 'Last' }
];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

function SequentialSelect({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState('first');

  return (
    <Select.Root disabled={disabled} options={options} value={value} onValueChange={setValue}>
      <Select.Label>Family</Select.Label>
      <Select.Previous>Previous</Select.Previous>
      <Select.Trigger>{options.find((option) => option.value === value)?.label}</Select.Trigger>
      <Select.Next>Next</Select.Next>
      <Select.Content>
        {options.map((option) => (
          <Select.Option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </Select.Option>
        ))}
      </Select.Content>
    </Select.Root>
  );
}

describe('Headless Select sequential navigation', () => {
  it('moves between enabled options without wrapping', () => {
    const result = render(<SequentialSelect />);
    const previous = result.getByRole('button', { name: 'Previous option' });
    const next = result.getByRole('button', { name: 'Next option' });
    const trigger = result.getByRole('combobox', { name: 'Family' });

    expect(previous.hasAttribute('disabled')).toBe(true);
    expect(next.hasAttribute('disabled')).toBe(false);

    fireEvent.click(next);

    expect(trigger.textContent).toBe('Last');
    expect(previous.hasAttribute('disabled')).toBe(false);
    expect(next.hasAttribute('disabled')).toBe(true);
  });

  it('keeps the central trigger responsible for opening the listbox', () => {
    const result = render(<SequentialSelect />);
    const trigger = result.getByRole('combobox', { name: 'Family' });
    const listbox = result.getByRole('listbox', { hidden: true });

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(listbox.getAttribute('aria-hidden')).toBe('true');

    fireEvent.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(listbox.getAttribute('aria-hidden')).toBeNull();
  });

  it('disables the trigger and both sequential controls with the root', () => {
    const result = render(<SequentialSelect disabled />);

    expect(result.getByRole('button', { name: 'Previous option' }).hasAttribute('disabled')).toBe(
      true
    );
    expect(result.getByRole('button', { name: 'Next option' }).hasAttribute('disabled')).toBe(true);
    expect(result.getByRole('combobox').hasAttribute('disabled')).toBe(true);
  });

  it('honors a prevented custom step click', () => {
    const onClick = vi.fn((event: ReactMouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    });
    const result = render(
      <Select.Root options={options} defaultValue="first">
        <Select.Trigger>First</Select.Trigger>
        <Select.Next onClick={onClick}>Next</Select.Next>
      </Select.Root>
    );

    fireEvent.click(result.getByRole('button', { name: 'Next option' }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(result.getByRole('combobox').textContent).toBe('First');
  });
});
