/** @vitest-environment jsdom */

import { defineIconFamily } from '@kiskadee/icons/interface';
import { Dropdown as HeadlessDropdown } from '@kiskadee/react-headless/dropdown';
import { Select as HeadlessSelect } from '@kiskadee/react-headless/select';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { createRef, type ReactNode, type Ref } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconFamilyProvider } from '../../shared/contexts/IconFamilyContext.tsx';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Dropdown } from './Dropdown.tsx';
import { loadDropdownPresenceEffect } from './effects/presence/index.ts';

function Check() {
  return <svg data-testid="check-glyph" />;
}

const iconFamily = defineIconFamily({
  id: 'test-icons',
  label: 'Test icons',
  glyphs: { check: Check }
});

const context: KiskadeeContextValue = {
  classesMap: {
    dropdown: {
      e1: { d: 'surface' },
      e2: {
        d: 'item-geometry',
        s: { all: 'item-size' },
        rr: { all: 'item-rounded' },
        rp: { all: 'item-pill' },
        rs: { all: 'item-square' },
        c: {
          s: {
            neutral: { m: 'item-neutral' },
            destructive: { m: 'item-destructive' }
          }
        }
      },
      e3: { s: { all: 'icon-size' } },
      e4: { d: 'label-style' },
      e5: { d: 'description-style' },
      e6: { d: 'trailing-style' },
      e7: {},
      e8: { d: 'end-text-style' },
      e9: { d: 'group-label-style' },
      e10: { d: 'checkmark-style' }
    }
  },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

const presenceContext: KiskadeeContextValue = {
  ...context,
  global: {
    components: {
      dropdown: {
        effects: {
          presence: {
            profile: 'fade-translate',
            profiles: {
              'fade-translate': {
                distancePx: 4,
                enterDurationMs: 120,
                exitDurationMs: 60,
                enterEasing: 'ease-out',
                exitEasing: 'ease-in'
              },
              'grow-height': {
                enterDurationMs: 180,
                exitDurationMs: 120,
                enterEasing: 'ease-out',
                exitEasing: 'ease-in'
              }
            }
          }
        }
      }
    }
  }
};

function renderDropdown(
  children: ReactNode,
  layout: 'independent' | 'columns' = 'independent',
  radius: 'rounded' | 'pill' | 'square' = 'rounded'
) {
  return render(
    <KiskadeeContext.Provider value={context}>
      <IconFamilyProvider families={[iconFamily]} family="test-icons">
        <Dropdown.VisualProvider radius={radius}>
          <Dropdown.Surface>
            <Dropdown.Items layout={layout}>{children}</Dropdown.Items>
          </Dropdown.Surface>
        </Dropdown.VisualProvider>
      </IconFamilyProvider>
    </KiskadeeContext.Provider>
  );
}

function renderPresenceSelect(contentRef: Ref<HTMLDivElement>) {
  const options = [{ value: 'first', label: 'First' }];
  return render(
    <KiskadeeContext.Provider value={presenceContext}>
      <Dropdown.VisualProvider presence="grow-height">
        <HeadlessSelect.Root options={options} defaultValue="first">
          <HeadlessSelect.Trigger>Select</HeadlessSelect.Trigger>
          <Dropdown.Presence>
            {({ forceMount, render: renderPresence }) => (
              <HeadlessSelect.Content
                ref={contentRef}
                portalled={false}
                forceMount={forceMount}
                render={(contentProps, state) => renderPresence(contentProps, state)}
              >
                <Dropdown.Surface data-testid="select-surface">Content</Dropdown.Surface>
              </HeadlessSelect.Content>
            )}
          </Dropdown.Presence>
        </HeadlessSelect.Root>
      </Dropdown.VisualProvider>
    </KiskadeeContext.Provider>
  );
}

afterEach(cleanup);

describe('styled Dropdown', () => {
  it('keeps the core path unmounted while closed when presence is disabled', () => {
    const result = render(
      <KiskadeeContext.Provider value={presenceContext}>
        <Dropdown.Root presence={false}>
          <Dropdown.Anchor>Toggle</Dropdown.Anchor>
          <Dropdown.Content portalled={false}>
            <Dropdown.Surface data-testid="surface">Content</Dropdown.Surface>
          </Dropdown.Content>
        </Dropdown.Root>
      </KiskadeeContext.Provider>
    );
    const trigger = result.getByRole('button', { name: 'Toggle' });

    expect(result.queryByTestId('surface')).toBeNull();
    fireEvent.click(trigger);
    expect(result.getByTestId('surface')).toBeTruthy();
    fireEvent.click(trigger);
    expect(result.queryByTestId('surface')).toBeNull();
  });

  it('keeps Floating UI positioner styles outside the animated surface', () => {
    const result = render(
      <KiskadeeContext.Provider value={presenceContext}>
        <Dropdown.Root defaultOpen presence="grow-height">
          <Dropdown.Anchor>Toggle</Dropdown.Anchor>
          <Dropdown.Content portalled={false}>
            <Dropdown.Surface data-testid="surface">Content</Dropdown.Surface>
          </Dropdown.Content>
        </Dropdown.Root>
      </KiskadeeContext.Provider>
    );
    const surface = result.getByTestId('surface');
    const positioner = surface.parentElement;

    expect(positioner).not.toBeNull();
    expect(positioner).not.toBe(surface);
    expect(positioner?.getAttribute('data-placement')).toBe('bottom-start');
    expect(surface.getAttribute('data-placement')).toBeNull();
  });

  it('grows the surface itself and releases exit retention when motion is ready', async () => {
    await loadDropdownPresenceEffect();
    const result = render(
      <KiskadeeContext.Provider value={presenceContext}>
        <Dropdown.Root defaultOpen presence="grow-height">
          <Dropdown.Anchor>Toggle</Dropdown.Anchor>
          <Dropdown.Content portalled={false}>
            <Dropdown.Surface data-testid="motion-surface">Content</Dropdown.Surface>
          </Dropdown.Content>
        </Dropdown.Root>
      </KiskadeeContext.Provider>
    );
    const trigger = result.getByRole('button', { name: 'Toggle' });
    const surface = result.getByTestId('motion-surface');
    const positioner = surface.parentElement;

    await waitFor(() => expect(surface.style.height).toBe('auto'));
    expect(positioner?.style.height).toBe('');

    fireEvent.click(trigger);
    await waitFor(() => expect(result.queryByTestId('motion-surface')).toBeNull());
  });

  it('releases exit retention when adapter content has no animated surface', async () => {
    await loadDropdownPresenceEffect();
    const result = render(
      <KiskadeeContext.Provider value={presenceContext}>
        <Dropdown.VisualProvider presence="grow-height">
          <HeadlessDropdown.Root defaultOpen>
            <HeadlessDropdown.Anchor>Toggle</HeadlessDropdown.Anchor>
            <Dropdown.Presence>
              {({ forceMount, render }) => (
                <HeadlessDropdown.Content portalled={false} forceMount={forceMount} render={render}>
                  <div data-testid="content-without-surface">Content</div>
                </HeadlessDropdown.Content>
              )}
            </Dropdown.Presence>
          </HeadlessDropdown.Root>
        </Dropdown.VisualProvider>
      </KiskadeeContext.Provider>
    );
    const trigger = result.getByRole('button', { name: 'Toggle' });

    expect(result.getByTestId('content-without-surface')).toBeTruthy();
    fireEvent.click(trigger);
    await waitFor(() => expect(result.queryByTestId('content-without-surface')).toBeNull());
  });

  it('forwards an object ref to the rendered Select positioner through Presence', async () => {
    await loadDropdownPresenceEffect();
    const contentRef = createRef<HTMLDivElement>();
    const result = renderPresenceSelect(contentRef);
    const trigger = result.getByRole('combobox');

    expect(contentRef.current).toBeNull();
    expect(result.queryByTestId('select-surface')).toBeNull();
    fireEvent.click(trigger);
    expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
    expect(contentRef.current?.getAttribute('role')).toBe('listbox');
    expect(result.getByTestId('select-surface')).toBeTruthy();
    fireEvent.click(trigger);
    await waitFor(() => expect(result.queryByTestId('select-surface')).toBeNull());
    expect(contentRef.current).toBeNull();
  });

  it('forwards a callback ref through the rendered Select Presence cycle', async () => {
    await loadDropdownPresenceEffect();
    const callbackRef = vi.fn((_node: HTMLDivElement | null) => {});
    const result = renderPresenceSelect(callbackRef);
    const trigger = result.getByRole('combobox');

    fireEvent.click(trigger);
    expect(callbackRef).toHaveBeenLastCalledWith(expect.any(HTMLDivElement));
    fireEvent.click(trigger);
    await waitFor(() => expect(callbackRef).toHaveBeenLastCalledWith(null));
  });

  it('resolves one intent palette without retaining neutral color classes', () => {
    const result = renderDropdown(
      <Dropdown.Group>
        <Dropdown.Item intent="destructive" data-testid="destructive-item">
          <Dropdown.Label>Delete</Dropdown.Label>
        </Dropdown.Item>
      </Dropdown.Group>
    );
    const item = result.getByTestId('destructive-item');

    expect(item.className).toContain('item-geometry');
    expect(item.className).toContain('item-size');
    expect(item.className).toContain('item-destructive');
    expect(item.className).not.toContain('item-neutral');
  });

  it('resolves the active radius mode on every item base class', () => {
    const result = renderDropdown(
      <Dropdown.Group>
        <Dropdown.Item data-testid="item">
          <Dropdown.Label>Action</Dropdown.Label>
        </Dropdown.Item>
      </Dropdown.Group>,
      'independent',
      'pill'
    );

    expect(result.getByTestId('item').className).toContain('item-pill');
    expect(result.getByTestId('item').className).not.toContain('item-rounded');
  });

  it('renders no placeholder icon while isolating icon alignment by explicit group', () => {
    const result = renderDropdown(
      <>
        <Dropdown.Group>
          <Dropdown.Item>
            <Dropdown.Icon>
              <svg data-testid="glyph" />
            </Dropdown.Icon>
            <Dropdown.Label>With icon</Dropdown.Label>
          </Dropdown.Item>
          <Dropdown.Item data-testid="without-icon">
            <Dropdown.Label>Without icon</Dropdown.Label>
          </Dropdown.Item>
        </Dropdown.Group>
        <Dropdown.Separator data-testid="decorative-separator" />
        <Dropdown.Group data-testid="group-without-icons">
          <Dropdown.Item>
            <Dropdown.Label>Another group</Dropdown.Label>
          </Dropdown.Item>
        </Dropdown.Group>
      </>
    );

    expect(result.container.querySelectorAll('.k-ddn-x1')).toHaveLength(1);
    expect(result.container.querySelector('.k-ddn-x1')?.getAttribute('data-layout')).toBe(
      'independent'
    );
    expect(result.container.querySelectorAll('.k-ddn-x2')).toHaveLength(2);
    expect(result.container.querySelectorAll('.k-ddn-e3')).toHaveLength(1);
    expect(result.getByTestId('without-icon').querySelector('.k-ddn-e3')).toBeNull();
    expect(result.getByTestId('group-without-icons').querySelector('.k-ddn-e3')).toBeNull();
    expect(result.getByTestId('decorative-separator').getAttribute('role')).toBeNull();
  });

  it('applies column sharing to the collection while keeping groups as sizing boundaries', () => {
    const result = renderDropdown(
      <>
        <Dropdown.Group data-testid="first-group">
          <Dropdown.Item>
            <Dropdown.Label>Longest label</Dropdown.Label>
          </Dropdown.Item>
          <Dropdown.Item>
            <Dropdown.Label>Action</Dropdown.Label>
            <Dropdown.EndText>Ctrl+A</Dropdown.EndText>
          </Dropdown.Item>
        </Dropdown.Group>
        <Dropdown.Separator />
        <Dropdown.Group data-testid="second-group">
          <Dropdown.Item>
            <Dropdown.Label>Independent group</Dropdown.Label>
          </Dropdown.Item>
        </Dropdown.Group>
      </>,
      'columns'
    );

    expect(result.container.querySelector('.k-ddn-x1')?.getAttribute('data-layout')).toBe(
      'columns'
    );
    expect(result.getByTestId('first-group').getAttribute('data-layout')).toBeNull();
    expect(result.getByTestId('second-group').getAttribute('data-layout')).toBeNull();
  });

  it('renders group labels, end text and trailing icons through independent visual slots', () => {
    const result = renderDropdown(
      <Dropdown.Group>
        <Dropdown.GroupLabel data-testid="group-label">Clipboard</Dropdown.GroupLabel>
        <Dropdown.Item>
          <Dropdown.Icon>
            <svg />
          </Dropdown.Icon>
          <Dropdown.Label data-testid="label">Copy</Dropdown.Label>
          <Dropdown.Description data-testid="description">Copy selection</Dropdown.Description>
          <Dropdown.EndText data-testid="end-text">Ctrl+C</Dropdown.EndText>
          <Dropdown.Trailing data-testid="trailing">
            <svg />
          </Dropdown.Trailing>
        </Dropdown.Item>
      </Dropdown.Group>
    );

    expect(result.getByTestId('group-label').className).toContain('group-label-style');
    expect(result.getByTestId('label').className).toContain('label-style');
    expect(result.getByTestId('description').className).toContain('description-style');
    expect(result.getByTestId('end-text').className).toContain('end-text-style');
    expect(result.getByTestId('end-text').getAttribute('aria-hidden')).toBeNull();
    expect(result.getByTestId('trailing').className).toContain('trailing-style');
    expect(result.getByTestId('trailing').getAttribute('aria-hidden')).toBe('true');
  });

  it.each([
    'independent',
    'columns'
  ] as const)('keeps an unchecked canonical checkmark wrapper in the %s leading track', (layout) => {
    const result = renderDropdown(
      <Dropdown.Group>
        <Dropdown.Item>
          <Dropdown.Checkmark data-testid="checkmark" visible={false} />
          <Dropdown.Icon>
            <svg />
          </Dropdown.Icon>
          <Dropdown.Label>Checked action</Dropdown.Label>
          <Dropdown.EndText>Ctrl+K</Dropdown.EndText>
          <Dropdown.Trailing>
            <svg />
          </Dropdown.Trailing>
        </Dropdown.Item>
      </Dropdown.Group>,
      layout
    );
    const checkmark = result.getByTestId('checkmark');

    expect(checkmark.className).toContain('checkmark-style');
    expect(checkmark.className).toContain('k-ddn-e10');
    expect(checkmark.getAttribute('aria-hidden')).toBe('true');
    expect(checkmark.getAttribute('data-visible')).toBe('false');
    expect(checkmark.querySelector('[data-k-icon-name="check"]')).toBeTruthy();
    expect(result.getByTestId('check-glyph')).toBeTruthy();
  });
});
