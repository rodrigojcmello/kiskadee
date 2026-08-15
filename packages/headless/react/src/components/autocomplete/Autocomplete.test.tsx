/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Autocomplete, type AutocompleteOption } from './Autocomplete.tsx';

const options: AutocompleteOption[] = [
  { value: 'alpha', textValue: 'Alpha', content: <strong>Alpha result</strong> },
  { value: 'blocked', textValue: 'Blocked', disabled: true },
  { value: 'beta', textValue: 'Beta' }
];

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

describe('Headless Autocomplete', () => {
  it('keeps focus on the input, exposes active descendant and selects rich options', () => {
    const onValueChange = vi.fn();
    const result = render(
      <Autocomplete.Root options={options} onValueChange={onValueChange}>
        <Autocomplete.Input aria-label="Search" />
        <Autocomplete.Content />
      </Autocomplete.Root>
    );
    const input = result.getByRole('combobox', { name: 'Search' });

    (input as HTMLInputElement).focus();
    fireEvent.focus(input);
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-activedescendant')).toContain('alpha');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toContain('beta');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onValueChange).toHaveBeenCalledWith('beta');
    expect((input as HTMLInputElement).value).toBe('Beta');
    expect(document.activeElement).toBe(input);
  });

  it('reports typed input and renders explicit empty content', () => {
    const onInputValueChange = vi.fn();
    const result = render(
      <Autocomplete.Root options={[]} onInputValueChange={onInputValueChange}>
        <Autocomplete.Input aria-label="Search" />
        <Autocomplete.Content>
          <Autocomplete.Empty>No results</Autocomplete.Empty>
        </Autocomplete.Content>
      </Autocomplete.Root>
    );
    const input = result.getByRole('combobox', { name: 'Search' });

    fireEvent.change(input, { target: { value: 'unknown' } });
    expect(onInputValueChange).toHaveBeenCalledWith(
      'unknown',
      expect.objectContaining({ reason: 'input' })
    );
    expect(result.getByRole('status').textContent).toBe('No results');
  });

  it('closes on Escape and when keyboard focus leaves the input', () => {
    const result = render(
      <>
        <Autocomplete.Root options={options}>
          <Autocomplete.Input aria-label="Search" />
          <Autocomplete.Content />
        </Autocomplete.Root>
        <button type="button">After</button>
      </>
    );
    const input = result.getByRole('combobox', { name: 'Search' });

    fireEvent.focus(input);
    expect(result.getByRole('listbox')).toBeTruthy();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(result.queryByRole('listbox')).toBeNull();

    fireEvent.focus(input);
    fireEvent.blur(input, { relatedTarget: result.getByRole('button', { name: 'After' }) });
    expect(result.queryByRole('listbox')).toBeNull();
  });

  it('keeps Root option metadata authoritative when a rendered option diverges', () => {
    const onValueChange = vi.fn();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = render(
      <Autocomplete.Root options={options} onValueChange={onValueChange}>
        <Autocomplete.Input aria-label="Search" />
        <Autocomplete.Content>
          <Autocomplete.Option value="blocked" disabled={false}>
            Blocked
          </Autocomplete.Option>
        </Autocomplete.Content>
      </Autocomplete.Root>
    );
    const input = result.getByRole('combobox', { name: 'Search' });

    fireEvent.focus(input);
    fireEvent.mouseDown(result.getByRole('option', { name: 'Blocked' }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('Root.options wins'));
    warning.mockRestore();
  });
});
