/** @vitest-environment jsdom */

import {
  DEFAULT_ESSENTIAL_ICONS,
  defineIconFamily,
  type IconName
} from '@kiskadee/icons/interface';
import type { MenuTree } from '@kiskadee/react-headless/menu-tree';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { Fragment, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EssentialIconProvider } from '../../shared/contexts/EssentialIconContext.tsx';
import { IconFamilyProvider } from '../../shared/contexts/IconFamilyContext.tsx';
import {
  KiskadeeContext,
  type KiskadeeContextValue
} from '../../shared/contexts/KiskadeeContext.tsx';
import { Button } from '../Button/Button.tsx';
import { ButtonMenu } from './ButtonMenu.tsx';

vi.mock('../Button/effects/activation-feedback/ButtonActivationFeedback.loader.ts', () => {
  const effectModule = {
    resolveButtonActivationFeedbackEffect: ({
      elements,
      shouldForceOverlayPressed
    }: {
      elements: { e1?: { e?: Record<string, string> } };
      shouldForceOverlayPressed: boolean;
    }) => ({
      classNamePatch: {
        e1: [
          elements.e1?.e?.af,
          shouldForceOverlayPressed ? elements.e1?.e?.afp : elements.e1?.e?.afs
        ]
          .filter(Boolean)
          .join(' ')
      }
    })
  };

  return {
    loadButtonActivationFeedbackEffect: () => Promise.resolve(effectModule),
    useButtonActivationFeedbackEffect: (enabled = true) => (enabled ? effectModule : null)
  };
});

function Chevron() {
  return <svg data-testid="chevron" />;
}

function Check() {
  return <svg data-testid="check" />;
}

function RadioSelected() {
  return <svg data-testid="radio-selected" />;
}

function ChevronEnd() {
  return <svg data-testid="chevron-end" />;
}

const iconFamily = defineIconFamily({
  id: 'test-icons',
  label: 'Test icons',
  glyphs: {
    check: Check,
    'radio-selected': RadioSelected,
    'chevron-down': Chevron,
    'chevron-end': { glyph: ChevronEnd, direction: 'mirror' }
  }
});

const context: KiskadeeContextValue = {
  classesMap: { button: {}, dropdown: {} },
  designSystem: 'test',
  segment: 'default',
  theme: 'light',
  setDesignSystem: () => {},
  setSegment: () => {},
  setTheme: () => {}
};

const fluentFeedbackContext: KiskadeeContextValue = {
  ...context,
  classesMap: {
    button: {
      e1: {
        e: {
          af: 'feedback-base',
          afp: 'feedback-pressed',
          afs: 'feedback-ripple'
        }
      }
    },
    dropdown: {}
  },
  global: {
    effects: {
      activationFeedback: {
        profile: 'ripple',
        visual: { layer: 'overlay' }
      }
    },
    components: {
      button: {
        effects: { activationFeedback: true }
      }
    }
  }
};

const groupedShadowContext: KiskadeeContextValue = {
  ...context,
  classesMap: {
    button: {
      e1: {
        e: {
          h: 'button-rest-shadow'
        }
      }
    },
    dropdown: {
      e1: {
        e: {
          h: {
            all: 'dropdown-shadow',
            'lg:1': 'dropdown-shadow-large'
          }
        }
      }
    }
  }
};

const groupDividerContext: KiskadeeContextValue = {
  ...context,
  classesMap: {
    button: {
      e1: {
        p: { gd: { all: 'button-divider-width' } }
      },
      e6: {
        s: { all: 'button-divider-size' },
        c: { s: { neutral: { m: 'button-divider-color' } } }
      }
    },
    dropdown: {}
  },
  global: {
    components: {
      button: {
        options: { groupDivider: true }
      }
    }
  }
};

function renderButtonMenu(children: ReactNode, contextValue: KiskadeeContextValue = context) {
  return render(
    <KiskadeeContext.Provider value={contextValue}>
      <IconFamilyProvider families={[iconFamily]} family="test-icons">
        <EssentialIconProvider icons={DEFAULT_ESSENTIAL_ICONS}>{children}</EssentialIconProvider>
      </IconFamilyProvider>
    </KiskadeeContext.Provider>
  );
}

afterEach(cleanup);

describe('ButtonMenu', () => {
  it('projects open as pressed without exposing toggle semantics', async () => {
    const result = renderButtonMenu(
      <ButtonMenu.Root>
        <ButtonMenu.Trigger id="author-trigger">Actions</ButtonMenu.Trigger>
        <ButtonMenu.Content>
          <ButtonMenu.Group>
            <ButtonMenu.Item textValue="Copy">
              <ButtonMenu.Label>Copy</ButtonMenu.Label>
            </ButtonMenu.Item>
          </ButtonMenu.Group>
        </ButtonMenu.Content>
      </ButtonMenu.Root>,
      groupDividerContext
    );
    const trigger = result.getByRole('button', { name: 'Actions' });
    const triggerGroup = trigger.parentElement;

    expect(trigger.id).toBe('author-trigger');
    expect(triggerGroup?.querySelectorAll(':scope > .k-btn')).toHaveLength(1);
    expect(triggerGroup?.querySelector('.k-btn-e6a')).toBeNull();
    expect(trigger.querySelector('[data-k-icon-name="chevron-down"]')).toBeTruthy();
    expect(trigger.classList.contains('-p')).toBe(false);
    expect(trigger.getAttribute('aria-pressed')).toBeNull();

    fireEvent.click(trigger);
    await result.findByRole('menu');

    expect(trigger.classList.contains('-p')).toBe(true);
    expect(trigger.classList.contains('-a')).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-pressed')).toBeNull();
  });

  it('omits the automatic disclosure slot when essential icons are not provided', () => {
    const result = render(
      <KiskadeeContext.Provider value={groupDividerContext}>
        <IconFamilyProvider families={[iconFamily]} family="test-icons">
          <ButtonMenu.Root>
            <ButtonMenu.Trigger>Actions</ButtonMenu.Trigger>
            <ButtonMenu.Content>
              <ButtonMenu.Item textValue="Copy">Copy</ButtonMenu.Item>
            </ButtonMenu.Content>
          </ButtonMenu.Root>
        </IconFamilyProvider>
      </KiskadeeContext.Provider>
    );

    const trigger = result.getByRole('button', { name: 'Actions' });
    expect(trigger.querySelector('.k-btn-e5')).toBeNull();
    expect(trigger.querySelector('.k-btn-e6b')).toBeNull();
  });

  it('suppresses transient activation feedback only while the menu stays open', async () => {
    const result = renderButtonMenu(
      <ButtonMenu.Root>
        <ButtonMenu.Trigger>Actions</ButtonMenu.Trigger>
        <ButtonMenu.Content>
          <ButtonMenu.Group>
            <ButtonMenu.Item textValue="Copy">
              <ButtonMenu.Label>Copy</ButtonMenu.Label>
            </ButtonMenu.Item>
          </ButtonMenu.Group>
        </ButtonMenu.Content>
      </ButtonMenu.Root>,
      fluentFeedbackContext
    );
    const trigger = result.getByRole('button', { name: 'Actions' });

    await waitFor(() => expect(trigger.classList.contains('feedback-ripple')).toBe(true));
    expect(trigger.classList.contains('feedback-base')).toBe(true);

    fireEvent.click(trigger);
    await result.findByRole('menu');

    expect(trigger.classList.contains('-p')).toBe(true);
    expect(trigger.classList.contains('feedback-base')).toBe(false);
    expect(trigger.classList.contains('feedback-ripple')).toBe(false);
    expect(trigger.classList.contains('feedback-pressed')).toBe(false);
    expect(trigger.getAttribute('aria-pressed')).toBeNull();

    fireEvent.click(trigger);
    await waitFor(() => expect(result.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(trigger.classList.contains('feedback-ripple')).toBe(true));
    expect(trigger.classList.contains('-p')).toBe(false);
  });

  it('keeps pending as the terminal Button state while an open menu suppresses feedback', () => {
    const result = renderButtonMenu(
      <ButtonMenu.Root defaultOpen>
        <ButtonMenu.Trigger pending>Actions</ButtonMenu.Trigger>
        <ButtonMenu.Content>
          <ButtonMenu.Group>
            <ButtonMenu.Item textValue="Copy">
              <ButtonMenu.Label>Copy</ButtonMenu.Label>
            </ButtonMenu.Item>
          </ButtonMenu.Group>
        </ButtonMenu.Content>
      </ButtonMenu.Root>,
      fluentFeedbackContext
    );
    const trigger = result.getByRole('button', { name: 'Actions' });

    expect(trigger.getAttribute('aria-busy')).toBe('true');
    expect(trigger.classList.contains('-g')).toBe(true);
    expect(trigger.classList.contains('-p')).toBe(false);
    expect(trigger.classList.contains('feedback-base')).toBe(false);
  });

  it('preserves disabled authority from ButtonMenu.Root on the styled trigger', () => {
    const result = renderButtonMenu(
      <ButtonMenu.Root disabled>
        <ButtonMenu.Trigger id="disabled-trigger">Actions</ButtonMenu.Trigger>
        <ButtonMenu.Content>
          <ButtonMenu.Group>
            <ButtonMenu.Item textValue="Copy">
              <ButtonMenu.Label>Copy</ButtonMenu.Label>
            </ButtonMenu.Item>
          </ButtonMenu.Group>
        </ButtonMenu.Content>
      </ButtonMenu.Root>
    );
    const trigger = result.getByRole('button', { name: 'Actions' });

    expect(trigger.id).toBe('disabled-trigger');
    expect(trigger).toHaveProperty('disabled', true);
    fireEvent.click(trigger);
    expect(result.queryByRole('menu')).toBeNull();
  });

  it('renders split action and menu trigger as sibling buttons with independent semantics', async () => {
    const onAction = vi.fn();
    const onTriggerClick = vi.fn();
    const result = renderButtonMenu(
      <ButtonMenu.Root>
        <ButtonMenu.Action type="submit" onClick={onAction}>
          <Button.Label>Save</Button.Label>
        </ButtonMenu.Action>
        <ButtonMenu.Trigger aria-label="More save actions" onClick={onTriggerClick} />
        <ButtonMenu.Content>
          <ButtonMenu.Group>
            <ButtonMenu.Item textValue="Save as copy">
              <ButtonMenu.Label>Save as copy</ButtonMenu.Label>
            </ButtonMenu.Item>
          </ButtonMenu.Group>
          <ButtonMenu.Separator />
          <ButtonMenu.Group>
            <ButtonMenu.Item href="/archive" textValue="Open archive">
              <ButtonMenu.Label>Open archive</ButtonMenu.Label>
            </ButtonMenu.Item>
          </ButtonMenu.Group>
        </ButtonMenu.Content>
      </ButtonMenu.Root>,
      groupDividerContext
    );
    const action = result.getByRole('button', { name: 'Save' });
    const trigger = result.getByRole('button', { name: 'More save actions' });

    expect(action.parentElement).toBe(trigger.parentElement);
    expect(action.parentElement?.classList.contains('k-btn-x3')).toBe(true);
    expect(action.parentElement?.querySelectorAll(':scope > .k-btn-e6a')).toHaveLength(1);
    expect(result.container.querySelector('.k-bmn')).toBeNull();
    expect(action.querySelector('button')).toBeNull();
    expect(trigger.querySelector('button')).toBeNull();
    expect(action.getAttribute('type')).toBe('submit');
    expect(action.getAttribute('aria-haspopup')).toBeNull();
    expect(trigger.getAttribute('type')).toBe('button');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');

    fireEvent.click(action);
    expect(onAction).toHaveBeenCalledOnce();
    expect(result.queryByRole('menu')).toBeNull();

    fireEvent.click(trigger);
    expect(onTriggerClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(result.getByRole('menu')).toBeTruthy());
    expect(result.getByRole('separator')).toBeTruthy();
    expect(result.getByRole('menuitem', { name: 'Open archive' }).getAttribute('href')).toBe(
      '/archive'
    );
  });

  it('composes split controls nested in Fragments into the same Button.Group', async () => {
    const result = renderButtonMenu(
      <ButtonMenu.Root>
        <Fragment key="split-controls">
          <ButtonMenu.Action>
            <Button.Label>Save</Button.Label>
          </ButtonMenu.Action>
          <Fragment key="nested-trigger">
            <ButtonMenu.Trigger aria-label="More save actions" />
          </Fragment>
        </Fragment>
        <ButtonMenu.Content>
          <ButtonMenu.Group>
            <ButtonMenu.Item textValue="Save as copy">
              <ButtonMenu.Label>Save as copy</ButtonMenu.Label>
            </ButtonMenu.Item>
          </ButtonMenu.Group>
        </ButtonMenu.Content>
      </ButtonMenu.Root>,
      groupDividerContext
    );

    const action = result.getByRole('button', { name: 'Save' });
    const trigger = result.getByRole('button', { name: 'More save actions' });
    const group = action.parentElement;

    expect(group).toBe(trigger.parentElement);
    expect(group?.classList.contains('k-btn-x3')).toBe(true);
    expect(group?.querySelectorAll(':scope > .k-btn')).toHaveLength(2);
    expect(group?.querySelectorAll(':scope > .k-btn-e6a')).toHaveLength(1);

    fireEvent.click(trigger);
    await result.findByRole('menu');
  });

  it('keeps popup and connected-group shadow ownership independent', () => {
    const result = renderButtonMenu(
      <ButtonMenu.Root buttonGroup={{ shadow: true }} defaultOpen shadow="s:lg:1">
        <ButtonMenu.Action>
          <Button.Label>Save</Button.Label>
        </ButtonMenu.Action>
        <ButtonMenu.Trigger aria-label="More save actions" />
        <ButtonMenu.Content>
          <ButtonMenu.Group>
            <ButtonMenu.Item textValue="Save as copy">
              <ButtonMenu.Label>Save as copy</ButtonMenu.Label>
            </ButtonMenu.Item>
          </ButtonMenu.Group>
        </ButtonMenu.Content>
      </ButtonMenu.Root>,
      groupedShadowContext
    );

    const group = result.container.querySelector('.k-btn-x3');
    const action = result.getByRole('button', { name: 'Save' });
    const popup = result.baseElement.querySelector('.k-ddn-e1');

    expect(group?.classList.contains('button-rest-shadow')).toBe(true);
    expect(action.classList.contains('button-rest-shadow')).toBe(false);
    expect(popup?.classList.contains('dropdown-shadow')).toBe(true);
    expect(popup?.classList.contains('dropdown-shadow-large')).toBe(true);
  });

  it('forwards the styled Button root ref used by overlay anchors', () => {
    let button: HTMLButtonElement | null = null;
    renderButtonMenu(
      <Button
        ref={(node) => {
          button = node;
        }}
      >
        <Button.Label>Standalone</Button.Label>
      </Button>
    );

    expect(button?.tagName).toBe('BUTTON');
  });

  it('composes labelled groups and hides visual shortcuts from accessible names', async () => {
    const result = renderButtonMenu(
      <ButtonMenu.Root>
        <ButtonMenu.Trigger>Actions</ButtonMenu.Trigger>
        <ButtonMenu.Content itemsLayout="columns">
          <ButtonMenu.Group>
            <ButtonMenu.GroupLabel>Clipboard</ButtonMenu.GroupLabel>
            <ButtonMenu.Item textValue="Copy" aria-keyshortcuts="Control+C">
              <ButtonMenu.Label>Copy</ButtonMenu.Label>
              <ButtonMenu.Shortcut>Ctrl+C</ButtonMenu.Shortcut>
            </ButtonMenu.Item>
          </ButtonMenu.Group>
        </ButtonMenu.Content>
      </ButtonMenu.Root>
    );

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    const group = await result.findByRole('group', { name: 'Clipboard' });
    const item = result.getByRole('menuitem', { name: 'Copy' });

    expect(result.getByRole('menu').querySelector('.k-ddn-x1')?.getAttribute('data-layout')).toBe(
      'columns'
    );
    expect(group.querySelectorAll('.k-ddn-x2')).toHaveLength(0);
    expect(group.className).toContain('k-ddn-x2');
    expect(item.getAttribute('aria-keyshortcuts')).toBe('Control+C');
    expect(item.querySelector('.k-ddn-e8')?.getAttribute('aria-hidden')).toBe('true');
    expect(result.queryByRole('menuitem', { name: 'Copy Ctrl+C' })).toBeNull();
  });

  it('gives direct MenuTree rows a visual group without adding group semantics', async () => {
    const tree: MenuTree<IconName> = {
      id: 'work-item-actions',
      title: 'Work item actions',
      items: [
        {
          type: 'group',
          id: 'primary-actions',
          label: 'Work item',
          items: [{ type: 'item', id: 'copy', label: 'Copy' }]
        },
        { type: 'separator', id: 'actions-separator' },
        {
          type: 'submenu',
          id: 'dashboard',
          label: 'Add to dashboard',
          icon: 'check',
          items: [{ type: 'item', id: 'team-dashboard', label: 'Team dashboard' }]
        }
      ]
    };
    const result = renderButtonMenu(
      <ButtonMenu.Root>
        <ButtonMenu.Trigger>Actions</ButtonMenu.Trigger>
        <ButtonMenu.TreeContent tree={tree} itemsLayout="columns" />
      </ButtonMenu.Root>
    );

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    const menu = await result.findByRole('menu', { name: 'Work item actions' });
    const dashboard = result.getByRole('menuitem', { name: 'Add to dashboard' });
    const visualGroup = dashboard.parentElement;

    expect(result.getByRole('group', { name: 'Work item' }).className).toContain('k-ddn-x2');
    expect(visualGroup?.classList.contains('k-ddn-x2')).toBe(true);
    expect(visualGroup?.getAttribute('role')).toBeNull();
    expect(dashboard.querySelector('.k-ddn-e3')).toBeTruthy();
    expect(menu.querySelector('.k-ddn-x1 > .k-ddn-e2')).toBeNull();
  });

  it('keeps radio mark tracks mounted and projects the checked item as selected', async () => {
    const result = renderButtonMenu(
      <ButtonMenu.Root>
        <ButtonMenu.Trigger>Density</ButtonMenu.Trigger>
        <ButtonMenu.Content>
          <ButtonMenu.RadioGroup defaultValue="comfortable">
            <ButtonMenu.RadioItem value="compact" textValue="Compact">
              <ButtonMenu.Label>Compact</ButtonMenu.Label>
            </ButtonMenu.RadioItem>
            <ButtonMenu.RadioItem value="comfortable" textValue="Comfortable">
              <ButtonMenu.Label>Comfortable</ButtonMenu.Label>
            </ButtonMenu.RadioItem>
          </ButtonMenu.RadioGroup>
        </ButtonMenu.Content>
      </ButtonMenu.Root>
    );

    fireEvent.click(result.getByRole('button', { name: 'Density' }));
    const compact = await result.findByRole('menuitemradio', { name: 'Compact' });
    const comfortable = result.getByRole('menuitemradio', { name: 'Comfortable' });
    const compactCheckmark = compact.querySelector('.k-ddn-e10');
    const comfortableCheckmark = comfortable.querySelector('.k-ddn-e10');

    expect(compact.getAttribute('aria-checked')).toBe('false');
    expect(comfortable.getAttribute('aria-checked')).toBe('true');
    expect(compactCheckmark?.getAttribute('data-visible')).toBe('false');
    expect(comfortableCheckmark?.getAttribute('data-visible')).toBe('true');
    expect(compact.getAttribute('data-selected')).toBeNull();
    expect(comfortable.getAttribute('data-selected')).toBe('true');
    expect(result.getAllByTestId('radio-selected')).toHaveLength(2);
  });

  it('supports independent checkbox items with check marks and selected projection', async () => {
    const onControlStateChange = vi.fn();
    const result = renderButtonMenu(
      <ButtonMenu.Root>
        <ButtonMenu.Trigger>View</ButtonMenu.Trigger>
        <ButtonMenu.Content>
          <ButtonMenu.CheckboxItem
            textValue="Descriptions"
            defaultControlState
            closeOnSelect={false}
            onControlStateChange={onControlStateChange}
          >
            <ButtonMenu.Label>Descriptions</ButtonMenu.Label>
          </ButtonMenu.CheckboxItem>
          <ButtonMenu.CheckboxItem textValue="Shortcuts" closeOnSelect={false}>
            <ButtonMenu.Label>Shortcuts</ButtonMenu.Label>
          </ButtonMenu.CheckboxItem>
        </ButtonMenu.Content>
      </ButtonMenu.Root>
    );

    fireEvent.click(result.getByRole('button', { name: 'View' }));
    const descriptions = await result.findByRole('menuitemcheckbox', { name: 'Descriptions' });
    const shortcuts = result.getByRole('menuitemcheckbox', { name: 'Shortcuts' });

    expect(descriptions.getAttribute('data-selected')).toBe('true');
    expect(shortcuts.getAttribute('data-selected')).toBeNull();
    fireEvent.click(shortcuts);
    expect(shortcuts.getAttribute('aria-checked')).toBe('true');
    expect(shortcuts.getAttribute('data-selected')).toBe('true');
    expect(result.getAllByRole('menu')).toHaveLength(1);
    fireEvent.click(descriptions);
    expect(onControlStateChange).toHaveBeenCalledWith(false);
  });

  it('injects a logical submenu chevron and composes nested Dropdown surfaces', async () => {
    const result = renderButtonMenu(
      <ButtonMenu.Root>
        <ButtonMenu.Trigger>Actions</ButtonMenu.Trigger>
        <ButtonMenu.Content>
          <ButtonMenu.Group>
            <ButtonMenu.Sub>
              <ButtonMenu.SubTrigger textValue="Export">
                <ButtonMenu.Label>Export</ButtonMenu.Label>
              </ButtonMenu.SubTrigger>
              <ButtonMenu.SubContent>
                <ButtonMenu.Group>
                  <ButtonMenu.Item textValue="PDF">
                    <ButtonMenu.Label>PDF</ButtonMenu.Label>
                  </ButtonMenu.Item>
                </ButtonMenu.Group>
              </ButtonMenu.SubContent>
            </ButtonMenu.Sub>
          </ButtonMenu.Group>
        </ButtonMenu.Content>
      </ButtonMenu.Root>
    );

    fireEvent.click(result.getByRole('button', { name: 'Actions' }));
    const trigger = await result.findByRole('menuitem', { name: 'Export' });
    const chevron = trigger.querySelector('[data-k-icon-name="chevron-end"]');

    expect(trigger.getAttribute('href')).toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(chevron?.getAttribute('data-k-icon-direction')).toBe('mirror');
    expect(result.getByTestId('chevron-end')).toBeTruthy();

    fireEvent.keyDown(trigger, { key: 'ArrowRight' });
    await waitFor(() => expect(result.getAllByRole('menu')).toHaveLength(2));
    expect(trigger.classList.contains('-h')).toBe(true);
    expect(trigger.classList.contains('-s')).toBe(false);
    expect(trigger.getAttribute('aria-selected')).toBeNull();
    expect(result.getByRole('menuitem', { name: 'PDF' })).toBeTruthy();
    expect(result.baseElement.querySelectorAll('.k-ddn-e1')).toHaveLength(2);
  });
});
