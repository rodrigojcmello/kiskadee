/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import type { Ref } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dropdown } from './Dropdown.tsx';

afterEach(cleanup);

describe('Headless Dropdown', () => {
  it('opens from its anchor and reports trigger, escape and outside-press reasons', () => {
    const onOpenChange = vi.fn();
    const result = render(
      <Dropdown.Root onOpenChange={onOpenChange}>
        <Dropdown.Anchor>Open</Dropdown.Anchor>
        <Dropdown.Content>Floating content</Dropdown.Content>
      </Dropdown.Root>
    );
    const anchor = result.getByRole('button', { name: 'Open' });

    fireEvent.click(anchor);
    expect(result.getByText('Floating content')).toBeTruthy();
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger' })
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(result.queryByText('Floating content')).toBeNull();
    expect(document.activeElement).toBe(anchor);
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape' })
    );

    fireEvent.click(anchor);
    fireEvent.pointerDown(document.body);
    expect(result.queryByText('Floating content')).toBeNull();
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'outside-press' })
    );
  });

  it('supports controlled state and anchor width policies', () => {
    const result = render(
      <Dropdown.Root open>
        <Dropdown.Anchor>Anchor</Dropdown.Anchor>
        <Dropdown.Content width="anchor" portalled={false}>
          Controlled
        </Dropdown.Content>
      </Dropdown.Root>
    );

    const content = result.getByText('Controlled');
    expect(content.getAttribute('data-placement')).toMatch(/^bottom/);
    expect(content.getAttribute('data-width')).toBe('anchor');
    expect(content.style.zIndex).toBe('');
  });

  it('passes native anchor attributes through a render callback', () => {
    const result = render(
      <Dropdown.Root>
        <Dropdown.Anchor
          aria-label="Rendered anchor"
          className="consumer-anchor"
          render={(props) => {
            const { ref, ...buttonProps } = props;
            return <button {...buttonProps} ref={ref as Ref<HTMLButtonElement>} />;
          }}
        />
        <Dropdown.Content>Content</Dropdown.Content>
      </Dropdown.Root>
    );
    const anchor = result.getByRole('button', { name: 'Rendered anchor' });

    expect(anchor.className).toBe('consumer-anchor');
    expect(anchor.getAttribute('type')).toBe('button');
  });

  it('keeps closed content mounted only by opt-in and exposes positioning readiness', async () => {
    const states: Array<{ open: boolean; positioned: boolean; placement: string }> = [];
    const renderContent = (open: boolean) => (
      <Dropdown.Root open={open}>
        <Dropdown.Anchor>Anchor</Dropdown.Anchor>
        <Dropdown.Content
          forceMount
          portalled={false}
          render={(props, state) => {
            states.push(state);
            const { ref, ...contentProps } = props;
            return (
              <div {...contentProps} ref={ref} data-render-open={state.open || undefined}>
                Retained content
              </div>
            );
          }}
        />
      </Dropdown.Root>
    );
    const result = render(renderContent(false));
    const retained = result.getByText('Retained content');

    expect(retained.getAttribute('aria-hidden')).toBe('true');
    expect(retained.hasAttribute('inert')).toBe(true);
    expect(retained.hasAttribute('data-closed')).toBe(true);
    expect(retained.hasAttribute('data-render-open')).toBe(false);

    result.rerender(renderContent(true));
    expect(retained.getAttribute('aria-hidden')).toBeNull();
    expect(retained.hasAttribute('inert')).toBe(false);
    expect(retained.hasAttribute('data-open')).toBe(true);
    expect(retained.getAttribute('data-render-open')).toBe('true');
    expect(states).toContainEqual(expect.objectContaining({ open: true, positioned: false }));
    await waitFor(() =>
      expect(states.at(-1)).toEqual(expect.objectContaining({ open: true, positioned: true }))
    );
  });

  it('does not mount closed content on the default path', () => {
    const result = render(
      <Dropdown.Root open={false}>
        <Dropdown.Anchor>Anchor</Dropdown.Anchor>
        <Dropdown.Content>Unmounted content</Dropdown.Content>
      </Dropdown.Root>
    );

    expect(result.queryByText('Unmounted content')).toBeNull();
  });

  it('keeps portalled markup deterministic through hydration', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const tree = (
      <Dropdown.Root defaultOpen>
        <Dropdown.Anchor>Anchor</Dropdown.Anchor>
        <Dropdown.Content>Hydrated content</Dropdown.Content>
      </Dropdown.Root>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    document.body.append(container);

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, tree);
      await Promise.resolve();
    });

    expect(document.body.textContent).toContain('Hydrated content');
    expect(error.mock.calls.flat().join(' ')).not.toContain('Hydration failed');
    await act(async () => root?.unmount());
    container.remove();
    error.mockRestore();
  });
});
