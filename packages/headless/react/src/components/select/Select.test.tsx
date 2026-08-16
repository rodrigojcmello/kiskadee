/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createRef, type MouseEvent as ReactMouseEvent, type Ref, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
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
