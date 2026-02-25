/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Tabs } from './Tabs';

afterEach(() => {
  cleanup();
});

describe('Headless Tabs', () => {
  it('respects controlled value in compound API', () => {
    render(
      <Tabs.Root value="b">
        <Tabs.Bar>
          <Tabs.Tab value="a">Tab A</Tabs.Tab>
          <Tabs.Tab value="b">Tab B</Tabs.Tab>
        </Tabs.Bar>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
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
        <Tabs.Bar>
          <Tabs.Tab value="first">First</Tabs.Tab>
          <Tabs.Tab value="second">Second</Tabs.Tab>
        </Tabs.Bar>
        <Tabs.Content value="first">One</Tabs.Content>
        <Tabs.Content value="second">Two</Tabs.Content>
      </Tabs.Root>
    );

    expect(screen.getByRole('tablist')).toBeTruthy();
    expect(screen.getAllByRole('tab').length).toBe(2);
    expect(screen.getByRole('tabpanel').textContent).toBe('Two');
    expect(screen.queryByText('One')).toBeNull();
  });

  it('applies classNames mapping to root/bar/tab/content/indicator', () => {
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
        <Tabs.Bar>
          <Tabs.Tab value="a">Tab A</Tabs.Tab>
          <Tabs.Tab value="b">Tab B</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.Bar>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
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
    expect(() => render(<Tabs.Bar>orphan</Tabs.Bar>)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
    expect(() => render(<Tabs.Tab value="x">orphan</Tabs.Tab>)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
    expect(() => render(<Tabs.Content value="x">orphan</Tabs.Content>)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
    expect(() => render(<Tabs.Indicator />)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
  });

  it('keeps non-selected tabs keyboard focusable', () => {
    render(
      <Tabs.Root defaultValue="second">
        <Tabs.Bar>
          <Tabs.Tab value="first">First</Tabs.Tab>
          <Tabs.Tab value="second">Second</Tabs.Tab>
        </Tabs.Bar>
        <Tabs.Content value="first">One</Tabs.Content>
        <Tabs.Content value="second">Two</Tabs.Content>
      </Tabs.Root>
    );

    const firstTab = screen.getByRole('tab', { name: 'First' });
    const secondTab = screen.getByRole('tab', { name: 'Second' });

    expect(firstTab.getAttribute('tabindex')).toBe('0');
    expect(secondTab.getAttribute('tabindex')).toBe('0');
  });

  it('selects focused tab in automatic activation mode', () => {
    render(
      <Tabs.Root defaultValue="second" activationMode="automatic">
        <Tabs.Bar>
          <Tabs.Tab value="first">First</Tabs.Tab>
          <Tabs.Tab value="second">Second</Tabs.Tab>
        </Tabs.Bar>
        <Tabs.Content value="first">One</Tabs.Content>
        <Tabs.Content value="second">Two</Tabs.Content>
      </Tabs.Root>
    );

    const firstTab = screen.getByRole('tab', { name: 'First' });
    const secondTab = screen.getByRole('tab', { name: 'Second' });

    expect(secondTab.getAttribute('aria-selected')).toBe('true');
    fireEvent.focus(firstTab);
    expect(firstTab.getAttribute('aria-selected')).toBe('true');
    expect(secondTab.getAttribute('aria-selected')).toBe('false');
  });
});
