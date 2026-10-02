// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Select } from './Select.tsx';

const base: KiskadeeContextValue = {
  classesMap: {},
  designSystem: 'select-test',
  segment: 'default',
  theme: 'light',
  setDesignSystem() {},
  setSegment() {},
  setTheme() {}
};
const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Blocked', disabled: true },
  { value: 'c', label: 'Charlie' }
];
afterEach(cleanup);
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
const view = (context = base, props: Partial<React.ComponentProps<typeof Select>> = {}) => (
  <KiskadeeContext.Provider value={context}>
    <Select label="Workspace" options={options} sequential defaultValue="a" {...props} />
  </KiskadeeContext.Provider>
);
describe('Select presentation and unstyled fallback', () => {
  it('works without schema, Dropdown or icons and skips disabled options', () => {
    render(view());
    expect(screen.getByRole('combobox').className).toBe('');
    expect(
      (screen.getByRole('button', { name: 'Previous option' }) as HTMLButtonElement).disabled
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Next option' }));
    expect(screen.getByRole('combobox').textContent).toContain('Charlie');
    expect(
      (screen.getByRole('button', { name: 'Next option' }) as HTMLButtonElement).disabled
    ).toBe(true);
  });
  it('can hide disclosure without changing selection or keyboard opening', async () => {
    const result = render(view(base, { showChevron: false, loop: true }));
    const trigger = screen.getByRole('combobox');
    expect(trigger.textContent).toBe('Alpha');
    fireEvent.click(screen.getByRole('button', { name: 'Previous option' }));
    expect(trigger.textContent).toBe('Charlie');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(await screen.findByRole('listbox')).toBeTruthy();
    fireEvent.keyDown(trigger, { key: 'Escape' });
    result.rerender(view(base, { showChevron: true }));
    expect(trigger.textContent).toContain('▾');
  });
  it('wraps only with loop and handles zero/one enabled option', () => {
    const result = render(view(base, { loop: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous option' }));
    expect(screen.getByRole('combobox').textContent).toContain('Charlie');
    for (const items of [[], [options[0]!, options[1]!]]) {
      result.rerender(view(base, { loop: true, options: items }));
      if (items.length) {
        fireEvent.click(screen.getByRole('button', { name: 'Next option' }));
        expect(screen.getByRole('combobox').textContent).toContain('Alpha');
      }
      for (const name of ['Previous option', 'Next option'])
        expect((screen.getByRole('button', { name }) as HTMLButtonElement).disabled).toBe(true);
    }
  });
  it('keeps a styled trigger functional when Dropdown and icons are absent', async () => {
    render(view({ ...base, classesMap: { select: { standard: { outline: { e4: {} } } } } }));
    const trigger = screen.getByRole('combobox');
    expect(trigger.className).toContain('k-sel-e4');
    expect(screen.getByRole('button', { name: 'Next option' }).textContent).toBe('Next option');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const list = await screen.findByRole('listbox');
    expect(list.className).not.toContain('k-ddn');
    fireEvent.click(screen.getByRole('option', { name: 'Charlie' }));
    expect(trigger.textContent).toContain('Charlie');
  });
  it('keeps active navigation separate from selection and cancels with Escape', async () => {
    render(view());
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    await screen.findByRole('listbox');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger.textContent).toContain('Alpha');
    expect(screen.getByRole('option', { name: 'Alpha' }).getAttribute('aria-selected')).toBe(
      'true'
    );
    expect(screen.getByRole('option', { name: 'Charlie' }).getAttribute('aria-selected')).toBe(
      'false'
    );
    fireEvent.keyDown(trigger, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(document.activeElement).toBe(trigger);
    expect(trigger.textContent).toContain('Alpha');
  });
  it('reports controlled changes without changing the committed value', () => {
    const change = vi.fn();
    render(view(base, { value: 'a', onValueChange: change }));
    fireEvent.click(screen.getByRole('button', { name: 'Next option' }));
    expect(change).toHaveBeenCalledWith('c', expect.objectContaining({ reason: 'next' }));
    expect(screen.getByRole('combobox').textContent).toContain('Alpha');
  });
  it('preserves uncontrolled selection across a styled-to-unstyled preset change', () => {
    const styled = {
      ...base,
      classesMap: {
        select: {
          standard: {
            outline: { e4: { s: { 'md:1': 'test-shell' } }, e7: { s: { all: 'test-indicator' } } }
          }
        }
      }
    };
    const result = render(view(styled));
    fireEvent.click(screen.getByRole('button', { name: 'Next option' }));
    result.rerender(view({ ...base, designSystem: 'absent-select' }));
    expect(screen.getByRole('combobox').textContent).toContain('Charlie');
    expect(screen.getByRole('combobox').className).toBe('');
  });
  it('does not project trigger focus when a sequential control receives focus', () => {
    render(
      view({ ...base, classesMap: { select: { standard: { outline: { e4: {}, e7: {} } } } } })
    );
    const trigger = screen.getByRole('combobox');
    fireEvent.focus(screen.getByRole('button', { name: 'Next option' }));
    expect(trigger.className.split(' ')).not.toContain('-f');
    fireEvent.focus(trigger);
    expect(trigger.className.split(' ')).toContain('-f');
  });
  it('resolves focus options from props, mode, component and general defaults', () => {
    const context = {
      ...base,
      componentArtifacts: {
        select: {
          component: 'select',
          options: {
            mode: 'outline',
            focusIndicator: 'outer',
            focusRingColorSource: 'global',
            showDividers: true
          },
          modes: ['outline', 'underline'],
          modeOptions: {
            outline: {
              focusIndicator: 'inner',
              focusRingColorSource: 'component',
              showDividers: false
            }
          }
        }
      },
      classesMap: {
        select: {
          standard: {
            outline: { e3: {}, e4: {}, e7: {}, e12: {} },
            underline: { e3: {}, e4: {}, e7: {}, e12: {} }
          }
        }
      }
    };
    const result = render(view(context));
    const control = () => screen.getByRole('combobox').closest('.k-sel-e3')!;
    expect(control().classList.contains('k-sel-e3b')).toBe(true);
    expect(control().classList.contains('k-sel-e3d')).toBe(true);
    expect(control().querySelectorAll('.k-sel-e12').length).toBe(0);
    result.rerender(view(context, { mode: 'underline' }));
    expect(control().classList.contains('k-sel-e3c')).toBe(true);
    expect(control().classList.contains('k-sel-e3d')).toBe(false);
    expect(control().querySelectorAll('.k-sel-e12').length).toBe(2);
    result.rerender(
      view(context, {
        focusIndicator: 'underline',
        focusRingColorSource: 'global',
        showDividers: true
      })
    );
    expect(control().classList.contains('k-sel-e3a')).toBe(true);
    expect(control().classList.contains('k-sel-e3d')).toBe(false);
    expect(control().querySelectorAll('.k-sel-e12').length).toBe(2);
    result.rerender(view({ ...base, classesMap: context.classesMap }));
    expect(control().classList.contains('k-sel-e3a')).toBe(true);
    expect(control().classList.contains('k-sel-e3d')).toBe(false);
    expect(control().querySelectorAll('.k-sel-e12').length).toBe(0);
  });
  it.each([
    'underline',
    'inner',
    'outer'
  ] as const)('keeps %s focus exclusive to the trigger', (focusIndicator) => {
    render(
      view(
        {
          ...base,
          classesMap: {
            select: { standard: { outline: { e3: {}, e4: {}, e7: {}, e8: {}, e9: {} } } }
          }
        },
        { focusIndicator }
      )
    );
    const trigger = screen.getByRole('combobox');
    const control = trigger.closest('.k-sel-e3')!;
    const paint = control.querySelector('.k-sel-x2')!;
    expect(trigger.querySelector('.k-sel-e7')).toBeNull();
    expect(paint.querySelector('.k-sel-e7')).toBeTruthy();
    fireEvent.focus(screen.getByRole('button', { name: 'Next option' }));
    expect(trigger.className.split(' ')).not.toContain('-f');
    expect(control.className.split(' ')).not.toContain('-f');
    expect(paint.className.split(' ')).not.toContain('-f');
    fireEvent.focus(trigger);
    fireEvent.keyDown(trigger, { key: 'Shift' });
    expect(trigger.className.split(' ')).toContain('-f');
    expect(control.className.split(' ')).toContain(focusIndicator === 'outer' ? '-f' : 'k-sel-e3');
    expect(paint.classList.contains('-f')).toBe(focusIndicator === 'underline');
    fireEvent.blur(trigger);
    expect(paint.classList.contains('-f')).toBe(false);
    expect(control.classList.contains('-f')).toBe(false);
  });
  it('projects real selection, not a suggestion, and clears Selected via none', async () => {
    render(
      view(
        { ...base, classesMap: { select: { standard: { outline: { e3: {}, e4: {}, e7: {} } } } } },
        {
          defaultValue: null,
          suggestedValue: 'a',
          options: [{ value: 'clear', kind: 'none', label: 'No workspace' }, ...options]
        }
      )
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger.classList.contains('-s')).toBe(false);
    expect(trigger.textContent).toContain('Select an option');
    fireEvent.click(trigger);
    await screen.findByRole('listbox');
    expect(screen.getByRole('option', { name: 'Alpha' }).getAttribute('aria-selected')).toBe(
      'false'
    );
    fireEvent.click(screen.getByRole('option', { name: 'Alpha' }));
    expect(trigger.classList.contains('-s')).toBe(true);
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole('option', { name: 'No workspace' }));
    expect(trigger.classList.contains('-s')).toBe(false);
    expect(trigger.textContent).toContain('Select an option');
  });
  it('does not synthesize dividers without authored e12 or without styling', () => {
    const result = render(
      view(
        { ...base, classesMap: { select: { standard: { outline: { e3: {}, e4: {} } } } } },
        { showDividers: true }
      )
    );
    expect(document.querySelector('.k-sel-e12')).toBeNull();
    result.rerender(view(base, { showDividers: true }));
    expect(document.querySelector('.k-sel-e12')).toBeNull();
  });
  it('projects endpoint Disabled from Headless without disabling the whole control', () => {
    render(
      view({
        ...base,
        classesMap: { select: { standard: { outline: { e3: {}, e4: {}, e8: {}, e9: {} } } } }
      })
    );
    const previous = screen.getByRole('button', { name: 'Previous option' });
    const next = screen.getByRole('button', { name: 'Next option' });
    expect(previous.classList.contains('-d')).toBe(true);
    expect(next.classList.contains('-d')).toBe(false);
    expect(screen.getByRole('combobox').classList.contains('-d')).toBe(false);
    fireEvent.click(next);
    expect(previous.classList.contains('-d')).toBe(false);
    expect(next.classList.contains('-d')).toBe(true);
  });
  it('disables all three controls globally', () => {
    render(view(base, { disabled: true }));
    for (const control of screen.getAllByRole('button').concat(screen.getByRole('combobox')))
      expect((control as HTMLButtonElement).disabled).toBe(true);
  });
  it('diagnoses declared artifact load failures instead of hiding them as unsupported', async () => {
    render(
      view({
        ...base,
        designSystem: 'select-failure',
        loadComponentArtifact: async () => {
          throw new Error('Network failed');
        }
      })
    );
    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});

describe('Select list resource, viewport and portal handoff', () => {
  const styled: KiskadeeContextValue = {
    ...base,
    classesMap: {
      select: { standard: { outline: { e3: {}, e4: {}, e7: {} } } },
      dropdown: { e1: {}, e2: {}, e4: {}, e10: {} }
    }
  };
  it('composes a native scroll viewport for long lists and keeps option semantics', async () => {
    render(
      view(styled, {
        options: Array.from({ length: 80 }, (_, i) => ({ value: String(i), label: `Option ${i}` }))
      })
    );
    fireEvent.click(screen.getByRole('combobox'));
    const list = await screen.findByRole('listbox');
    const viewport = list.querySelector('.k-ddn-e1 > .k-ddn-x3 > .k-ddn-x4');
    expect(viewport).toBeTruthy();
    expect(viewport!.querySelectorAll('[role="option"]')).toHaveLength(80);
    fireEvent.click(screen.getByRole('option', { name: 'Option 79' }));
    expect(screen.getByRole('combobox').textContent).toContain('Option 79');
  });
  it.each([
    false,
    true
  ])('preserves explicit and inherited RTL with styled=%s', async (useStyle) => {
    const ctx = useStyle ? styled : base;
    const result = render(<div dir="rtl">{view(ctx)}</div>);
    fireEvent.click(screen.getByRole('combobox'));
    expect((await screen.findByRole('listbox')).getAttribute('dir')).toBe('rtl');
    result.rerender(<div dir="ltr">{view(ctx, { dir: 'rtl' })}</div>);
    expect(screen.getByRole('listbox').getAttribute('dir')).toBe('rtl');
  });
  it.each([
    'core',
    'palette'
  ] as const)('reports and retries a failed Dropdown %s map', async (failedKind) => {
    let failed = true;
    const load = vi.fn(async (component: string, request: { kind: string }) => {
      if (component === 'dropdown' && request.kind === failedKind && failed)
        throw new Error('Map failed');
      return {
        component,
        classMap: component === 'select' ? styled.classesMap.select : styled.classesMap.dropdown
      };
    });
    render(
      view({
        ...base,
        designSystem: `dropdown-map-failure-${failedKind}`,
        componentArtifacts: {
          select: { component: 'select', options: {}, modes: ['outline'] },
          dropdown: { component: 'dropdown' }
        },
        loadComponentClassMap: load
      })
    );
    await waitFor(() => expect(screen.getByRole('combobox').className).toContain('k-sel-e4'));
    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      expect.stringContaining('Dropdown')
    );
    expect(document.querySelector('.k-ddn-e1')).toBeNull();
    failed = false;
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    fireEvent.click(screen.getByRole('combobox'));
    expect((await screen.findByRole('listbox')).querySelector('.k-ddn-e1')).toBeTruthy();
  });
});
