/** @vitest-environment jsdom */

import type { IconName } from '@kiskadee/icons/interface';
import { DEFAULT_ESSENTIAL_ICONS, defineIconFamily } from '@kiskadee/icons/interface';
import type { MenuTree } from '@kiskadee/react-headless/menu-tree';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EssentialIconProvider } from '../../shared/contexts/EssentialIconContext.tsx';
import { IconFamilyProvider } from '../../shared/contexts/IconFamilyContext.tsx';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import type { MenuTreeIconRenderer } from '../../shared/MenuTreeIconRenderer.ts';
import { AdaptiveButtonMenu, type AdaptiveButtonMenuDropdownProps } from './AdaptiveButtonMenu.tsx';

function Glyph() {
  return <svg />;
}

const iconFamily = defineIconFamily({
  id: 'adaptive-test-icons',
  label: 'Adaptive test icons',
  glyphs: {
    check: Glyph,
    'radio-selected': Glyph,
    'chevron-down': Glyph,
    'chevron-end': Glyph,
    'chevron-left': Glyph,
    close: Glyph
  }
});

const tree: MenuTree<IconName> = {
  id: 'actions',
  title: 'Actions',
  items: [
    {
      type: 'group' as const,
      id: 'root-actions',
      items: [
        {
          type: 'submenu' as const,
          id: 'advanced',
          label: 'Advanced',
          items: [
            {
              type: 'group' as const,
              id: 'advanced-actions',
              items: [{ type: 'item' as const, id: 'inspect', label: 'Inspect' }]
            },
            {
              type: 'radio-group' as const,
              id: 'density',
              label: 'Density',
              defaultValue: 'comfortable',
              items: [
                {
                  type: 'radio' as const,
                  id: 'comfortable',
                  label: 'Comfortable',
                  value: 'comfortable'
                },
                { type: 'radio' as const, id: 'compact', label: 'Compact', value: 'compact' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

function context(compact: boolean): KiskadeeContextValue {
  return {
    classesMap: { button: {}, bottomSheet: {}, dropdown: {} },
    designSystem: 'test',
    segment: 'default',
    theme: 'light',
    layoutEnvironment: { isCompactViewport: compact },
    setDesignSystem: () => {},
    setSegment: () => {},
    setTheme: () => {}
  };
}

function Example({
  compact,
  dropdown,
  menuTree = tree,
  renderIcon
}: {
  compact: boolean;
  dropdown?: AdaptiveButtonMenuDropdownProps;
  menuTree?: MenuTree<IconName>;
  renderIcon?: MenuTreeIconRenderer<IconName>;
}) {
  return (
    <KiskadeeContext.Provider value={context(compact)}>
      <IconFamilyProvider families={[iconFamily]} family="adaptive-test-icons">
        <EssentialIconProvider icons={DEFAULT_ESSENTIAL_ICONS}>
          <AdaptiveButtonMenu.Root tree={menuTree} dropdown={dropdown} renderIcon={renderIcon}>
            <AdaptiveButtonMenu.Trigger>Actions</AdaptiveButtonMenu.Trigger>
          </AdaptiveButtonMenu.Root>
        </EssentialIconProvider>
      </IconFamilyProvider>
    </KiskadeeContext.Provider>
  );
}

afterEach(cleanup);

describe('AdaptiveButtonMenu', () => {
  it('turns submenus into navigable BottomSheet pages', () => {
    const result = render(<Example compact />);
    fireEvent.click(result.getByRole('button', { name: 'Actions' }));

    expect(result.getByRole('dialog', { name: 'Actions' })).toBeTruthy();
    const rootTitle = result.getByRole('heading', { name: 'Actions' });
    expect(rootTitle.className).toContain('k-foc');
    expect(
      result
        .getByRole('button', { name: 'Advanced' })
        .querySelector('[data-k-icon-name="chevron-end"]')
    ).toBeTruthy();
    expect(
      result.getByRole('button', { name: 'Close' }).querySelector('[data-k-icon-name="close"]')
    ).toBeTruthy();

    fireEvent.click(result.getByRole('button', { name: 'Advanced' }));
    const childTitle = result.getByRole('heading', { name: 'Advanced' });
    expect(childTitle.className).toContain('k-foc');
    expect(
      result
        .getByRole('button', { name: 'Back to Actions' })
        .querySelector('[data-k-icon-name="chevron-left"]')
    ).toBeTruthy();

    fireEvent.click(result.getByRole('button', { name: 'Back to Actions' }));
    expect(result.getByRole('heading', { name: 'Actions' })).toBeTruthy();
  });

  it('freezes the active presenter until close and switches while closed', () => {
    const result = render(<Example compact />);
    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    expect(result.getByRole('dialog', { name: 'Actions' })).toBeTruthy();

    result.rerender(<Example compact={false} />);
    expect(result.getByRole('dialog', { name: 'Actions' })).toBeTruthy();

    fireEvent.click(result.getByRole('button', { name: 'Close' }));
    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    expect(result.getByRole('menu', { name: 'Actions' })).toBeTruthy();
  });

  it('preserves uncontrolled radio state when a page unmounts and reopens', () => {
    const result = render(<Example compact />);
    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    fireEvent.click(result.getByRole('button', { name: 'Advanced' }));
    fireEvent.click(result.getByRole('radio', { name: 'Compact' }));

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    fireEvent.click(result.getByRole('button', { name: 'Advanced' }));
    expect(result.getByRole('radio', { name: 'Compact' }).getAttribute('aria-checked')).toBe(
      'true'
    );
  });

  it('reports the selected radio item id from both presenters', async () => {
    const onValueChange = vi.fn();
    const radioTree: MenuTree<IconName> = {
      id: 'density-menu',
      title: 'Density',
      items: [
        {
          type: 'radio-group',
          id: 'density',
          defaultValue: 'comfortable',
          onValueChange,
          items: [
            { type: 'radio', id: 'comfortable-item', label: 'Comfortable', value: 'comfortable' },
            { type: 'radio', id: 'compact-item', label: 'Compact', value: 'compact' }
          ]
        }
      ]
    };

    const dropdown = render(<Example compact={false} menuTree={radioTree} />);
    fireEvent.click(dropdown.getByRole('button', { name: 'Actions' }));
    expect(
      (await dropdown.findByRole('menuitemradio', { name: 'Comfortable' })).querySelector(
        '[data-k-icon-name="radio-selected"]'
      )
    ).toBeTruthy();
    fireEvent.click(await dropdown.findByRole('menuitemradio', { name: 'Compact' }));
    expect(onValueChange).toHaveBeenLastCalledWith('compact', {
      id: 'compact-item',
      type: 'radio',
      value: 'compact'
    });
    dropdown.unmount();
    onValueChange.mockClear();

    const bottomSheet = render(<Example compact menuTree={radioTree} />);
    fireEvent.click(bottomSheet.getByRole('button', { name: 'Actions' }));
    expect(
      bottomSheet
        .getByRole('radio', { name: 'Comfortable' })
        .querySelector('[data-k-icon-name="radio-selected"]')
    ).toBeTruthy();
    fireEvent.click(bottomSheet.getByRole('radio', { name: 'Compact' }));
    expect(onValueChange).toHaveBeenLastCalledWith('compact', {
      id: 'compact-item',
      type: 'radio',
      value: 'compact'
    });
  });

  it('reports independent checkbox state from both presenters without closing when configured', async () => {
    const onControlStateChange = vi.fn();
    const checkboxTree: MenuTree<IconName> = {
      id: 'view-menu',
      title: 'View',
      items: [
        {
          type: 'checkbox-group',
          id: 'view-options',
          items: [
            {
              type: 'checkbox',
              id: 'descriptions',
              label: 'Descriptions',
              defaultControlState: true,
              closeOnSelect: false,
              onControlStateChange
            },
            {
              type: 'checkbox',
              id: 'shortcuts',
              label: 'Shortcuts',
              closeOnSelect: false,
              onControlStateChange
            }
          ]
        }
      ]
    };

    const dropdown = render(<Example compact={false} menuTree={checkboxTree} />);
    fireEvent.click(dropdown.getByRole('button', { name: 'Actions' }));
    fireEvent.click(await dropdown.findByRole('menuitemcheckbox', { name: 'Shortcuts' }));
    expect(onControlStateChange).toHaveBeenLastCalledWith(true, {
      id: 'shortcuts',
      type: 'checkbox',
      controlState: true
    });
    expect(dropdown.getByRole('menu')).toBeTruthy();
    dropdown.unmount();
    onControlStateChange.mockClear();

    const controlledCheckboxTree = (controlState: boolean): MenuTree<IconName> => ({
      ...checkboxTree,
      items: checkboxTree.items.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === 'shortcuts' ? { ...item, controlState } : item
        )
      }))
    });
    const bottomSheet = render(<Example compact menuTree={controlledCheckboxTree(false)} />);
    fireEvent.click(bottomSheet.getByRole('button', { name: 'Actions' }));
    fireEvent.click(bottomSheet.getByRole('checkbox', { name: 'Shortcuts' }));
    expect(onControlStateChange).toHaveBeenLastCalledWith(true, {
      id: 'shortcuts',
      type: 'checkbox',
      controlState: true
    });
    bottomSheet.rerender(<Example compact menuTree={controlledCheckboxTree(true)} />);
    expect(
      bottomSheet.getByRole('checkbox', { name: 'Shortcuts' }).getAttribute('aria-checked')
    ).toBe('true');
    expect(bottomSheet.getByRole('dialog', { name: 'View' })).toBeTruthy();
  });

  it('applies dropdown icon composition without changing the BottomSheet presenter', async () => {
    const iconTree: MenuTree<IconName> = {
      id: 'icon-menu',
      title: 'Icon menu',
      items: [
        {
          type: 'group',
          id: 'icon-actions',
          items: [{ type: 'item', id: 'inspect', label: 'Inspect', icon: 'check' }]
        }
      ]
    };
    const renderIcon: MenuTreeIconRenderer<IconName> = (icon) => (
      <svg data-testid={`consumer-${icon}`} />
    );
    const dropdown = render(
      <Example
        compact={false}
        dropdown={{ leadingIconComposition: 'selection-only' }}
        menuTree={iconTree}
        renderIcon={renderIcon}
      />
    );
    fireEvent.click(dropdown.getByRole('button', { name: 'Actions' }));
    const dropdownItem = await dropdown.findByRole('menuitem', { name: 'Inspect' });

    expect(dropdownItem.querySelector('.k-ddn-e3')).toBeNull();
    expect(dropdown.queryByTestId('consumer-check')).toBeNull();
    dropdown.unmount();

    const bottomSheet = render(
      <Example
        compact
        dropdown={{ leadingIconComposition: 'selection-only' }}
        menuTree={iconTree}
        renderIcon={renderIcon}
      />
    );
    fireEvent.click(bottomSheet.getByRole('button', { name: 'Actions' }));

    expect(bottomSheet.getByRole('button', { name: 'Inspect' })).toBeTruthy();
    expect(bottomSheet.getByTestId('consumer-check')).toBeTruthy();
  });
});
