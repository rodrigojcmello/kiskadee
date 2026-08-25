/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Chip } from './Chip.tsx';

const context: KiskadeeContextValue = {
  classesMap: { chip: {} },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

function withinContext(node: React.ReactNode) {
  return <KiskadeeContext.Provider value={context}>{node}</KiskadeeContext.Provider>;
}

afterEach(cleanup);

describe('Chip', () => {
  it('requires exactly one static or selectable primary surface', () => {
    expect(() => render(withinContext(<Chip>Invalid</Chip>))).toThrow(
      'Chip requires exactly one Chip.Content or Chip.Select.'
    );
    expect(() =>
      render(
        withinContext(
          <Chip>
            <Chip.Content>Static</Chip.Content>
            <Chip.Select>Selectable</Chip.Select>
          </Chip>
        )
      )
    ).toThrow('Chip requires exactly one Chip.Content or Chip.Select.');
  });

  it('renders selectable and removable controls as siblings', () => {
    const onRemove = vi.fn();
    render(
      withinContext(
        <Chip>
          <Chip.Select>
            <Chip.Label>Marketing</Chip.Label>
          </Chip.Select>
          <Chip.Remove aria-label="Remove Marketing" onRemove={onRemove}>
            x
          </Chip.Remove>
        </Chip>
      )
    );

    const select = screen.getByRole('button', { name: 'Marketing' });
    const remove = screen.getByRole('button', { name: 'Remove Marketing' });
    expect(select.parentElement).toBe(remove.parentElement);
    expect(select.contains(remove)).toBe(false);
    fireEvent.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(select.getAttribute('aria-pressed')).toBe('false');
  });

  it('omits Remove without an Essential Icon or explicit child', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      withinContext(
        <Chip>
          <Chip.Content>Marketing</Chip.Content>
          <Chip.Remove aria-label="Remove Marketing" />
        </Chip>
      )
    );

    expect(screen.queryByRole('button', { name: 'Remove Marketing' })).toBeNull();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('Chip.Remove was omitted'));
    warning.mockRestore();
  });

  it('requires Chip.Badge to belong to the primary Content or Select surface', () => {
    expect(() =>
      render(
        withinContext(
          <Chip>
            <Chip.Content>Marketing</Chip.Content>
            <Chip.Badge>3</Chip.Badge>
          </Chip>
        )
      )
    ).toThrow('Chip.Badge must be rendered inside Chip.Content or Chip.Select.');

    render(
      withinContext(
        <Chip>
          <Chip.Content>
            Marketing
            <Chip.Badge>3</Chip.Badge>
          </Chip.Content>
        </Chip>
      )
    );
    expect(screen.getByText('3').className).toContain('k-chp-e7');
  });
});
