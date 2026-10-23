/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from '@testing-library/react';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import {
  SurfaceContextProvider,
  useSurfaceContext
} from '../../shared/contexts/SurfaceContext.tsx';
import { resolveTextFieldContentClassNames } from './TextField.class-names.ts';
import { TextFieldAction, TextFieldIcon, TextFieldText } from './TextField.content.tsx';
import { createTextFieldComponent } from './TextField.runtime.tsx';
import { textFieldStructuralRegistry } from './TextField.structural.ts';

vi.mock('./useTextFieldArtifactConfig.ts', () => {
  const passive = {
    c: {
      s: {
        neutral: { ll: 'neutral-passive', m: 'neutral-surfaced-passive' },
        error: { ll: 'error-passive', m: 'error-surfaced-passive' }
      },
      v: {
        neutral: { ll: 'vivid-passive', m: 'own-surface-passive' },
        error: { ll: 'vivid-error-passive', m: 'own-surface-error-passive' }
      }
    }
  };
  const elements = {
    e8: {
      s: { all: 'content-spacing' },
      c: {
        s: {
          neutral: { ll: 'plain-region', m: 'neutral-region' },
          error: { ll: 'plain-region', m: 'error-region' }
        },
        v: { neutral: { ll: 'vivid-plain-region', m: 'vivid-region' } }
      }
    },
    e9: passive,
    e10: passive
  };
  const config = {
    contentRegionSurfaceContext: {
      default: {
        light: {
          onSubtle: { neutral: { lowest: { rest: 'inherit' }, medium: { rest: 'onSubtle' } } },
          onVivid: { neutral: { lowest: { rest: 'inherit' }, medium: { rest: 'onSubtle' } } }
        }
      }
    },
    contentSurfaceContext: {
      default: {
        light: {
          onVivid: {
            neutral: { medium: { rest: 'onSubtle' } },
            error: { medium: { rest: 'onSubtle' } }
          }
        }
      }
    }
  };
  return {
    useTextFieldArtifactConfig: () => ({
      textFieldClassesMap: {
        standard: { outline: elements, underline: elements, borderless: elements },
        floating: { notched: elements, inside: elements }
      },
      options: {},
      variants: {
        standard: { modes: { outline: config, underline: config, borderless: config } },
        floating: { modes: { notched: config, inside: config } }
      }
    })
  };
});

const context: KiskadeeContextValue = {
  classesMap: {},
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

const fields = Object.values(textFieldStructuralRegistry).flatMap((modes) =>
  Object.values(modes).map((structural) => ({
    name: structural.mode,
    Field: createTextFieldComponent({
      displayName: `Test${structural.mode}`,
      structural,
      layout: structural.variant
    })
  }))
);
const Field = fields[0].Field;

function ContentSurface() {
  return <span data-testid="content-surface">{useSurfaceContext()}</span>;
}

function ConnectedSurface() {
  return <span data-testid="connected-surface">{useSurfaceContext()}</span>;
}

afterEach(cleanup);

const clearAction = {
  icon: <svg data-testid="clear-artwork" />,
  label: 'Clear query',
  clearedAnnouncement: 'Query cleared'
};
const visibilityToggle = {
  presentation: 'text' as const,
  showText: 'Show',
  hideText: 'Hide',
  showLabel: 'Show password',
  hideLabel: 'Hide password'
};

describe('TextField managed actions', () => {
  it.each(fields)('shows clear only for a nonempty editable value in $name', ({ Field }) => {
    const onValueChange = vi.fn();
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Field label="Query" clearAction={clearAction} onValueChange={onValueChange} />
      </KiskadeeContext.Provider>
    );
    const input = result.getByLabelText('Query') as HTMLInputElement;
    expect(result.queryByRole('button', { name: 'Clear query' })).toBeNull();
    expect(result.container.querySelector('[data-text-field-content="end"]')).toBeNull();
    fireEvent.change(input, { target: { value: ' ' } });
    expect(result.getByRole('button', { name: 'Clear query' })).not.toBeNull();
    fireEvent.change(input, { target: { value: 'hello' } });
    const clear = result.getByRole('button', { name: 'Clear query' });
    expect(clear.getAttribute('type')).toBe('button');
    expect(clear.getAttribute('aria-controls')).toBe(input.id);
    clear.focus();
    fireEvent.click(clear);
    expect(result.getByLabelText('Query')).toBe(input);
    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(result.queryByRole('button', { name: 'Clear query' })).toBeNull();
    expect(result.container.querySelector('[data-text-field-content="end"]')).toBeNull();
    expect(result.getByRole('status').textContent).toBe('Query cleared');
    fireEvent.change(input, { target: { value: 'again' } });
    const previousAnnouncement = result.getByRole('status').firstChild;
    fireEvent.click(result.getByRole('button', { name: 'Clear query' }));
    expect(result.getByRole('status').firstChild).not.toBe(previousAnnouncement);
    expect(result.getByRole('status').textContent).toBe('Query cleared');
  });

  it('clears controlled values through the parent without fabricating native change events', () => {
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('hello');
      return (
        <Field
          label="Query"
          value={value}
          onValueChange={setValue}
          clearAction={clearAction}
          inputProps={{ onChange }}
          endContent={<TextFieldText>suffix</TextFieldText>}
        />
      );
    }
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Controlled />
      </KiskadeeContext.Provider>
    );
    fireEvent.click(result.getByRole('button', { name: 'Clear query' }));
    expect((result.getByLabelText('Query') as HTMLInputElement).value).toBe('');
    expect(onChange).not.toHaveBeenCalled();
    expect(result.getByText('suffix')).not.toBeNull();
    expect(result.getByRole('status').textContent).toBe('Query cleared');
  });

  it('does not announce a rejected controlled clear or a later unrelated change', () => {
    const onValueChange = vi.fn();
    const tree = (value: string) => (
      <KiskadeeContext.Provider value={context}>
        <Field
          label="Query"
          value={value}
          onValueChange={onValueChange}
          clearAction={clearAction}
        />
      </KiskadeeContext.Provider>
    );
    const result = render(tree('kept'));
    fireEvent.click(result.getByRole('button', { name: 'Clear query' }));
    expect(onValueChange).toHaveBeenCalledWith('');
    expect((result.getByLabelText('Query') as HTMLInputElement).value).toBe('kept');
    expect(result.getByRole('status').textContent).toBe('');
    result.rerender(tree(''));
    expect(result.getByRole('status').textContent).toBe('');
  });

  it('preserves keyed custom content when clear appears and disappears', () => {
    function CustomAction() {
      const [count, setCount] = useState(0);
      return (
        <button type="button" onClick={() => setCount((value) => value + 1)}>
          Count {count}
        </button>
      );
    }
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Field label="Query" clearAction={clearAction} endContent={<CustomAction key="clear" />} />
      </KiskadeeContext.Provider>
    );
    const custom = result.getByRole('button', { name: 'Count 0' });
    fireEvent.click(custom);
    fireEvent.change(result.getByLabelText('Query'), { target: { value: 'hello' } });
    expect(result.getByRole('button', { name: 'Count 1' })).toBe(custom);
    fireEvent.click(result.getByRole('button', { name: 'Clear query' }));
    expect(result.getByRole('button', { name: 'Count 1' })).toBe(custom);
    fireEvent.click(custom);
    expect(result.getByRole('button', { name: 'Count 2' })).toBe(custom);
  });

  it.each([
    { disabled: true },
    { readOnly: true }
  ])('hides clear for terminal state %j', (state) => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Field label="Query" defaultValue="kept" clearAction={clearAction} {...state} />
      </KiskadeeContext.Provider>
    );
    expect(result.queryByRole('button')).toBeNull();
  });

  it.each(
    fields
  )('reveals the same password input without changing its value or direction in $name', ({
    Field
  }) => {
    const onValueChange = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <form onSubmit={onSubmit}>
          <Field
            label="Password"
            defaultValue="secret"
            onValueChange={onValueChange}
            dir="rtl"
            inputProps={{
              type: 'password',
              name: 'password',
              dir: 'ltr',
              autoComplete: 'current-password'
            }}
            visibilityToggle={visibilityToggle}
          />
        </form>
      </KiskadeeContext.Provider>
    );
    const input = result.getByLabelText('Password') as HTMLInputElement;
    input.setSelectionRange(1, 4, 'backward');
    const show = result.getByRole('button', { name: 'Show password' });
    show.focus();
    fireEvent.click(show);
    expect(result.getByLabelText('Password')).toBe(input);
    expect(input.type).toBe('text');
    expect(input.value).toBe('secret');
    expect(input.dir).toBe('ltr');
    expect(input.autocomplete).toBe('current-password');
    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(4);
    expect(input.selectionDirection).toBe('backward');
    expect(document.activeElement).toBe(show);
    expect(result.getByRole('button', { name: 'Hide password' })).toBe(show);
    expect(show.getAttribute('aria-controls')).toBe(input.id);
    expect(show.hasAttribute('aria-pressed')).toBe(false);
    fireEvent.click(show);
    expect(input.type).toBe('password');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('accepts caller artwork and keeps reveal independent from clear and custom content', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Field
          label="Password"
          defaultValue="secret"
          inputProps={{ type: 'password' }}
          clearAction={clearAction}
          endContent={<TextFieldText>suffix</TextFieldText>}
          visibilityToggle={{
            presentation: 'icon',
            showIcon: <img alt="" src="/eye.png" data-testid="show-artwork" />,
            hideIcon: <svg data-testid="hide-artwork" />,
            showLabel: 'Show password',
            hideLabel: 'Hide password'
          }}
        />
      </KiskadeeContext.Provider>
    );
    expect(result.getByTestId('show-artwork')).not.toBeNull();
    fireEvent.click(result.getByRole('button', { name: 'Show password' }));
    expect(result.queryByTestId('show-artwork')).toBeNull();
    expect(result.getByTestId('hide-artwork')).not.toBeNull();
    fireEvent.click(result.getByRole('button', { name: 'Clear query' }));
    expect(result.getByText('suffix')).not.toBeNull();
    expect(result.getByRole('button', { name: 'Hide password' })).not.toBeNull();
  });

  it('permits read-only reveal, blocks disabled reveal, and requires explicit password type', () => {
    const tree = (disabled: boolean, readOnly: boolean, type: 'text' | 'password') => (
      <KiskadeeContext.Provider value={context}>
        <Field
          label="Password"
          defaultValue="secret"
          disabled={disabled}
          readOnly={readOnly}
          inputProps={{ type }}
          visibilityToggle={visibilityToggle}
        />
      </KiskadeeContext.Provider>
    );
    const result = render(tree(false, true, 'password'));
    fireEvent.click(result.getByRole('button', { name: 'Show password' }));
    expect((result.getByLabelText('Password') as HTMLInputElement).type).toBe('text');
    result.rerender(tree(true, false, 'password'));
    const toggle = result.getByRole('button', { name: 'Hide password' }) as HTMLButtonElement;
    expect(toggle.disabled).toBe(true);
    fireEvent.click(toggle);
    expect((result.getByLabelText('Password') as HTMLInputElement).type).toBe('text');
    result.rerender(tree(false, false, 'text'));
    expect(result.queryByRole('button')).toBeNull();
  });
});

describe('TextField internal content', () => {
  it.each(fields)('keeps the value independent from both regions in $name', ({ Field }) => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <form>
          <Field
            label="Amount in reais"
            defaultValue="100,00"
            inputProps={{ name: 'amount', dir: 'ltr' }}
            dir="rtl"
            startContent={<TextFieldText dir="ltr">R$</TextFieldText>}
            endContent={
              <>
                <TextFieldIcon>
                  <svg data-testid="artwork" />
                </TextFieldIcon>
                <button type="button">Copy</button>
              </>
            }
          />
        </form>
      </KiskadeeContext.Provider>
    );
    const input = result.getByLabelText('Amount in reais') as HTMLInputElement;
    const form = result.container.querySelector('form');
    expect(input.value).toBe('100,00');
    expect(new FormData(form as HTMLFormElement).get('amount')).toBe('100,00');
    expect(input.dir).toBe('ltr');
    expect(input.closest('[dir="rtl"]')).not.toBeNull();
    expect(result.getByText('R$').tagName).toBe('BDI');
    expect(result.getByTestId('artwork').parentElement?.getAttribute('aria-hidden')).toBe('true');
    const lane = input.closest('[data-text-field-editing-lane]');
    expect(lane?.previousElementSibling?.getAttribute('data-text-field-content')).toBe('start');
    expect(lane?.nextElementSibling?.getAttribute('data-text-field-content')).toBe('end');
    expect(result.container.querySelectorAll('[tabindex]')).toHaveLength(0);
  });

  it('passes terminal state to content functions without cloning actions', () => {
    const content = vi.fn(({ disabled, readOnly }: { disabled: boolean; readOnly: boolean }) => (
      <>
        <button type="button" disabled={disabled}>
          Copy
        </button>
        <button type="button" disabled={disabled || readOnly}>
          Clear
        </button>
      </>
    ));
    const tree = (disabled: boolean, readOnly: boolean) => (
      <KiskadeeContext.Provider value={context}>
        <Field label="Account" disabled={disabled} readOnly={readOnly} endContent={content} />
      </KiskadeeContext.Provider>
    );
    const result = render(tree(false, true));
    expect(content).toHaveBeenLastCalledWith({ disabled: false, readOnly: true });
    expect((result.getByText('Copy') as HTMLButtonElement).disabled).toBe(false);
    expect((result.getByText('Clear') as HTMLButtonElement).disabled).toBe(true);
    result.rerender(tree(true, false));
    expect((result.getByText('Copy') as HTMLButtonElement).disabled).toBe(true);
  });

  it.each(fields)('paints one region independently from the shell and its sibling in $name', ({
    Field
  }) => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Field
          label="Amount"
          emphasis="high"
          startContentEmphasis="medium"
          startContent={
            <>
              <TextFieldText dir="ltr">R$</TextFieldText>
              <TextFieldIcon>
                <svg data-testid="framed-icon" />
              </TextFieldIcon>
              <button type="button">Copy</button>
            </>
          }
          endContent={<TextFieldText>BRL</TextFieldText>}
        />
      </KiskadeeContext.Provider>
    );
    const text = result.getByText('R$');
    const region = text.parentElement;
    expect(text.tagName).toBe('BDI');
    expect(text.getAttribute('dir')).toBe('ltr');
    expect(text.className).toContain('neutral-surfaced-passive');
    expect(region?.className).toContain('neutral-region');
    expect(region?.className).toContain('content-spacing');
    expect(region?.className).toContain('k-txf-e8c');
    const icon = result.getByTestId('framed-icon').parentElement;
    expect(icon?.className).toContain('neutral-surfaced-passive');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.parentElement).toBe(region);
    expect(result.getByText('BRL').className).toContain('neutral-passive');
    expect(result.getByText('BRL').parentElement?.getAttribute('data-text-field-content')).toBe(
      'end'
    );
    expect(result.getByText('Copy').parentElement?.getAttribute('data-text-field-content')).toBe(
      'start'
    );
    expect(result.getByText('Copy').parentElement).toBe(region);
    expect(result.container.querySelectorAll('[class*="k-txf-e11-"]')).toHaveLength(0);
  });

  it('keeps region anatomy optional for presets without authored surfaces', () => {
    const classes = resolveTextFieldContentClassNames({
      structural: textFieldStructuralRegistry.standard.outline,
      elements: { e9: { c: { s: { neutral: { m: 'legacy-icon' } } } } },
      classNames: {},
      scale: 's:md:1',
      intent: 'neutral',
      emphasis: 'medium',
      radius: 'rounded'
    });
    expect(classes.iconClassName).toContain('legacy-icon');
    expect(classes.regionClassName).toBe('');
  });

  it('uses the resolved field intent for passive content and neutral for terminal states', () => {
    const tree = (disabled: boolean, readOnly = false) => (
      <KiskadeeContext.Provider value={context}>
        <Field
          label="Email"
          validationStatus="error"
          disabled={disabled}
          readOnly={readOnly}
          startContentEmphasis="medium"
          startContent={<TextFieldText>@</TextFieldText>}
        />
      </KiskadeeContext.Provider>
    );
    const result = render(tree(false));
    expect(result.getByText('@').className).toContain('error-surfaced-passive');
    expect(result.getByText('@').parentElement?.className).toContain('error-region');
    result.rerender(tree(true));
    expect(result.getByText('@').className).toContain('neutral-surfaced-passive');
    expect(result.getByText('@').parentElement?.className).toContain('neutral-region');
    expect(result.getByText('@').className).not.toContain('error-surfaced-passive');
    expect(result.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true');
    result.rerender(tree(false, true));
    expect(result.getByText('@').className).toContain('neutral-surfaced-passive');
  });

  it('supplies the actual region surface to content and the ambient surface to the connected action', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <SurfaceContextProvider value="onVivid">
          <Field
            label="Search"
            startContentEmphasis="medium"
            startContent={
              <>
                <TextFieldText>Find</TextFieldText>
                <TextFieldText>Unit</TextFieldText>
              </>
            }
            endContent={<ContentSurface />}
            connectedEndAction={({ className }) => (
              <button type="button" className={className}>
                <ConnectedSurface />
              </button>
            )}
          />
        </SurfaceContextProvider>
      </KiskadeeContext.Provider>
    );
    expect(result.getByTestId('content-surface').textContent).toBe('onSubtle');
    expect(result.getByText('Find').className).toContain('neutral-surfaced-passive');
    expect(result.getByText('Unit').className).toContain('neutral-surfaced-passive');
    expect(result.getByTestId('connected-surface').textContent).toBe('onVivid');
  });

  it('preserves passive focus handoff and leaves action focus on the action', () => {
    const inputRef = createRef<HTMLInputElement>();
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Field
          label="Search"
          inputRef={inputRef}
          startContent={<TextFieldText>Find</TextFieldText>}
          endContent={<button type="button">Open</button>}
        />
      </KiskadeeContext.Provider>
    );
    fireEvent.click(result.getByText('Find'));
    expect(document.activeElement).toBe(inputRef.current);
    const action = result.getByText('Open');
    action.focus();
    fireEvent.click(action);
    expect(document.activeElement).toBe(action);
  });

  it('does not add region wrappers when no content is supplied', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Field label="Plain field" />
      </KiskadeeContext.Provider>
    );
    expect(result.container.querySelector('[data-text-field-content]')).toBeNull();
    expect(
      result
        .getByLabelText('Plain field')
        .closest('[data-text-field-control]')
        ?.classList.contains('k-txf-e3b')
    ).toBe(false);
  });

  it.each(fields)('preserves editing when an internal action appears or disappears in $name', ({
    Field
  }) => {
    const inputRef = createRef<HTMLInputElement>();
    const tree = (showAction: boolean) => (
      <KiskadeeContext.Provider value={context}>
        <Field
          label="Editable query"
          defaultValue="Initial query"
          inputRef={inputRef}
          endContent={
            showAction ? (
              <TextFieldAction>
                <button type="button">Clear</button>
              </TextFieldAction>
            ) : undefined
          }
        />
      </KiskadeeContext.Provider>
    );
    const result = render(tree(false));
    const input = result.getByLabelText('Editable query') as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: 'Current query' } });
    input.setSelectionRange(2, 7);

    for (const showAction of [true, false]) {
      result.rerender(tree(showAction));
      expect(result.getByLabelText('Editable query')).toBe(input);
      expect(inputRef.current).toBe(input);
      expect(document.activeElement).toBe(input);
      expect(input.value).toBe('Current query');
      expect([input.selectionStart, input.selectionEnd]).toEqual([2, 7]);
      expect(result.queryByRole('button', { name: 'Clear' }) !== null).toBe(showAction);
    }
  });

  it.each(fields)('keeps the connected action outside the control box in $name', ({ Field }) => {
    const onSend = vi.fn();
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Field
          label="Query"
          dir="rtl"
          defaultValue="hello"
          connectedEndAction={({ disabled, readOnly, className }) => (
            <button
              type="button"
              className={className}
              disabled={disabled || readOnly}
              onClick={onSend}
            >
              Send
            </button>
          )}
        />
      </KiskadeeContext.Provider>
    );
    const input = result.getByLabelText('Query');
    const control = input.closest('[data-text-field-control]');
    const button = result.getByText('Send');
    expect(button.parentElement).toBe(control?.parentElement);
    expect(control?.contains(button)).toBe(false);
    expect(button.className).toContain('k-txf-x2-');
    expect(control?.className).toContain('k-txf-e3c');
    button.focus();
    fireEvent.pointerOver(button, { pointerType: 'mouse' });
    fireEvent.pointerDown(button, { pointerType: 'mouse', button: 0 });
    fireEvent.click(button);
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(button);
    expect(input.closest('[data-text-field-root]')?.classList.contains('-p')).toBe(false);
    expect(input.closest('[data-text-field-root]')?.classList.contains('-h')).toBe(false);
  });

  it('marks an internal action without replacing or disabling its Button', () => {
    const result = render(
      <KiskadeeContext.Provider value={context}>
        <Field
          label="Query"
          readOnly
          endContent={
            <TextFieldAction>
              <button type="button">Inspect</button>
            </TextFieldAction>
          }
        />
      </KiskadeeContext.Provider>
    );
    const button = result.getByText('Inspect') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    expect(button.parentElement?.hasAttribute('data-text-field-action')).toBe(true);
    expect(button.parentElement?.parentElement?.getAttribute('data-text-field-content')).toBe(
      'end'
    );
  });

  it.each([null, ''])('removes the connected seam for an absent action result (%s)', (result) => {
    const field = render(
      <KiskadeeContext.Provider value={context}>
        <Field
          label="Query"
          defaultValue="hello"
          connectedEndAction={({ className }) => (
            <button type="button" className={className}>
              Send
            </button>
          )}
        />
      </KiskadeeContext.Provider>
    );
    const input = field.getByLabelText('Query') as HTMLInputElement;
    input.focus();
    input.setSelectionRange(1, 3);
    field.rerender(
      <KiskadeeContext.Provider value={context}>
        <Field label="Query" defaultValue="hello" connectedEndAction={() => result} />
      </KiskadeeContext.Provider>
    );
    expect(
      field.getByLabelText('Query').closest('[data-text-field-control]')?.className
    ).not.toContain('k-txf-e3c');
    expect(field.getByLabelText('Query')).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('hello');
    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(3);
    expect(field.queryByRole('button')).toBeNull();
  });
});
