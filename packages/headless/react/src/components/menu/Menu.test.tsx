/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Menu } from './Menu.tsx';

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

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

function GroupedExample() {
  return (
    <Menu.Root>
      <Menu.Trigger>Grouped actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Group>
          <Menu.GroupLabel>Clipboard</Menu.GroupLabel>
          <Menu.Item textValue="Cut">Cut</Menu.Item>
          <Menu.Item textValue="Copy">Copy</Menu.Item>
        </Menu.Group>
        <hr />
        <Menu.Group>
          <Menu.GroupLabel>Navigation</Menu.GroupLabel>
          <Menu.Item textValue="Search">Search</Menu.Item>
          <Menu.Item textValue="Settings">Settings</Menu.Item>
        </Menu.Group>
      </Menu.Content>
    </Menu.Root>
  );
}

function RadioExample({
  value,
  defaultValue = 'date',
  onValueChange = vi.fn()
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger>Sort</Menu.Trigger>
      <Menu.Content>
        <Menu.RadioGroup value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
          <Menu.GroupLabel>Sort by</Menu.GroupLabel>
          <Menu.RadioItem value="date" textValue="Date">
            Date
          </Menu.RadioItem>
          <Menu.RadioItem value="name" textValue="Name">
            Name
          </Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

function NestedExample({
  onDeepSelect = vi.fn(),
  forceMount = false
}: {
  onDeepSelect?: () => void;
  forceMount?: boolean;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content forceMount={forceMount}>
        <Menu.Item textValue="Rename">Rename</Menu.Item>
        <Menu.Sub>
          <Menu.SubTrigger textValue="Share">Share</Menu.SubTrigger>
          <Menu.SubContent forceMount={forceMount}>
            <Menu.Item textValue="Email">Email</Menu.Item>
            <Menu.Sub>
              <Menu.SubTrigger textValue="Advanced">Advanced</Menu.SubTrigger>
              <Menu.SubContent forceMount={forceMount}>
                <Menu.Item textValue="Copy link" onSelect={onDeepSelect}>
                  Copy link
                </Menu.Item>
                <Menu.Item textValue="Zebra">Zebra</Menu.Item>
              </Menu.SubContent>
            </Menu.Sub>
          </Menu.SubContent>
        </Menu.Sub>
        <Menu.Item textValue="Zoom">Zoom</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}

function DynamicRadioGroups({ includeFirst }: { includeFirst: boolean }) {
  return (
    <Menu.Root>
      <Menu.Trigger>View</Menu.Trigger>
      <Menu.Content>
        {includeFirst ? (
          <Menu.RadioGroup id="density" defaultValue="comfortable">
            <Menu.RadioItem value="comfortable" textValue="Comfortable">
              Comfortable
            </Menu.RadioItem>
            <Menu.RadioItem value="compact" textValue="Compact">
              Compact
            </Menu.RadioItem>
          </Menu.RadioGroup>
        ) : null}
        <Menu.RadioGroup id="order" defaultValue="ascending">
          <Menu.RadioItem value="ascending" textValue="Ascending">
            Ascending
          </Menu.RadioItem>
          <Menu.RadioItem value="descending" textValue="Descending">
            Descending
          </Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

describe('Headless Menu', () => {
  it.each([
    ['click', 'first'],
    ['Enter', 'first'],
    [' ', 'first'],
    ['ArrowDown', 'first'],
    ['ArrowUp', 'last']
  ] as const)('opens with %s and focuses the %s item immediately', async (interaction, target) => {
    const result = render(<Example />);
    const trigger = result.getByRole('button', { name: 'Actions' });

    if (interaction === 'click') fireEvent.click(trigger);
    else fireEvent.keyDown(trigger, { key: interaction });

    const expectedText = target === 'first' ? 'Duplicate' : 'Archive';
    await waitFor(() => expect(document.activeElement?.textContent).toBe(expectedText));
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('uses menu semantics, moves real focus and restores it after selection', async () => {
    const onSelect = vi.fn();
    const result = render(<Example onSelect={onSelect} />);
    const trigger = result.getByRole('button', { name: 'Actions' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(trigger.getAttribute('aria-controls') ?? '')).toBe(
      result.getByRole('menu')
    );
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Duplicate'));

    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('keeps a custom root content id synchronized with the trigger', () => {
    const result = render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content id="actions-menu">
          <Menu.Item textValue="Duplicate">Duplicate</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    );
    const trigger = result.getByRole('button', { name: 'Actions' });
    const menu = result.getByRole('menu');

    expect(trigger.getAttribute('aria-controls')).toBe('actions-menu');
    expect(menu.id).toBe('actions-menu');
    expect(document.getElementById('actions-menu')).toBe(menu);
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

  it('labels explicit groups without registering their labels as menu items', async () => {
    const result = render(<GroupedExample />);
    const trigger = result.getByRole('button', { name: 'Grouped actions' });

    fireEvent.click(trigger);
    const groups = await result.findAllByRole('group');
    const labels = ['Clipboard', 'Navigation'];

    expect(groups).toHaveLength(2);
    groups.forEach((group, index) => {
      const label = result.getByText(labels[index] ?? '');
      expect(group.getAttribute('aria-labelledby')).toBe(label.id);
      expect(label.getAttribute('role')).toBeNull();
      expect(label.getAttribute('tabindex')).toBeNull();
    });
    expect(result.getAllByRole('menuitem')).toHaveLength(4);
  });

  it('navigates and searches across groups while ignoring labels and separators', async () => {
    const result = render(<GroupedExample />);
    const trigger = result.getByRole('button', { name: 'Grouped actions' });

    fireEvent.click(trigger);
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Cut'));
    fireEvent.keyDown(result.getByRole('menu'), { key: 'End' });
    expect(document.activeElement?.textContent).toBe('Settings');
    fireEvent.keyDown(result.getByRole('menu'), { key: 'Home' });
    expect(document.activeElement?.textContent).toBe('Cut');
    fireEvent.keyDown(result.getByRole('menu'), { key: 's' });
    expect(document.activeElement?.textContent).toBe('Search');
  });

  it('does not create a broken label reference for an unlabeled group', async () => {
    const result = render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Group>
            <Menu.Item textValue="Archive">Archive</Menu.Item>
          </Menu.Group>
        </Menu.Content>
      </Menu.Root>
    );

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    expect((await result.findByRole('group')).getAttribute('aria-labelledby')).toBeNull();
  });

  it('selects exactly one uncontrolled radio item and closes the menu', async () => {
    const onValueChange = vi.fn();
    const result = render(<RadioExample onValueChange={onValueChange} />);
    const trigger = result.getByRole('button', { name: 'Sort' });

    fireEvent.click(trigger);
    const date = await result.findByRole('menuitemradio', { name: 'Date' });
    const name = result.getByRole('menuitemradio', { name: 'Name' });
    expect(date.getAttribute('aria-checked')).toBe('true');
    expect(name.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(name);
    expect(onValueChange).toHaveBeenCalledWith(
      'name',
      expect.objectContaining({ previousValue: 'date' })
    );
    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    expect(
      (await result.findByRole('menuitemradio', { name: 'Name' })).getAttribute('aria-checked')
    ).toBe('true');
  });

  it('keeps controlled radio state authoritative and closes when reselecting it', async () => {
    const onValueChange = vi.fn();
    const result = render(<RadioExample value="date" onValueChange={onValueChange} />);
    const trigger = result.getByRole('button', { name: 'Sort' });

    fireEvent.click(trigger);
    fireEvent.click(await result.findByRole('menuitemradio', { name: 'Date' }));

    expect(onValueChange).not.toHaveBeenCalled();
    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps multiple uncontrolled radio groups isolated across close and reopen', async () => {
    const result = render(
      <Menu.Root>
        <Menu.Trigger>Sort</Menu.Trigger>
        <Menu.Content>
          <Menu.RadioGroup defaultValue="date">
            <Menu.RadioItem value="date" textValue="Date">
              Date
            </Menu.RadioItem>
            <Menu.RadioItem value="name" textValue="Name">
              Name
            </Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.RadioGroup defaultValue="ascending">
            <Menu.RadioItem value="ascending" textValue="Ascending">
              Ascending
            </Menu.RadioItem>
            <Menu.RadioItem value="descending" textValue="Descending">
              Descending
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu.Root>
    );
    const trigger = result.getByRole('button', { name: 'Sort' });

    fireEvent.click(trigger);
    fireEvent.click(await result.findByRole('menuitemradio', { name: 'Name' }));
    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    fireEvent.click(trigger);
    fireEvent.click(await result.findByRole('menuitemradio', { name: 'Descending' }));
    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    fireEvent.click(trigger);

    expect(
      (await result.findByRole('menuitemradio', { name: 'Name' })).getAttribute('aria-checked')
    ).toBe('true');
    expect(
      result.getByRole('menuitemradio', { name: 'Descending' }).getAttribute('aria-checked')
    ).toBe('true');
    expect(result.getByRole('menuitemradio', { name: 'Date' }).getAttribute('aria-checked')).toBe(
      'false'
    );
    expect(
      result.getByRole('menuitemradio', { name: 'Ascending' }).getAttribute('aria-checked')
    ).toBe('false');
  });

  it('uses an explicit group id to preserve radio state across dynamic reordering', async () => {
    const result = render(<DynamicRadioGroups includeFirst />);
    const trigger = result.getByRole('button', { name: 'View' });

    fireEvent.click(trigger);
    fireEvent.click(await result.findByRole('menuitemradio', { name: 'Descending' }));
    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    result.rerender(<DynamicRadioGroups includeFirst={false} />);
    fireEvent.click(trigger);

    expect(
      (await result.findByRole('menuitemradio', { name: 'Descending' })).getAttribute(
        'aria-checked'
      )
    ).toBe('true');
    expect(result.queryByRole('menuitemradio', { name: 'Comfortable' })).toBeNull();
  });

  it('allows a radio onSelect handler to cancel selection and closing', async () => {
    const onValueChange = vi.fn();
    const result = render(
      <Menu.Root>
        <Menu.Trigger>Sort</Menu.Trigger>
        <Menu.Content>
          <Menu.RadioGroup defaultValue="date" onValueChange={onValueChange}>
            <Menu.RadioItem value="date" textValue="Date">
              Date
            </Menu.RadioItem>
            <Menu.RadioItem
              value="name"
              textValue="Name"
              onSelect={(event) => event.preventDefault()}
            >
              Name
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu.Root>
    );

    fireEvent.click(result.getByRole('button', { name: 'Sort' }));
    fireEvent.click(await result.findByRole('menuitemradio', { name: 'Name' }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(result.getByRole('menu')).toBeTruthy();
    expect(result.getByRole('menuitemradio', { name: 'Date' }).getAttribute('aria-checked')).toBe(
      'true'
    );
  });

  it('opens recursive submenus with logical arrows and closes one level per Escape', async () => {
    const result = render(<NestedExample />);
    const rootTrigger = result.getByRole('button', { name: 'Actions' });

    fireEvent.click(rootTrigger);
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Rename'));
    fireEvent.keyDown(result.getByRole('menu'), { key: 'ArrowDown' });
    const share = result.getByRole('menuitem', { name: 'Share' });
    expect(document.activeElement).toBe(share);
    fireEvent.keyDown(share, { key: 'ArrowRight' });

    await waitFor(() => expect(document.activeElement?.textContent).toBe('Email'));
    expect(share.getAttribute('aria-haspopup')).toBe('menu');
    expect(share.getAttribute('aria-expanded')).toBe('true');
    expect(result.getAllByRole('menu')).toHaveLength(2);
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    const advanced = result.getByRole('menuitem', { name: 'Advanced' });
    fireEvent.keyDown(advanced, { key: 'ArrowRight' });

    await waitFor(() => expect(document.activeElement?.textContent).toBe('Copy link'));
    expect(result.getAllByRole('menu')).toHaveLength(3);
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    await waitFor(() => expect(result.getAllByRole('menu')).toHaveLength(2));
    expect(document.activeElement).toBe(advanced);
    fireEvent.keyDown(advanced, { key: 'Escape' });
    await waitFor(() => expect(result.getAllByRole('menu')).toHaveLength(1));
    expect(document.activeElement).toBe(share);
    fireEvent.keyDown(share, { key: 'Escape' });
    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(rootTrigger);
  });

  it('retains recursive submenu DOM as inert while semantic closing remains level-local', async () => {
    const result = render(<NestedExample forceMount />);
    const rootTrigger = result.getByRole('button', { name: 'Actions' });

    expect(result.queryByRole('menu')).toBeNull();
    expect(result.getAllByRole('menu', { hidden: true })).toHaveLength(3);
    expect(
      result
        .getAllByRole('menu', { hidden: true })
        .every((menu) => menu.hasAttribute('data-closed'))
    ).toBe(true);

    fireEvent.keyDown(rootTrigger, { key: 'ArrowDown' });
    await waitFor(() => expect(result.getAllByRole('menu')).toHaveLength(1));
    fireEvent.keyDown(result.getByRole('menu'), { key: 'ArrowDown' });
    const share = result.getByRole('menuitem', { name: 'Share' });
    fireEvent.keyDown(share, { key: 'ArrowRight' });
    await waitFor(() => expect(result.getAllByRole('menu')).toHaveLength(2));

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    await waitFor(() => expect(result.getAllByRole('menu')).toHaveLength(1));
    expect(result.getAllByRole('menu', { hidden: true })).toHaveLength(3);
    expect(document.activeElement).toBe(share);

    fireEvent.keyDown(share, { key: 'Escape' });
    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    expect(result.getAllByRole('menu', { hidden: true })).toHaveLength(3);
    expect(document.activeElement).toBe(rootTrigger);
  });

  it('uses mirrored submenu arrows in RTL', async () => {
    const result = render(
      <div dir="rtl">
        <NestedExample />
      </div>
    );

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Rename'));
    fireEvent.keyDown(result.getByRole('menu'), { key: 'ArrowDown' });
    const share = result.getByRole('menuitem', { name: 'Share' });
    fireEvent.keyDown(share, { key: 'ArrowLeft' });
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Email'));

    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    await waitFor(() => expect(result.getAllByRole('menu')).toHaveLength(1));
    expect(document.activeElement).toBe(share);
  });

  it('closes the whole tree and restores root focus after a deep selection', async () => {
    const onDeepSelect = vi.fn();
    const result = render(<NestedExample onDeepSelect={onDeepSelect} />);
    const rootTrigger = result.getByRole('button', { name: 'Actions' });

    fireEvent.click(rootTrigger);
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Rename'));
    fireEvent.keyDown(result.getByRole('menu'), { key: 'ArrowDown' });
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Email'));
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Copy link'));
    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' });

    expect(onDeepSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(rootTrigger);
  });

  it('keeps ancestor menus open while interacting with portalled descendants', async () => {
    const result = render(<NestedExample />);

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Rename'));
    fireEvent.keyDown(result.getByRole('menu'), { key: 'ArrowDown' });
    const share = result.getByRole('menuitem', { name: 'Share' });
    fireEvent.click(share);
    await waitFor(() => expect(result.getAllByRole('menu')).toHaveLength(2));
    const advanced = result.getByRole('menuitem', { name: 'Advanced' });
    fireEvent.pointerDown(advanced, { pointerType: 'mouse' });
    fireEvent.click(advanced);

    await waitFor(() => expect(result.getAllByRole('menu')).toHaveLength(3));
    expect(result.getByRole('button', { name: 'Actions' }).getAttribute('aria-expanded')).toBe(
      'true'
    );
  });

  it('notifies each open level once for one outside press', async () => {
    const onRootOpenChange = vi.fn();
    const onSubOpenChange = vi.fn();
    const result = render(
      <Menu.Root onOpenChange={onRootOpenChange}>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Sub onOpenChange={onSubOpenChange}>
            <Menu.SubTrigger textValue="Share">Share</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item textValue="Email">Email</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu.Root>
    );

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    fireEvent.click(await result.findByRole('menuitem', { name: 'Share' }));
    await waitFor(() => expect(result.getAllByRole('menu')).toHaveLength(2));
    fireEvent.pointerDown(document.body);

    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    expect(onRootOpenChange.mock.calls.filter(([open]) => open === false)).toHaveLength(1);
    expect(onSubOpenChange.mock.calls.filter(([open]) => open === false)).toHaveLength(1);
  });

  it('closes a hover-opened submenu before its parent on Escape', async () => {
    vi.useFakeTimers();
    const result = render(<NestedExample />);

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    await act(async () => vi.runOnlyPendingTimersAsync());
    const share = result.getByRole('menuitem', { name: 'Share' });
    fireEvent.mouseMove(share);
    fireEvent.mouseEnter(share);
    await act(async () => vi.advanceTimersByTimeAsync(100));
    expect(result.getAllByRole('menu')).toHaveLength(2);

    fireEvent.keyDown(share, { key: 'Escape' });
    await act(async () => vi.runOnlyPendingTimersAsync());
    expect(result.getAllByRole('menu')).toHaveLength(1);
    expect(document.activeElement).toBe(share);
  });

  it('moves focus into a submenu already opened by hover', async () => {
    vi.useFakeTimers();
    const result = render(<NestedExample />);

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    await act(async () => vi.runOnlyPendingTimersAsync());
    const share = result.getByRole('menuitem', { name: 'Share' });
    fireEvent.mouseMove(share);
    fireEvent.mouseEnter(share);
    await act(async () => vi.advanceTimersByTimeAsync(100));
    expect(document.activeElement).toBe(share);

    fireEvent.keyDown(share, { key: 'ArrowRight' });
    await act(async () => vi.runOnlyPendingTimersAsync());
    expect(document.activeElement?.textContent).toBe('Email');
  });

  it('closes a hover-opened submenu when arrow navigation moves to a sibling item', async () => {
    vi.useFakeTimers();
    const result = render(<NestedExample />);

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    await act(async () => vi.runOnlyPendingTimersAsync());
    const share = result.getByRole('menuitem', { name: 'Share' });
    fireEvent.mouseMove(share);
    fireEvent.mouseEnter(share);
    await act(async () => vi.advanceTimersByTimeAsync(100));
    expect(result.getAllByRole('menu')).toHaveLength(2);

    fireEvent.keyDown(share, { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toBe('Zoom');
    expect(result.getAllByRole('menu')).toHaveLength(1);
  });

  it('closes a hover-opened submenu when typeahead moves to a sibling item', async () => {
    vi.useFakeTimers();
    const result = render(<NestedExample />);

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    await act(async () => vi.runOnlyPendingTimersAsync());
    const share = result.getByRole('menuitem', { name: 'Share' });
    fireEvent.mouseMove(share);
    fireEvent.mouseEnter(share);
    await act(async () => vi.advanceTimersByTimeAsync(100));
    expect(result.getAllByRole('menu')).toHaveLength(2);

    fireEvent.keyDown(share, { key: 'z' });
    expect(document.activeElement?.textContent).toBe('Zoom');
    expect(result.getAllByRole('menu')).toHaveLength(1);
  });

  it('keeps custom submenu ids synchronized across ARIA relationships', async () => {
    const result = render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Sub>
            <Menu.SubTrigger id="share-trigger" textValue="Share">
              Share
            </Menu.SubTrigger>
            <Menu.SubContent id="share-content">
              <Menu.Item textValue="Email">Email</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu.Root>
    );

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    const trigger = await result.findByRole('menuitem', { name: 'Share' });
    expect(trigger.id).toBe('share-trigger');
    expect(trigger.getAttribute('aria-controls')).toBe('share-content');
    fireEvent.click(trigger);
    const menus = await result.findAllByRole('menu');
    const submenu = menus[1];
    expect(submenu?.id).toBe('share-content');
    expect(submenu?.getAttribute('aria-labelledby')).toBe('share-trigger');
  });

  it('does not replace an accepted controlled sibling before its owner updates props', async () => {
    const onAcceptedOpenChange = vi.fn();
    const onRequestedOpenChange = vi.fn();
    const result = render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content>
          <Menu.Sub open onOpenChange={onAcceptedOpenChange}>
            <Menu.SubTrigger textValue="Accepted">Accepted</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item textValue="Accepted child">Accepted child</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Sub open={false} onOpenChange={onRequestedOpenChange}>
            <Menu.SubTrigger textValue="Requested">Requested</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item textValue="Requested child">Requested child</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu.Root>
    );

    await result.findByRole('menuitem', { name: 'Accepted child' });
    const accepted = result.getByRole('menuitem', { name: 'Accepted' });
    const requested = result.getByRole('menuitem', { name: 'Requested' });
    expect(accepted.getAttribute('aria-expanded')).toBe('true');
    expect(requested.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(requested);

    expect(onRequestedOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger' })
    );
    expect(onAcceptedOpenChange).not.toHaveBeenCalled();
    expect(result.getByRole('menuitem', { name: 'Accepted child' })).toBeTruthy();
    expect(result.queryByRole('menuitem', { name: 'Requested child' })).toBeNull();
    expect(accepted.getAttribute('aria-expanded')).toBe('true');
    expect(requested.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps typeahead scoped to the submenu level', async () => {
    const result = render(<NestedExample />);

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Rename'));
    fireEvent.keyDown(result.getByRole('menu'), { key: 'ArrowDown' });
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Email'));
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Copy link'));

    fireEvent.keyDown(document.activeElement as Element, { key: 'z' });
    expect(document.activeElement?.textContent).toBe('Zebra');
  });

  it('honors the mouse-only 100ms submenu hover delay', async () => {
    vi.useFakeTimers();
    const result = render(<NestedExample />);

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    await act(async () => vi.runOnlyPendingTimersAsync());
    const share = result.getByRole('menuitem', { name: 'Share' });
    fireEvent.mouseEnter(share);
    await act(async () => vi.advanceTimersByTimeAsync(99));
    expect(result.getAllByRole('menu')).toHaveLength(1);
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(result.getAllByRole('menu')).toHaveLength(2);
  });

  it('keeps a safe pointer path open and applies the 150ms close delay', async () => {
    vi.useFakeTimers();
    const result = render(<NestedExample />);

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    await act(async () => vi.runOnlyPendingTimersAsync());
    const share = result.getByRole('menuitem', { name: 'Share' });
    fireEvent.mouseEnter(share);
    await act(async () => vi.advanceTimersByTimeAsync(100));
    const submenu = result.getAllByRole('menu')[1];
    expect(submenu).toBeTruthy();
    vi.spyOn(share, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      right: 100,
      bottom: 30,
      left: 0,
      width: 100,
      height: 30,
      toJSON: () => ({})
    });
    vi.spyOn(submenu as HTMLElement, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 0,
      top: 0,
      right: 200,
      bottom: 100,
      left: 100,
      width: 100,
      height: 100,
      toJSON: () => ({})
    });

    fireEvent.mouseLeave(share, { clientX: 98, clientY: 15, relatedTarget: document.body });
    fireEvent.mouseMove(document, { clientX: 105, clientY: 15 });
    fireEvent.mouseEnter(submenu as HTMLElement);
    await act(async () => vi.advanceTimersByTimeAsync(200));
    expect(result.getAllByRole('menu')).toHaveLength(2);

    fireEvent.mouseLeave(submenu as HTMLElement, { relatedTarget: document.body });
    await act(async () => vi.advanceTimersByTimeAsync(149));
    expect(result.getAllByRole('menu')).toHaveLength(2);
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(result.getAllByRole('menu')).toHaveLength(1);
  });

  it('restores the trigger when hover closing unmounts the focused submenu item', async () => {
    vi.useFakeTimers();
    const result = render(<NestedExample />);

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    await act(async () => vi.runOnlyPendingTimersAsync());
    const share = result.getByRole('menuitem', { name: 'Share' });
    fireEvent.mouseMove(share);
    fireEvent.mouseEnter(share);
    await act(async () => vi.advanceTimersByTimeAsync(100));
    const submenu = result.getAllByRole('menu')[1] as HTMLElement;
    const email = result.getByRole('menuitem', { name: 'Email' });
    fireEvent.mouseMove(email);
    expect(document.activeElement).toBe(email);

    fireEvent.mouseLeave(submenu, { relatedTarget: document.body });
    await act(async () => vi.advanceTimersByTimeAsync(150));
    expect(result.getAllByRole('menu')).toHaveLength(1);
    expect(document.activeElement).toBe(share);
  });
});
