/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Menu } from './Menu.tsx';

afterEach(cleanup);

function Example({ onSelect = vi.fn() }: { onSelect?: () => void }) {
  return (
    <Menu.Root>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Item textValue="Duplicate" onSelect={onSelect}>
          Duplicate
        </Menu.Item>
        <Menu.Item textValue="Unavailable" disabled>
          Unavailable
        </Menu.Item>
        <Menu.Item textValue="Archive">Archive</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}

describe('Headless Menu', () => {
  it('uses menu semantics, moves real focus and restores it after selection', async () => {
    const onSelect = vi.fn();
    const result = render(<Example onSelect={onSelect} />);
    const trigger = result.getByRole('button', { name: 'Actions' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Duplicate'));

    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('navigates disabled items without activating them and supports typeahead', async () => {
    const result = render(<Example />);
    const trigger = result.getByRole('button', { name: 'Actions' });

    fireEvent.click(trigger);
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Duplicate'));
    fireEvent.keyDown(result.getByRole('menu'), { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toBe('Unavailable');
    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' });
    expect(result.getByRole('menu')).toBeTruthy();

    fireEvent.keyDown(result.getByRole('menu'), { key: 'a' });
    expect(document.activeElement?.textContent).toBe('Archive');
  });

  it('preserves native trigger attributes and consumer keyboard handlers', () => {
    const onKeyDown = vi.fn();
    const result = render(
      <Menu.Root>
        <Menu.Trigger className="consumer-trigger" aria-label="More actions" onKeyDown={onKeyDown}>
          Actions
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item textValue="Archive">Archive</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    );
    const trigger = result.getByRole('button', { name: 'More actions' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(trigger.className).toBe('consumer-trigger');
  });

  it('reuses the registered DOM order during keyboard navigation', async () => {
    const compareDocumentPosition = vi.spyOn(Node.prototype, 'compareDocumentPosition');
    const result = render(<Example />);
    const trigger = result.getByRole('button', { name: 'Actions' });

    fireEvent.click(trigger);
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Duplicate'));
    compareDocumentPosition.mockClear();

    fireEvent.keyDown(result.getByRole('menu'), { key: 'ArrowDown' });
    fireEvent.keyDown(result.getByRole('menu'), { key: 'a' });

    expect(compareDocumentPosition).not.toHaveBeenCalled();
    compareDocumentPosition.mockRestore();
  });
});
