/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BottomSheet } from './BottomSheet.tsx';

afterEach(cleanup);

describe('Headless BottomSheet', () => {
  it('opens as a modal dialog and restores focus after Close', async () => {
    const result = render(
      <BottomSheet.Root>
        <BottomSheet.Trigger>Open actions</BottomSheet.Trigger>
        <BottomSheet.Content aria-label="Actions">
          <BottomSheet.Close>Close</BottomSheet.Close>
        </BottomSheet.Content>
      </BottomSheet.Root>
    );
    const trigger = result.getByRole('button', { name: 'Open actions' });

    fireEvent.click(trigger);
    expect(result.getByRole('dialog', { name: 'Actions' }).getAttribute('aria-modal')).toBe('true');

    fireEvent.click(result.getByRole('button', { name: 'Close' }));
    expect(result.queryByRole('dialog', { name: 'Actions' })).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('reports scrim and Escape dismiss reasons independently', () => {
    const onOpenChange = vi.fn();
    const result = render(
      <BottomSheet.Root defaultOpen onOpenChange={onOpenChange}>
        <BottomSheet.Trigger>Open</BottomSheet.Trigger>
        <BottomSheet.Content aria-label="Actions" />
      </BottomSheet.Root>
    );
    const dialog = result.getByRole('dialog', { name: 'Actions' });
    const scrim = dialog.parentElement;
    if (!scrim) throw new Error('Expected scrim');

    fireEvent.pointerDown(scrim);
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'scrim' })
    );

    fireEvent.click(result.getByRole('button', { name: 'Open' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape' })
    );
  });
});
