/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Tabs } from './Tabs';

afterEach(() => {
  cleanup();
});

describe('Headless Tabs', () => {
  it('respects controlled value in compound API', () => {
    render(
      <Tabs.Root value="b">
        <Tabs.List>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
          <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="a">Panel A</Tabs.Panel>
        <Tabs.Panel value="b">Panel B</Tabs.Panel>
      </Tabs.Root>
    );

    const tabA = screen.getByRole('tab', { name: 'Tab A' });
    const tabB = screen.getByRole('tab', { name: 'Tab B' });
    const panelB = screen.getByRole('tabpanel');

    expect(tabA.getAttribute('aria-selected')).toBe('false');
    expect(tabB.getAttribute('aria-selected')).toBe('true');
    expect(tabB.getAttribute('aria-controls')).toContain('tabs-');
    expect(panelB.textContent).toBe('Panel B');
    expect(screen.queryByText('Panel A')).toBeNull();
  });

  it('supports compound API for custom composition', () => {
    render(
      <Tabs.Root defaultValue="second">
        <Tabs.List>
          <Tabs.Trigger value="first">First</Tabs.Trigger>
          <Tabs.Trigger value="second">Second</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="first">One</Tabs.Panel>
        <Tabs.Panel value="second">Two</Tabs.Panel>
      </Tabs.Root>
    );

    expect(screen.getByRole('tablist')).toBeTruthy();
    expect(screen.getAllByRole('tab').length).toBe(2);
    expect(screen.getByRole('tabpanel').textContent).toBe('Two');
    expect(screen.queryByText('One')).toBeNull();
  });

  it('applies classNames mapping to root/list/trigger/panel/indicator', () => {
    const { container } = render(
      <Tabs.Root
        classNames={{
          e1: 'tabs-root',
          e2: 'tabs-list',
          e3: 'tabs-trigger',
          e3a: 'tabs-trigger-active',
          e4: 'tabs-panel',
          e5: 'tabs-indicator'
        }}
        defaultValue="b"
      >
        <Tabs.List>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
          <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="a">Panel A</Tabs.Panel>
        <Tabs.Panel value="b">Panel B</Tabs.Panel>
      </Tabs.Root>
    );

    expect(container.querySelector('.tabs-root')).toBeTruthy();
    expect(screen.getByRole('tablist').className).toBe('tabs-list');
    expect(screen.getByRole('tab', { name: 'Tab A' }).className).toBe('tabs-trigger');
    expect(screen.getByRole('tab', { name: 'Tab B' }).className).toBe('tabs-trigger-active');
    expect(screen.getByRole('tabpanel').className).toBe('tabs-panel');
    expect(container.querySelector('.tabs-indicator')).toBeTruthy();
  });

  it('throws when compound components are used outside Tabs.Root', () => {
    expect(() => render(<Tabs.List>orphan</Tabs.List>)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
    expect(() => render(<Tabs.Trigger value="x">orphan</Tabs.Trigger>)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
    expect(() => render(<Tabs.Panel value="x">orphan</Tabs.Panel>)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
    expect(() => render(<Tabs.Indicator />)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
  });
});
