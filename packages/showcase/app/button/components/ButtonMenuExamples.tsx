'use client';

import type { DropdownPresence, ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import type { IconName } from '@kiskadee/icons/interface';
import {
  AdaptiveButtonMenu,
  type AdaptiveButtonMenuPresentation,
  Button,
  FamilyResolvedIcon,
  type MenuTree,
  Text
} from '@kiskadee/react-components';
import { useMemo, useState } from 'react';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';

const PRESENTATION_OPTIONS: Array<{
  value: AdaptiveButtonMenuPresentation;
  label: string;
}> = [
  { value: 'adaptive', label: 'Adaptive' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'bottom-sheet', label: 'BottomSheet' }
];

function createWorkItemTree({
  onAction,
  showDescriptions,
  showShortcuts,
  onShowDescriptionsChange,
  onShowShortcutsChange,
  workItemType,
  onWorkItemTypeChange
}: {
  onAction: (label: string) => void;
  showDescriptions: boolean;
  showShortcuts: boolean;
  onShowDescriptionsChange: (controlState: boolean) => void;
  onShowShortcutsChange: (controlState: boolean) => void;
  workItemType: string;
  onWorkItemTypeChange: (value: string) => void;
}): MenuTree<IconName> {
  return {
    id: 'work-item-actions',
    title: 'Work item actions',
    items: [
      {
        type: 'group',
        id: 'work-item-primary',
        label: 'Work item',
        items: [
          {
            type: 'item',
            id: 'new-linked-work-item',
            label: 'New linked work item',
            icon: 'clipboard-check',
            onSelect: () => onAction('New linked work item')
          },
          {
            type: 'submenu',
            id: 'display-options',
            label: 'Display options',
            title: 'Display options',
            icon: 'settings',
            items: [
              {
                type: 'checkbox-group',
                id: 'display-preferences',
                items: [
                  {
                    type: 'checkbox',
                    id: 'show-descriptions',
                    label: 'Show descriptions',
                    controlState: showDescriptions,
                    closeOnSelect: false,
                    onControlStateChange: onShowDescriptionsChange
                  },
                  {
                    type: 'checkbox',
                    id: 'show-shortcuts',
                    label: 'Show shortcuts',
                    controlState: showShortcuts,
                    closeOnSelect: false,
                    onControlStateChange: onShowShortcutsChange
                  }
                ]
              }
            ]
          },
          {
            type: 'submenu',
            id: 'change-type',
            label: 'Change type...',
            title: 'Work item type',
            icon: 'arrow-left-right',
            items: [
              {
                type: 'radio-group',
                id: 'work-item-type',
                label: 'Work item type',
                value: workItemType,
                onValueChange: onWorkItemTypeChange,
                items: [
                  {
                    type: 'radio',
                    id: 'work-item-task',
                    value: 'task',
                    label: 'Task',
                    icon: 'clipboard-check'
                  },
                  {
                    type: 'radio',
                    id: 'work-item-feature',
                    value: 'feature',
                    label: 'Feature',
                    icon: 'rocket'
                  },
                  {
                    type: 'radio',
                    id: 'work-item-issue',
                    value: 'issue',
                    label: 'Issue',
                    icon: 'circle-x'
                  }
                ]
              }
            ]
          },
          {
            type: 'item',
            id: 'move-team-project',
            label: 'Move to team project',
            icon: 'folder-move',
            onSelect: () => onAction('Move to team project')
          },
          {
            type: 'item',
            id: 'email-work-item',
            label: 'Email work item',
            icon: 'mail',
            onSelect: () => onAction('Email work item')
          },
          {
            type: 'item',
            id: 'delete-work-item',
            label: 'Delete',
            icon: 'trash',
            endText: 'Ctrl + D',
            intent: 'destructive',
            onSelect: () => onAction('Delete')
          }
        ]
      },
      {
        type: 'group',
        id: 'dashboard-group',
        items: [
          {
            type: 'submenu',
            id: 'dashboard',
            label: 'Add to dashboard',
            title: 'Dashboards',
            icon: 'dashboard',
            items: [
              {
                type: 'group',
                id: 'dashboard-actions',
                items: [
                  {
                    type: 'item',
                    id: 'team-dashboard',
                    label: 'Team dashboard',
                    icon: 'dashboard',
                    onSelect: () => onAction('Team dashboard')
                  },
                  {
                    type: 'submenu',
                    id: 'dashboard-options',
                    label: 'Dashboard options',
                    title: 'Dashboard options',
                    icon: 'settings',
                    items: [
                      {
                        type: 'group',
                        id: 'dashboard-option-actions',
                        items: [
                          {
                            type: 'item',
                            id: 'manage-widgets',
                            label: 'Manage widgets',
                            icon: 'dashboard',
                            onSelect: () => onAction('Manage widgets')
                          },
                          {
                            type: 'item',
                            id: 'dashboard-settings',
                            label: 'Dashboard settings',
                            icon: 'settings',
                            onSelect: () => onAction('Dashboard settings')
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
}

export function ButtonMenuExamples({
  available,
  presence,
  scale,
  surfaceContext
}: {
  available: boolean;
  presence?: DropdownPresence;
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const textProfiles = useShowcaseTextProfiles();
  const { showDescriptions: showSectionDescriptions } = useShowcaseDisplayPreferences();
  const [lastAction, setLastAction] = useState('No action yet');
  const [workItemType, setWorkItemType] = useState('task');
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [presentation, setPresentation] = useState<AdaptiveButtonMenuPresentation>('adaptive');
  const tree = useMemo(
    () =>
      createWorkItemTree({
        onAction: setLastAction,
        showDescriptions,
        showShortcuts,
        onShowDescriptionsChange: (controlState) => {
          setShowDescriptions(controlState);
          setLastAction(`${controlState ? 'Enabled' : 'Disabled'} descriptions`);
        },
        onShowShortcutsChange: (controlState) => {
          setShowShortcuts(controlState);
          setLastAction(`${controlState ? 'Enabled' : 'Disabled'} shortcuts`);
        },
        workItemType,
        onWorkItemTypeChange: (value) => {
          setWorkItemType(value);
          setLastAction(`Changed work item type to ${value}`);
        }
      }),
    [showDescriptions, showShortcuts, workItemType]
  );

  if (!available) return null;

  const common = {
    tree,
    renderIcon: (name: IconName) => <FamilyResolvedIcon name={name} />,
    presentation,
    dropdown: { presence, scale, itemsLayout: 'columns' as const }
  };

  return (
    <section className={styles.buttonMenuSection} aria-labelledby="button-menu-title">
      <Text as="h3" id="button-menu-title" profile={textProfiles.sectionTitle}>
        Adaptive button menu
      </Text>
      {showSectionDescriptions ? (
        <Text as="p" profile={textProfiles.body} className={styles.showcaseSectionDescription}>
          The same MenuTree is presented as a Dropdown or BottomSheet. Adaptive mode chooses by
          viewport and freezes the presenter while it is open.
        </Text>
      ) : null}
      <label className={styles.buttonMenuPresentationControl}>
        <span>Presentation</span>
        <select
          value={presentation}
          onChange={(event) =>
            setPresentation(event.currentTarget.value as AdaptiveButtonMenuPresentation)
          }
        >
          {PRESENTATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.buttonMenuGrid}>
        <article>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            Menu button
          </Text>
          <AdaptiveButtonMenu.Root
            {...common}
            buttonGroup={{ emphasis: 'high', intent: 'primary', scale, surfaceContext }}
            bottomSheet={{ scale }}
          >
            <AdaptiveButtonMenu.Trigger>
              <Button.Label>Actions</Button.Label>
            </AdaptiveButtonMenu.Trigger>
          </AdaptiveButtonMenu.Root>
        </article>
        <article>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            Leading icon
          </Text>
          <AdaptiveButtonMenu.Root
            {...common}
            buttonGroup={{ emphasis: 'medium', intent: 'neutral', scale, surfaceContext }}
            bottomSheet={{ scale, itemLayout: 'centered', centeredIcons: 'hide' }}
          >
            <AdaptiveButtonMenu.Trigger>
              <Button.Icon>
                <FamilyResolvedIcon name="settings" />
              </Button.Icon>
              <Button.Label>Settings</Button.Label>
            </AdaptiveButtonMenu.Trigger>
          </AdaptiveButtonMenu.Root>
        </article>
        <article>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            Split button
          </Text>
          <AdaptiveButtonMenu.Root
            {...common}
            buttonGroup={{ emphasis: 'high', intent: 'primary', scale, surfaceContext }}
            bottomSheet={{ scale, itemLayout: 'structured' }}
          >
            <AdaptiveButtonMenu.Action onClick={() => setLastAction('Save')}>
              <Button.Label>Save</Button.Label>
            </AdaptiveButtonMenu.Action>
            <AdaptiveButtonMenu.Trigger aria-label="More save actions" />
          </AdaptiveButtonMenu.Root>
        </article>
      </div>
      <Text as="p" role="status" profile={textProfiles.caption} className={styles.buttonMenuStatus}>
        {lastAction}
      </Text>
    </section>
  );
}
