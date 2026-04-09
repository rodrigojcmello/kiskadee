/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HeadlessTabs } from './HeadlessTabs';

afterEach(() => {
  cleanup();
});

describe('HeadlessTabs', () => {
  it('respects controlled value in compound API', () => {
    render(
      <HeadlessTabs.Root value="b">
        <HeadlessTabs.Bar>
          <HeadlessTabs.Tab value="a">Tab A</HeadlessTabs.Tab>
          <HeadlessTabs.Tab value="b">Tab B</HeadlessTabs.Tab>
        </HeadlessTabs.Bar>
        <HeadlessTabs.Content value="a">Panel A</HeadlessTabs.Content>
        <HeadlessTabs.Content value="b">Panel B</HeadlessTabs.Content>
      </HeadlessTabs.Root>
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
      <HeadlessTabs.Root defaultValue="second">
        <HeadlessTabs.Bar>
          <HeadlessTabs.Tab value="first">First</HeadlessTabs.Tab>
          <HeadlessTabs.Tab value="second">Second</HeadlessTabs.Tab>
        </HeadlessTabs.Bar>
        <HeadlessTabs.Content value="first">One</HeadlessTabs.Content>
        <HeadlessTabs.Content value="second">Two</HeadlessTabs.Content>
      </HeadlessTabs.Root>
    );

    expect(screen.getByRole('tablist')).toBeTruthy();
    expect(screen.getAllByRole('tab').length).toBe(2);
    expect(screen.getByRole('tabpanel').textContent).toBe('Two');
    expect(screen.queryByText('One')).toBeNull();
  });

  it('applies classNames mapping to root/bar/tab/content/indicator', () => {
    const { container } = render(
      <HeadlessTabs.Root
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
        <HeadlessTabs.Bar>
          <HeadlessTabs.Tab value="a">Tab A</HeadlessTabs.Tab>
          <HeadlessTabs.Tab value="b">Tab B</HeadlessTabs.Tab>
          <HeadlessTabs.Indicator />
        </HeadlessTabs.Bar>
        <HeadlessTabs.Content value="a">Panel A</HeadlessTabs.Content>
        <HeadlessTabs.Content value="b">Panel B</HeadlessTabs.Content>
      </HeadlessTabs.Root>
    );

    expect(container.querySelector('.tabs-root')).toBeTruthy();
    expect(screen.getByRole('tablist').className).toBe('tabs-list');
    expect(screen.getByRole('tab', { name: 'Tab A' }).className).toBe('tabs-trigger');
    expect(screen.getByRole('tab', { name: 'Tab B' }).className).toBe('tabs-trigger-active');
    expect(screen.getByRole('tabpanel').className).toBe('tabs-panel');
    expect(container.querySelector('.tabs-indicator')).toBeTruthy();
  });

  it('throws when compound components are used outside HeadlessTabs.Root', () => {
    expect(() => render(<HeadlessTabs.Bar>orphan</HeadlessTabs.Bar>)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
    expect(() => render(<HeadlessTabs.Tab value="x">orphan</HeadlessTabs.Tab>)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
    expect(() => render(<HeadlessTabs.Content value="x">orphan</HeadlessTabs.Content>)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
    expect(() => render(<HeadlessTabs.Indicator />)).toThrow(
      'Tabs components must be used within a Tabs.Root'
    );
  });

  it('keeps non-selected tabs keyboard focusable', () => {
    render(
      <HeadlessTabs.Root defaultValue="second">
        <HeadlessTabs.Bar>
          <HeadlessTabs.Tab value="first">First</HeadlessTabs.Tab>
          <HeadlessTabs.Tab value="second">Second</HeadlessTabs.Tab>
        </HeadlessTabs.Bar>
        <HeadlessTabs.Content value="first">One</HeadlessTabs.Content>
        <HeadlessTabs.Content value="second">Two</HeadlessTabs.Content>
      </HeadlessTabs.Root>
    );

    const firstTab = screen.getByRole('tab', { name: 'First' });
    const secondTab = screen.getByRole('tab', { name: 'Second' });

    expect(firstTab.getAttribute('tabindex')).toBe('0');
    expect(secondTab.getAttribute('tabindex')).toBe('0');
  });

  it('selects focused tab in automatic activation mode', () => {
    render(
      <HeadlessTabs.Root defaultValue="second" activationMode="automatic">
        <HeadlessTabs.Bar>
          <HeadlessTabs.Tab value="first">First</HeadlessTabs.Tab>
          <HeadlessTabs.Tab value="second">Second</HeadlessTabs.Tab>
        </HeadlessTabs.Bar>
        <HeadlessTabs.Content value="first">One</HeadlessTabs.Content>
        <HeadlessTabs.Content value="second">Two</HeadlessTabs.Content>
      </HeadlessTabs.Root>
    );

    const firstTab = screen.getByRole('tab', { name: 'First' });
    const secondTab = screen.getByRole('tab', { name: 'Second' });

    expect(secondTab.getAttribute('aria-selected')).toBe('true');
    fireEvent.focus(firstTab);
    expect(firstTab.getAttribute('aria-selected')).toBe('true');
    expect(secondTab.getAttribute('aria-selected')).toBe('false');
  });
});
