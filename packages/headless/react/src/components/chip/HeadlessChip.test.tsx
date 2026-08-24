/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeadlessChip } from './HeadlessChip.tsx';

afterEach(cleanup);

describe('HeadlessChip', () => {
  it('renders a static primary surface without interactive nesting', () => {
    render(
      <HeadlessChip.Root>
        <HeadlessChip.Content>Marketing</HeadlessChip.Content>
      </HeadlessChip.Root>
    );

    expect(screen.getByText('Marketing').tagName).toBe('SPAN');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('supports uncontrolled and controlled selection', () => {
    const onChange = vi.fn();
    const uncontrolled = render(
      <HeadlessChip.Root>
        <HeadlessChip.Select defaultControlState onControlStateChange={onChange}>
          Marketing
        </HeadlessChip.Select>
      </HeadlessChip.Root>
    );
    const first = screen.getByRole('button', { name: 'Marketing' });
    expect(first.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(first);
    expect(first.getAttribute('aria-pressed')).toBe('false');
    expect(onChange).toHaveBeenCalledWith(false);
    uncontrolled.unmount();

    render(
      <HeadlessChip.Root>
        <HeadlessChip.Select controlState onControlStateChange={onChange}>
          Product
        </HeadlessChip.Select>
      </HeadlessChip.Root>
    );
    const controlled = screen.getByRole('button', { name: 'Product' });
    fireEvent.click(controlled);
    expect(controlled.getAttribute('aria-pressed')).toBe('true');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('keeps Select and Remove as sibling buttons and removal does not toggle selection', () => {
    const onChange = vi.fn();
    const onRemove = vi.fn();
    render(
      <HeadlessChip.Root>
        <HeadlessChip.Select onControlStateChange={onChange}>Marketing</HeadlessChip.Select>
        <HeadlessChip.Remove aria-label="Remove Marketing" onRemove={onRemove} />
      </HeadlessChip.Root>
    );

    const select = screen.getByRole('button', { name: 'Marketing' });
    const remove = screen.getByRole('button', { name: 'Remove Marketing' });
    expect(select.contains(remove)).toBe(false);
    fireEvent.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(select.getAttribute('aria-pressed')).toBe('false');
  });

  it('disables both interactive targets from the root', () => {
    render(
      <HeadlessChip.Root disabled>
        <HeadlessChip.Select>Marketing</HeadlessChip.Select>
        <HeadlessChip.Remove aria-label="Remove Marketing" />
      </HeadlessChip.Root>
    );

    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Marketing' }).disabled).toBe(
      true
    );
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Remove Marketing' }).disabled
    ).toBe(true);
  });
});
