/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeadlessSwitch } from './HeadlessSwitch';

afterEach(() => {
  cleanup();
});

describe('HeadlessSwitch', () => {
  it('renderiza estrutura principal com role=switch e classNames de slot', () => {
    const { container } = render(
      <HeadlessSwitch.Root
        inputId="sw-status"
        defaultControlState
        classNames={{ e1: 'root', e2: 'track', e3: 'thumb' }}
      >
        <HeadlessSwitch.Track>
          <HeadlessSwitch.Thumb />
        </HeadlessSwitch.Track>
        <HeadlessSwitch.Label>Notificações</HeadlessSwitch.Label>
      </HeadlessSwitch.Root>
    );

    const input = screen.getByRole('switch');
    const root = input.closest('label');

    expect(root).toBeTruthy();
    expect(input.getAttribute('id')).toBe('sw-status');
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.getAttribute('aria-checked')).toBe('true');
    expect(root?.getAttribute('class')).toContain('root');
    expect(container.querySelector('.track')).toBeTruthy();
    expect(container.querySelector('.thumb')).toBeTruthy();
    expect(screen.getByText('Notificações')).toBeTruthy();
  });

  it('alterna estado local em modo uncontrolled e dispara onControlStateChange', () => {
    const handleChange = vi.fn();

    render(
      <HeadlessSwitch.Root defaultControlState={false} onControlStateChange={handleChange}>
        <HeadlessSwitch.Track>
          <HeadlessSwitch.Thumb />
        </HeadlessSwitch.Track>
      </HeadlessSwitch.Root>
    );

    const input = screen.getByRole('switch');

    expect(input.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(input);
    expect(input.getAttribute('aria-checked')).toBe('true');
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('mantém callback de input quando readOnly, mas não atualiza state interno', () => {
    const handleControlStateChange = vi.fn();
    const handleInputChange = vi.fn();

    render(
      <HeadlessSwitch.Root
        readOnly
        defaultControlState={false}
        onControlStateChange={handleControlStateChange}
        inputProps={{
          onChange: handleInputChange
        }}
      >
        <HeadlessSwitch.Track>
          <HeadlessSwitch.Thumb />
        </HeadlessSwitch.Track>
      </HeadlessSwitch.Root>
    );

    const input = screen.getByRole('switch');

    fireEvent.click(input);
    expect(input.getAttribute('aria-checked')).toBe('false');
    expect(handleControlStateChange).not.toHaveBeenCalled();
    expect(handleInputChange).toHaveBeenCalledTimes(1);
  });

  it('emite erro quando partes do composto são usadas fora do Root', () => {
    expect(() => render(<HeadlessSwitch.Track />)).toThrow(
      'Switch compound components must be used within a Switch.Root'
    );
    expect(() => render(<HeadlessSwitch.Thumb />)).toThrow(
      'Switch compound components must be used within a Switch.Root'
    );
    expect(() => render(<HeadlessSwitch.Label />)).toThrow(
      'Switch compound components must be used within a Switch.Root'
    );
    expect(() => render(<HeadlessSwitch.State />)).toThrow(
      'Switch compound components must be used within a Switch.Root'
    );
  });
});
