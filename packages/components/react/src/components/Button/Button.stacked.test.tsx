/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Fragment } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Button } from './Button.tsx';
import type { ButtonProps } from './Button.types.ts';

const context: KiskadeeContextValue = {
  classesMap: {
    button: {
      e1: { s: { 'md:1': 'horizontal-root' }, rr: { 'md:1': 'horizontal-rounded' } },
      e2: { d: 'horizontal-font', s: { 'md:1': 'horizontal-label' } },
      e3: { s: { 'md:1': 'horizontal-icon' } },
      e4: { s: { 'md:1': 'surface-insets' } },
      e7: { s: { 'md:1': 'inline-badge-spacing' } },
      e8: {
        s: { 'md:1': 'stacked-root' },
        rr: { 'md:1': 'stacked-rounded' },
        rp: { 'md:1': 'stacked-pill' },
        rs: { 'md:1': 'stacked-square' }
      },
      e9: { d: 'stacked-font', s: { 'md:1': 'stacked-label' } },
      e10: { s: { 'md:1': 'stacked-icon' } }
    }
  },
  designSystem: 'stacked-test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {},
  componentArtifacts: {
    button: {
      component: 'button',
      layouts: {
        stacked: {
          sizes: ['md:1'],
          sizesByRadius: { rounded: ['md:1'], pill: ['md:1'], square: ['md:1'] }
        }
      }
    }
  }
};

function example(props: ButtonProps = {}, value = context) {
  return (
    <KiskadeeContext.Provider value={value}>
      <Button iconLayout="stacked" size="md" {...props} />
    </KiskadeeContext.Provider>
  );
}

const icon = <svg data-testid="artwork" viewBox="0 0 24 24" />;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Button stacked composition', () => {
  it('consumes the preset layout default and preserves pending accessibility', () => {
    const value: KiskadeeContextValue = {
      ...context,
      componentArtifacts: {
        button: {
          component: 'button',
          layouts: context.componentArtifacts!.button!.layouts,
          options: { iconLayout: 'stacked' }
        }
      }
    };
    render(example({ icon, label: 'Save', iconLayout: undefined, pending: true }, value));
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.className).toContain('k-btn-e8');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('uses the same native button and supports fragments and direct slot composition', () => {
    render(
      example({
        children: (
          <Fragment>
            <Button.Icon>{icon}</Button.Icon>
            <Button.Label>Add</Button.Label>
          </Fragment>
        )
      })
    );

    const button = screen.getByRole('button', { name: 'Add' });
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(button.className).toContain('k-btn-e8');
    expect(button.className).not.toContain('horizontal-root');
    expect(screen.getByText('Add').className).toContain('stacked-font');
    expect(screen.getByText('Add').className).not.toContain('horizontal-font');
    expect(screen.getByTestId('artwork').parentElement?.className).toContain('stacked-icon');
    expect(screen.getByTestId('artwork').parentElement?.className).not.toContain('k-btn-e3a');
  });

  it('updates the existing control when layout, direction, size or preset capability changes', () => {
    const props: ButtonProps = { icon, label: 'Add', iconPlacement: 'trailing' };
    const { rerender } = render(example(props));
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button.className).not.toMatch(/k-btn-e1[fg]/);

    rerender(example({ ...props, dir: 'rtl', iconLayout: 'inline' }));
    expect(screen.getByRole('button')).toBe(button);
    expect(button.dir).toBe('rtl');
    expect(button.className).toContain('horizontal-root');
    expect(button.className).not.toContain('stacked-root');

    rerender(example(props));
    expect(button.className).toContain('stacked-root');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    rerender(example(props, { ...context, classesMap: { button: { e1: {}, e2: {}, e3: {} } } }));
    expect(button.className).toContain('k-btn-e1d');
    expect(button.className).not.toContain('k-btn-e8');
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('Falling back to horizontal'));
    rerender(example({ ...props, size: 'sm' }));
    expect(button.className).not.toContain('stacked-root');
  });

  it.each([
    { label: 'Add' },
    { icon, 'aria-label': 'Add' },
    { icon, label: 'Add', iconTreatment: 'surface' as const },
    {
      children: (
        <>
          <Button.Icon>{icon}</Button.Icon>
          <Button.Label>Add</Button.Label>
          <Button.Disclosure>v</Button.Disclosure>
        </>
      )
    },
    {
      children: (
        <>
          <Button.Icon>{icon}</Button.Icon>
          <Button.Label>Add</Button.Label>
          <Button.Badge placement="inline-end">3</Button.Badge>
        </>
      )
    }
  ])('preserves horizontal behavior for unsupported content %#', (props) => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(example(props));
    expect(screen.getByRole('button').className).not.toContain('k-btn-e8');
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('Falling back to horizontal'));
  });

  it('keeps overlay Badge, native activation and disabled behavior', () => {
    const onClick = vi.fn();
    const children = (
      <>
        <Button.Icon>{icon}</Button.Icon>
        <Button.Label>Add</Button.Label>
        <Button.Badge>
          <span role="img" aria-label="New">
            3
          </span>
        </Button.Badge>
      </>
    );
    const { rerender } = render(example({ children, onClick }));
    const button = screen.getByRole('button', { name: /Add/ });
    expect(button.className).toContain('k-btn-e8');
    expect(screen.getByLabelText('New')).toBeTruthy();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(example({ children, onClick, disabled: true }));
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not mistake shared border, gap or icon classes for a complete size recipe', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const value: KiskadeeContextValue = {
      ...context,
      classesMap: {
        button: {
          e1: {},
          e2: {},
          e3: {},
          e8: {
            s: { all: 'shared-border', 'md:1': 'medium-insets' },
            rr: { all: 'shared-rounded' }
          },
          e9: { s: { all: 'shared-gap', 'md:1': 'medium-type' } },
          e10: { s: { all: 'shared-icon' } }
        }
      }
    };
    const { rerender } = render(example({ icon, label: 'Add', size: 'sm' }, value));
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button.className).not.toContain('k-btn-e8');
    rerender(example({ icon, label: 'Add' }, value));
    expect(button.className).toContain('k-btn-e8');
    rerender(example({ icon, label: 'Add' }, { ...value, componentArtifacts: {} }));
    expect(button.className).not.toContain('k-btn-e8');
  });

  it('checks the effective radius against published baseline coverage before replacing geometry', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const pillOnly: KiskadeeContextValue = {
      ...context,
      componentArtifacts: {
        button: {
          component: 'button',
          layouts: {
            stacked: {
              sizes: ['md:1'],
              sizesByRadius: { rounded: [], pill: ['md:1'], square: [] }
            }
          }
        }
      },
      classesMap: {
        button: {
          ...context.classesMap.button,
          e8: {
            s: { 'md:1': 'stacked-root' },
            rr: { 'md:1': 'rounded-large-breakpoint-only' },
            rp: { 'md:1': 'stacked-pill' }
          }
        }
      }
    };
    const { rerender } = render(example({ icon, label: 'Add' }, pillOnly));
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button.className).toContain('horizontal-root');
    expect(button.className).toContain('horizontal-rounded');
    expect(button.className).not.toContain('stacked-root');
    expect(button.className).not.toContain('rounded-large-breakpoint-only');

    rerender(example({ icon, label: 'Add', radius: 'pill' }, pillOnly));
    expect(screen.getByRole('button', { name: 'Add' })).toBe(button);
    expect(button.className).toContain('stacked-root');
    expect(button.className).toContain('stacked-pill');
    expect(button.className).not.toContain('horizontal-root');

    rerender(example({ icon, label: 'Add' }, { ...pillOnly, global: { radius: 'pill' } }));
    expect(button.className).toContain('stacked-pill');
    rerender(
      example(
        { icon, label: 'Add', radius: 'rounded' },
        { ...pillOnly, global: { radius: 'pill' } }
      )
    );
    expect(button.className).not.toContain('stacked-root');

    rerender(
      <KiskadeeContext.Provider value={pillOnly}>
        <Button.Group radius="pill">
          <Button iconLayout="stacked" icon={icon} label="Add" />
        </Button.Group>
      </KiskadeeContext.Provider>
    );
    expect(screen.getByRole('button', { name: 'Add' }).className).toContain('stacked-pill');
  });

  it('does not activate stacked from legacy size-only metadata or a missing radius class', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(
      example(
        { icon, label: 'Add' },
        {
          ...context,
          componentArtifacts: {
            button: { component: 'button', layouts: { stacked: { sizes: ['md:1'] } } }
          }
        }
      )
    );
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button.className).not.toContain('k-btn-e8');
    rerender(
      example(
        { icon, label: 'Add' },
        {
          ...context,
          classesMap: {
            button: {
              ...context.classesMap.button,
              e8: { s: { 'md:1': 'stacked-root' } }
            }
          }
        }
      )
    );
    expect(button.className).not.toContain('k-btn-e8');
    expect(button.className).toContain('horizontal-rounded');
  });
});
