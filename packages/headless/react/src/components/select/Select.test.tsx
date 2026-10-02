/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createRef, type MouseEvent as ReactMouseEvent, type Ref, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Select, type SelectOption, type SelectProps, useSelectState } from './Select.tsx';

const options: SelectOption[] = [
  { value: 'first', label: 'First' },
  { value: 'disabled', label: 'Disabled', disabled: true },
  { value: 'last', label: 'Last' }
];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

function StateProbe() {
  const state = useSelectState();
  return (
    <output
      data-testid="state"
      data-selected-value={state.selectedValue ?? 'none'}
      data-has-selection={state.hasSelection}
      data-active-value={state.activeValue}
      data-highlighted-value={state.highlightedValue}
      data-active-source={state.activeSource ?? 'none'}
    />
  );
}

function ChoiceSelect(props: Omit<SelectProps, 'children'>) {
  return (
    <Select.Root {...props}>
      <Select.Trigger />
      <Select.Previous />
      <Select.Next />
      <Select.Content />
      <StateProbe />
    </Select.Root>
  );
}

function firePointer(element: Element, type: string, pointerType = 'mouse') {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  fireEvent(element, event);
}

describe('Headless Select choice and candidate state', () => {
  const withNone: SelectOption[] = [
    { value: 'prompt', label: 'Choose or clear', kind: 'none' },
    ...options
  ];

  it('suggests the first enabled option without selecting and confirms that same candidate', () => {
    const onValueChange = vi.fn();
    const result = render(<ChoiceSelect options={options} onValueChange={onValueChange} />);
    const trigger = result.getByRole('combobox');
    const state = result.getByTestId('state');

    expect(trigger.textContent).toBe('Select an option');
    fireEvent.click(trigger);
    expect(result.getByRole('option', { name: 'First' }).getAttribute('aria-selected')).toBe(
      'false'
    );
    expect(state.getAttribute('data-highlighted-value')).toBe('first');
    expect(state.getAttribute('data-has-selection')).toBe('false');
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(trigger.textContent).toBe('First');
    expect(state.getAttribute('data-has-selection')).toBe('true');
    expect(onValueChange).toHaveBeenCalledWith(
      'first',
      expect.objectContaining({ reason: 'keyboard' })
    );
  });

  it.each(['Escape', 'Tab'])('does not confirm the suggestion on %s', (key) => {
    const onValueChange = vi.fn();
    const result = render(<ChoiceSelect options={options} onValueChange={onValueChange} />);
    const trigger = result.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(result.getByTestId('state').getAttribute('data-has-selection')).toBe('false');
    expect(trigger.textContent).toBe('Select an option');
  });

  it.each([
    { suggestedValue: null, expected: undefined },
    { suggestedValue: 'last', expected: 'last' },
    { suggestedValue: 'missing', expected: undefined },
    { suggestedValue: 'disabled', expected: undefined }
  ])('resolves an explicit initial candidate: %j', ({ suggestedValue, expected }) => {
    const result = render(<ChoiceSelect options={options} suggestedValue={suggestedValue} />);
    const trigger = result.getByRole('combobox');
    fireEvent.click(trigger);
    expect(result.getByTestId('state').getAttribute('data-highlighted-value')).toBe(
      expected ?? null
    );
    expect(trigger.textContent).toBe('Select an option');
    if (expected === undefined) {
      expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      expect(trigger.getAttribute('aria-activedescendant')).toContain('first');
    }
  });

  it('preserves defaultValue as selection and prefers it to the initial suggestion', () => {
    const result = render(
      <ChoiceSelect options={options} defaultValue="last" suggestedValue="first" />
    );
    const trigger = result.getByRole('combobox');
    expect(trigger.textContent).toBe('Last');
    expect(result.getByTestId('state').getAttribute('data-has-selection')).toBe('true');
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-activedescendant')).toContain('last');
    expect(result.getByRole('option', { name: 'Last' }).getAttribute('aria-selected')).toBe('true');
  });

  it('clears a real choice through an explicit none option and returns focus to the trigger', () => {
    const onValueChange = vi.fn();
    const result = render(
      <ChoiceSelect options={withNone} defaultValue="last" onValueChange={onValueChange} />
    );
    const trigger = result.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.click(result.getByRole('option', { name: 'Choose or clear' }));
    expect(onValueChange).toHaveBeenCalledWith(null, expect.objectContaining({ reason: 'option' }));
    expect(trigger.textContent).toBe('Select an option');
    expect(result.getByTestId('state').getAttribute('data-has-selection')).toBe('false');
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    expect(
      result
        .getAllByRole('option')
        .every((option) => option.getAttribute('aria-selected') === 'false')
    ).toBe(true);
  });

  it('keeps null controlled until the owner accepts the request and can clear it again', () => {
    const onValueChange = vi.fn();
    const result = render(
      <ChoiceSelect options={withNone} value={null} onValueChange={onValueChange} />
    );
    const trigger = result.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.click(result.getByRole('option', { name: 'First' }));
    expect(onValueChange).toHaveBeenCalledWith(
      'first',
      expect.objectContaining({ reason: 'option' })
    );
    expect(trigger.textContent).toBe('Select an option');
    result.rerender(
      <ChoiceSelect options={withNone} value="first" onValueChange={onValueChange} />
    );
    expect(trigger.textContent).toBe('First');
    fireEvent.click(trigger);
    fireEvent.click(result.getByRole('option', { name: 'Choose or clear' }));
    expect(trigger.textContent).toBe('First');
    result.rerender(<ChoiceSelect options={withNone} value={null} onValueChange={onValueChange} />);
    expect(trigger.textContent).toBe('Select an option');
  });

  it('reports confirmation of an already selected value rather than comparing with the default', () => {
    const onValueChange = vi.fn();
    const result = render(
      <ChoiceSelect options={options} defaultValue="first" onValueChange={onValueChange} />
    );
    fireEvent.click(result.getByRole('combobox'));
    fireEvent.click(result.getByRole('option', { name: 'First' }));
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith(
      'first',
      expect.objectContaining({ reason: 'option' })
    );
  });

  it('transfers highlight to the pointer and keeps the candidate without restoring suggestion on leave', () => {
    const result = render(<ChoiceSelect options={options} />);
    const trigger = result.getByRole('combobox');
    const state = result.getByTestId('state');
    fireEvent.click(trigger);
    const last = result.getByRole('option', { name: 'Last' });
    firePointer(last, 'pointerover');
    expect(state.getAttribute('data-highlighted-value')).toBe('last');
    expect(state.getAttribute('data-active-source')).toBe('pointer');
    expect(result.getByRole('option', { name: 'First' }).hasAttribute('data-highlighted')).toBe(
      false
    );
    firePointer(last, 'pointerout');
    expect(state.hasAttribute('data-highlighted-value')).toBe(false);
    expect(trigger.getAttribute('aria-activedescendant')).toContain('last');
    expect(state.getAttribute('data-has-selection')).toBe('false');
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(state.getAttribute('data-highlighted-value')).toBe('first');
    expect(state.getAttribute('data-active-source')).toBe('keyboard');
  });

  it('preserves pointer takeover and keyboard navigation when equivalent inline options rerender', () => {
    const result = render(<ChoiceSelect options={options.map((option) => ({ ...option }))} />);
    const trigger = result.getByRole('combobox');
    const state = result.getByTestId('state');
    fireEvent.click(trigger);
    const last = result.getByRole('option', { name: 'Last' });
    firePointer(last, 'pointerover');
    firePointer(last, 'pointerout');
    result.rerender(<ChoiceSelect options={options.map((option) => ({ ...option }))} />);
    expect(state.hasAttribute('data-highlighted-value')).toBe(false);
    expect(state.getAttribute('data-active-value')).toBe('last');
    expect(state.getAttribute('data-active-source')).toBe('pointer');

    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    result.rerender(<ChoiceSelect options={options.map((option) => ({ ...option }))} />);
    expect(state.getAttribute('data-highlighted-value')).toBe('first');
    expect(state.getAttribute('data-active-source')).toBe('keyboard');
  });

  it('clears an unavailable candidate without restoring an initial suggestion while still open', () => {
    const result = render(<ChoiceSelect options={options} />);
    const trigger = result.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    result.rerender(<ChoiceSelect options={options.slice(0, 2)} />);
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
    expect(result.getByTestId('state').hasAttribute('data-highlighted-value')).toBe(false);
    fireEvent.keyDown(trigger, { key: 'Escape' });
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-activedescendant')).toContain('first');
  });

  it('ignores touch and disabled-option hover and exposes active separately from highlighted', () => {
    const result = render(<ChoiceSelect options={options} />);
    fireEvent.click(result.getByRole('combobox'));
    const state = result.getByTestId('state');
    firePointer(result.getByRole('option', { name: 'Last' }), 'pointerover', 'touch');
    expect(state.getAttribute('data-highlighted-value')).toBe('first');
    firePointer(result.getByRole('option', { name: 'Disabled' }), 'pointerover');
    expect(state.getAttribute('data-highlighted-value')).toBe('first');
    const first = result.getByRole('option', { name: 'First' });
    firePointer(first, 'pointermove');
    firePointer(first, 'pointerout');
    expect(first.hasAttribute('data-focused')).toBe(true);
    expect(first.hasAttribute('data-highlighted')).toBe(false);
  });

  it('keeps sequential navigation on real values and reports each control reason', () => {
    const onValueChange = vi.fn();
    const result = render(<ChoiceSelect options={withNone} loop onValueChange={onValueChange} />);
    const previous = result.getByRole('button', { name: 'Previous option' });
    const next = result.getByRole('button', { name: 'Next option' });
    fireEvent.click(next);
    expect(onValueChange).toHaveBeenLastCalledWith(
      'first',
      expect.objectContaining({ reason: 'next' })
    );
    fireEvent.click(previous);
    expect(onValueChange).toHaveBeenLastCalledWith(
      'last',
      expect.objectContaining({ reason: 'previous' })
    );
    fireEvent.click(next);
    expect(onValueChange).toHaveBeenLastCalledWith(
      'first',
      expect.objectContaining({ reason: 'next' })
    );
    expect(result.getByRole('combobox').getAttribute('aria-expanded')).toBe('false');
    expect(onValueChange.mock.calls.every(([value]) => value !== null)).toBe(true);
  });

  it('can confirm one real option from empty and disables further sequential movement', () => {
    const result = render(<ChoiceSelect options={[withNone[0], options[0], options[1]]} loop />);
    const next = result.getByRole('button', { name: 'Next option' });
    const previous = result.getByRole('button', { name: 'Previous option' });
    expect(next.hasAttribute('disabled')).toBe(false);
    expect(previous.hasAttribute('disabled')).toBe(false);
    fireEvent.click(next);
    expect(next.hasAttribute('disabled')).toBe(true);
    expect(previous.hasAttribute('disabled')).toBe(true);
  });

  it.each([
    { direction: 'Next option', expected: 'last' },
    { direction: 'Previous option', expected: 'first' }
  ])('keeps the selected position after it becomes disabled for $direction', ({
    direction,
    expected
  }) => {
    const mutableOptions: SelectOption[] = [
      options[0],
      { value: 'middle', label: 'Middle' },
      options[2]
    ];
    const onValueChange = vi.fn();
    const result = render(
      <ChoiceSelect options={mutableOptions} value="middle" onValueChange={onValueChange} />
    );
    result.rerender(
      <ChoiceSelect
        options={mutableOptions.map((option) => ({
          ...option,
          disabled: option.value === 'middle'
        }))}
        value="middle"
        onValueChange={onValueChange}
      />
    );
    expect(result.getByRole('combobox').textContent).toBe('Middle');
    fireEvent.click(result.getByRole('button', { name: direction }));
    expect(onValueChange).toHaveBeenCalledWith(
      expected,
      expect.objectContaining({
        reason: direction === 'Next option' ? 'next' : 'previous'
      })
    );
  });

  it('does not wrap a disabled selected extreme when sequential navigation is bounded', () => {
    const result = render(
      <ChoiceSelect
        options={options.map((option) => ({
          ...option,
          disabled: option.disabled || option.value === 'last'
        }))}
        value="last"
      />
    );
    expect(result.getByRole('button', { name: 'Next option' }).hasAttribute('disabled')).toBe(true);
    expect(result.getByRole('button', { name: 'Previous option' }).hasAttribute('disabled')).toBe(
      false
    );
  });

  it('does not confirm disabled values and diagnoses multiple none options', () => {
    const onValueChange = vi.fn();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = render(
      <ChoiceSelect
        options={[...withNone, { value: 'other-prompt', label: 'Other prompt', kind: 'none' }]}
        onValueChange={onValueChange}
      />
    );
    expect(error).toHaveBeenCalledWith(expect.stringContaining('at most one none option'));
    fireEvent.click(result.getByRole('combobox'));
    fireEvent.click(result.getByRole('option', { name: 'Disabled' }));
    expect(onValueChange).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('confirms closed-trigger typeahead with its reason and supports clearing while already empty', () => {
    const onValueChange = vi.fn();
    const result = render(<ChoiceSelect options={withNone} onValueChange={onValueChange} />);
    const trigger = result.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'l' });
    expect(onValueChange).toHaveBeenLastCalledWith(
      'last',
      expect.objectContaining({ reason: 'typeahead' })
    );
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger);
    fireEvent.click(result.getByRole('option', { name: 'Choose or clear' }));
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: 'keyboard' })
    );
    expect(result.getByTestId('state').getAttribute('data-has-selection')).toBe('false');
  });

  it('does not let a none item enable sequential controls when there are no real enabled values', () => {
    const result = render(<ChoiceSelect options={[withNone[0], options[1]]} loop />);
    expect(result.getByRole('button', { name: 'Previous option' }).hasAttribute('disabled')).toBe(
      true
    );
    expect(result.getByRole('button', { name: 'Next option' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(result.getByRole('combobox'));
    fireEvent.click(result.getByRole('option', { name: 'Choose or clear' }));
    expect(result.getByRole('combobox').textContent).toBe('Select an option');
  });
});

afterEach(cleanup);

function SequentialSelect({
  disabled = false,
  loop = false
}: {
  disabled?: boolean;
  loop?: boolean;
}) {
  const [value, setValue] = useState<string | null>('first');

  return (
    <Select.Root
      disabled={disabled}
      loop={loop}
      options={options}
      value={value}
      onValueChange={setValue}
    >
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

  it('wraps both ways repeatedly while skipping disabled options and keeping the list closed', () => {
    const result = render(<SequentialSelect loop />);
    const previous = result.getByRole('button', { name: 'Previous option' });
    const next = result.getByRole('button', { name: 'Next option' });
    const trigger = result.getByRole('combobox');
    for (let cycle = 0; cycle < 3; cycle++) {
      fireEvent.click(previous);
      expect(trigger.textContent).toBe('Last');
      fireEvent.click(next);
      expect(trigger.textContent).toBe('First');
      fireEvent.click(next);
      expect(trigger.textContent).toBe('Last');
      fireEvent.click(next);
      expect(trigger.textContent).toBe('First');
    }
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it.each([
    { entries: [] },
    { entries: [options[1]] }
  ])('disables looping steps without enabled values: %j', ({ entries }) => {
    const onValueChange = vi.fn();
    const result = render(
      <Select.Root loop options={entries} onValueChange={onValueChange}>
        <Select.Previous />
        <Select.Next />
      </Select.Root>
    );
    for (const button of result.getAllByRole('button')) {
      expect(button.hasAttribute('disabled')).toBe(true);
      fireEvent.click(button);
    }
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps the central trigger responsible for opening the listbox', () => {
    const result = render(<SequentialSelect />);
    const trigger = result.getByRole('combobox', { name: 'Family' });

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(result.queryByRole('listbox', { hidden: true })).toBeNull();

    fireEvent.click(trigger);

    const listbox = result.getByRole('listbox');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(listbox.getAttribute('aria-hidden')).toBeNull();
    expect(listbox.hasAttribute('inert')).toBe(false);
    expect(listbox.hasAttribute('data-open')).toBe(true);
    expect(listbox.tagName).toBe('UL');
  });

  it('mounts a closed listbox only when an exit adapter requests it', () => {
    const result = render(
      <Select.Root options={options} defaultValue="first">
        <Select.Trigger />
        <Select.Content forceMount />
      </Select.Root>
    );
    const listbox = result.getByRole('listbox', { hidden: true });

    expect(listbox.getAttribute('aria-hidden')).toBe('true');
    expect(listbox.hasAttribute('inert')).toBe(true);
    expect(listbox.hasAttribute('data-closed')).toBe(true);
  });

  it('keeps the default Content ref attached to its semantic ul', () => {
    const contentRef = createRef<HTMLUListElement>();

    render(
      <Select.Root options={options} defaultValue="first" defaultOpen>
        <Select.Trigger />
        <Select.Content ref={contentRef} />
      </Select.Root>
    );

    expect(contentRef.current).toBeInstanceOf(HTMLUListElement);
    expect(contentRef.current?.getAttribute('role')).toBe('listbox');
  });

  it('exposes placement in render state through div-compatible positioner props', () => {
    const states: Array<{ open: boolean; placement: string }> = [];
    const result = render(
      <Select.Root options={options} defaultValue="first">
        <Select.Trigger />
        <Select.Content
          forceMount
          placement="top-end"
          render={(props, state) => {
            states.push(state);
            const { ref, ...positionerProps } = props;
            return <div {...positionerProps} ref={ref} />;
          }}
        />
      </Select.Root>
    );
    const trigger = result.getByRole('combobox');
    const hiddenListbox = result.getByRole('listbox', { hidden: true });

    expect(states.at(-1)).toEqual(expect.objectContaining({ open: false, placement: 'top-end' }));
    expect(hiddenListbox.hasAttribute('data-closed')).toBe(true);

    fireEvent.click(trigger);
    expect(states.at(-1)).toEqual(expect.objectContaining({ open: true, placement: 'top-end' }));
    expect(result.getByRole('listbox')).toBe(hiddenListbox);
  });

  it('disables the trigger and both sequential controls with the root', () => {
    const result = render(<SequentialSelect disabled loop />);

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

  it('publishes derived step disabled state to render adapters while preserving native controls', () => {
    const onValueChange = vi.fn();
    const tree = (disabled = false) => (
      <Select.Root
        options={options}
        defaultValue="first"
        disabled={disabled}
        onValueChange={onValueChange}
      >
        <Select.Trigger />
        <Select.Previous
          render={(props, state) => <button {...props} data-render-disabled={state.disabled} />}
        >
          Previous
        </Select.Previous>
        <Select.Next
          render={(props, state) => <button {...props} data-render-disabled={state.disabled} />}
        >
          Next
        </Select.Next>
      </Select.Root>
    );
    const result = render(tree());
    const previous = result.getByRole('button', { name: 'Previous option' });
    const next = result.getByRole('button', { name: 'Next option' });
    expect(previous.textContent).toBe('Previous');
    expect(previous.getAttribute('data-direction')).toBe('previous');
    expect(previous.getAttribute('data-render-disabled')).toBe('true');
    expect(previous.hasAttribute('disabled')).toBe(true);
    expect(next.getAttribute('type')).toBe('button');
    expect(next.getAttribute('data-direction')).toBe('next');
    expect(next.getAttribute('data-render-disabled')).toBe('false');

    fireEvent.click(next);
    expect(onValueChange).toHaveBeenCalledWith('last', expect.objectContaining({ reason: 'next' }));
    expect(previous.getAttribute('data-render-disabled')).toBe('false');
    expect(next.getAttribute('data-render-disabled')).toBe('true');
    expect(next.hasAttribute('disabled')).toBe(true);

    result.rerender(tree(true));
    for (const control of [previous, next]) {
      expect(control.getAttribute('data-render-disabled')).toBe('true');
      expect(control.hasAttribute('disabled')).toBe(true);
      fireEvent.click(control);
    }
    expect(onValueChange).toHaveBeenCalledOnce();
  });

  it('publishes the active option through aria-activedescendant', () => {
    const result = render(<SequentialSelect />);
    const trigger = result.getByRole('combobox', { name: 'Family' });

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-activedescendant')).toContain('first');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger.getAttribute('aria-activedescendant')).toContain('last');
  });

  it('reports Escape once even while the shared overlay dismiss listener is active', () => {
    const onOpenChange = vi.fn();
    const result = render(
      <Select.Root options={options} defaultValue="first" onOpenChange={onOpenChange}>
        <Select.Trigger />
        <Select.Content portalled />
      </Select.Root>
    );
    const trigger = result.getByRole('combobox');

    fireEvent.click(trigger);
    onOpenChange.mockClear();
    fireEvent.keyDown(trigger, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'escape' }));
  });

  it('uses explicit textValue for JSX labels during typeahead', () => {
    const richOptions: SelectOption[] = [
      { value: 'alpha', label: <strong>Alpha</strong>, textValue: 'Alpha' },
      { value: 'beta', label: <em>Beta</em>, textValue: 'Beta' }
    ];
    const result = render(
      <Select.Root options={richOptions} defaultValue="alpha">
        <Select.Trigger />
        <Select.Content />
      </Select.Root>
    );
    const trigger = result.getByRole('combobox');

    fireEvent.keyDown(trigger, { key: 'b' });
    expect(trigger.textContent).toBe('Beta');
  });

  it('keeps Root option metadata authoritative when an Option disabled prop diverges', () => {
    const onValueChange = vi.fn();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = render(
      <Select.Root options={options} defaultValue="first" onValueChange={onValueChange}>
        <Select.Trigger />
        <Select.Content>
          <Select.Option value="disabled" disabled={false}>
            Disabled
          </Select.Option>
        </Select.Content>
      </Select.Root>
    );

    fireEvent.click(result.getByRole('combobox'));
    fireEvent.click(result.getByRole('option', { name: 'Disabled' }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('Root.options wins'));
    warning.mockRestore();
  });

  it('composes trigger, content and option render callbacks without nested controls', () => {
    const result = render(
      <Select.Root options={options} defaultValue="first">
        <Select.Trigger
          render={(props) => {
            const { ref, ...buttonProps } = props;
            return <button {...buttonProps} ref={ref} type="button" data-custom-trigger />;
          }}
        />
        <Select.Content
          render={(props) => {
            const { ref, children, ...listProps } = props;
            return (
              <div {...listProps} ref={ref as Ref<HTMLDivElement>}>
                {children}
              </div>
            );
          }}
        >
          {options.map((option) => (
            <Select.Option
              key={option.value}
              value={option.value}
              render={(props) => {
                const { ref, children, ...optionProps } = props;
                return (
                  <div {...optionProps} ref={ref as Ref<HTMLDivElement>}>
                    {children}
                  </div>
                );
              }}
            >
              {option.label}
            </Select.Option>
          ))}
        </Select.Content>
      </Select.Root>
    );
    const trigger = result.getByRole('combobox');

    expect(trigger.hasAttribute('data-custom-trigger')).toBe(true);
    expect(trigger.querySelector('button')).toBeNull();
    fireEvent.click(trigger);
    expect(result.getByRole('listbox')).toBeTruthy();
    fireEvent.click(result.getByRole('option', { name: 'Last' }));
    expect(trigger.textContent).toBe('Last');
  });

  it('keeps portalled listbox markup deterministic through hydration', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const tree = (
      <Select.Root options={options} defaultValue="first" defaultOpen>
        <Select.Trigger />
        <Select.Content portalled />
      </Select.Root>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    document.body.append(container);

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, tree);
      await Promise.resolve();
    });

    expect(document.body.querySelector('[role="listbox"]')).toBeTruthy();
    expect(error.mock.calls.flat().join(' ')).not.toContain('Hydration failed');
    await act(async () => root?.unmount());
    container.remove();
    error.mockRestore();
  });
});
