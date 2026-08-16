'use client';

import type { DropdownPresence, ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import { Button, ButtonMenu, Text } from '@kiskadee/react-components';
import { useState } from 'react';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';

type MenuContentProps = {
  onAction: (label: string) => void;
};

type WorkItemMenuContentProps = MenuContentProps & {
  workItemType: string;
  onWorkItemTypeChange: (value: string) => void;
};

function WorkItemMenuContent({
  onAction,
  workItemType,
  onWorkItemTypeChange
}: WorkItemMenuContentProps) {
  return (
    <ButtonMenu.Content itemsLayout="columns">
      <ButtonMenu.Group>
        <ButtonMenu.Item
          textValue="New linked work item"
          onSelect={() => onAction('New linked work item')}
        >
          <ButtonMenu.Icon name="clipboard-check" />
          <ButtonMenu.Label>New linked work item</ButtonMenu.Label>
        </ButtonMenu.Item>
        <ButtonMenu.Sub>
          <ButtonMenu.SubTrigger textValue="Change type...">
            <ButtonMenu.Icon name="arrow-left-right" />
            <ButtonMenu.Label>Change type...</ButtonMenu.Label>
          </ButtonMenu.SubTrigger>
          <ButtonMenu.SubContent itemsLayout="columns">
            <ButtonMenu.RadioGroup value={workItemType} onValueChange={onWorkItemTypeChange}>
              <ButtonMenu.GroupLabel>Work item type</ButtonMenu.GroupLabel>
              <ButtonMenu.RadioItem value="task" textValue="Task">
                <ButtonMenu.Icon name="clipboard-check" />
                <ButtonMenu.Label>Task</ButtonMenu.Label>
              </ButtonMenu.RadioItem>
              <ButtonMenu.RadioItem value="feature" textValue="Feature">
                <ButtonMenu.Icon name="rocket" />
                <ButtonMenu.Label>Feature</ButtonMenu.Label>
              </ButtonMenu.RadioItem>
              <ButtonMenu.RadioItem value="issue" textValue="Issue">
                <ButtonMenu.Icon name="circle-x" />
                <ButtonMenu.Label>Issue</ButtonMenu.Label>
              </ButtonMenu.RadioItem>
            </ButtonMenu.RadioGroup>
          </ButtonMenu.SubContent>
        </ButtonMenu.Sub>
        <ButtonMenu.Item
          textValue="Move to team project"
          onSelect={() => onAction('Move to team project')}
        >
          <ButtonMenu.Icon name="folder-move" />
          <ButtonMenu.Label>Move to team project</ButtonMenu.Label>
        </ButtonMenu.Item>
        <ButtonMenu.Item textValue="Email work item" onSelect={() => onAction('Email work item')}>
          <ButtonMenu.Icon name="mail" />
          <ButtonMenu.Label>Email work item</ButtonMenu.Label>
        </ButtonMenu.Item>
        <ButtonMenu.Item
          textValue="Delete"
          aria-keyshortcuts="Control+D"
          onSelect={() => onAction('Delete')}
        >
          <ButtonMenu.Icon name="trash" />
          <ButtonMenu.Label>Delete</ButtonMenu.Label>
          <ButtonMenu.Shortcut>Ctrl + D</ButtonMenu.Shortcut>
        </ButtonMenu.Item>
      </ButtonMenu.Group>
      <ButtonMenu.Separator />
      <ButtonMenu.Group>
        <ButtonMenu.Item textValue="New branch" onSelect={() => onAction('New branch')}>
          <ButtonMenu.Icon name="git-branch" />
          <ButtonMenu.Label>New branch</ButtonMenu.Label>
        </ButtonMenu.Item>
      </ButtonMenu.Group>
      <ButtonMenu.Separator />
      <ButtonMenu.Group>
        <ButtonMenu.Item textValue="Open in Excel" onSelect={() => onAction('Open in Excel')}>
          <ButtonMenu.Icon name="spreadsheet" />
          <ButtonMenu.Label>Open in Excel</ButtonMenu.Label>
        </ButtonMenu.Item>
        <ButtonMenu.Sub>
          <ButtonMenu.SubTrigger textValue="Add to dashboard">
            <ButtonMenu.Icon name="dashboard" />
            <ButtonMenu.Label>Add to dashboard</ButtonMenu.Label>
          </ButtonMenu.SubTrigger>
          <ButtonMenu.SubContent itemsLayout="columns">
            <ButtonMenu.Group>
              <ButtonMenu.Item
                textValue="Team dashboard"
                onSelect={() => onAction('Team dashboard')}
              >
                <ButtonMenu.Icon name="dashboard" />
                <ButtonMenu.Label>Team dashboard</ButtonMenu.Label>
              </ButtonMenu.Item>
              <ButtonMenu.Item
                textValue="Project dashboard"
                onSelect={() => onAction('Project dashboard')}
              >
                <ButtonMenu.Icon name="git-branch" />
                <ButtonMenu.Label>Project dashboard</ButtonMenu.Label>
              </ButtonMenu.Item>
              <ButtonMenu.Sub>
                <ButtonMenu.SubTrigger textValue="Dashboard options">
                  <ButtonMenu.Icon name="settings" />
                  <ButtonMenu.Label>Dashboard options</ButtonMenu.Label>
                </ButtonMenu.SubTrigger>
                <ButtonMenu.SubContent itemsLayout="columns">
                  <ButtonMenu.Group>
                    <ButtonMenu.Item
                      textValue="Manage widgets"
                      onSelect={() => onAction('Manage widgets')}
                    >
                      <ButtonMenu.Icon name="dashboard" />
                      <ButtonMenu.Label>Manage widgets</ButtonMenu.Label>
                    </ButtonMenu.Item>
                    <ButtonMenu.Item
                      textValue="Dashboard settings"
                      onSelect={() => onAction('Dashboard settings')}
                    >
                      <ButtonMenu.Icon name="settings" />
                      <ButtonMenu.Label>Dashboard settings</ButtonMenu.Label>
                    </ButtonMenu.Item>
                  </ButtonMenu.Group>
                </ButtonMenu.SubContent>
              </ButtonMenu.Sub>
            </ButtonMenu.Group>
          </ButtonMenu.SubContent>
        </ButtonMenu.Sub>
      </ButtonMenu.Group>
    </ButtonMenu.Content>
  );
}

function MenuContent({ onAction }: MenuContentProps) {
  return (
    <ButtonMenu.Content>
      <ButtonMenu.Group>
        <ButtonMenu.GroupLabel>Clipboard</ButtonMenu.GroupLabel>
        <ButtonMenu.Item
          textValue="Duplicate"
          aria-keyshortcuts="Control+D"
          onSelect={() => onAction('Duplicate')}
        >
          <ButtonMenu.Icon name="plus" />
          <ButtonMenu.Label>Duplicate</ButtonMenu.Label>
          <ButtonMenu.Shortcut>Ctrl+D</ButtonMenu.Shortcut>
        </ButtonMenu.Item>
        <ButtonMenu.Item textValue="Move to folder" onSelect={() => onAction('Move to folder')}>
          <ButtonMenu.Label>Move to folder</ButtonMenu.Label>
        </ButtonMenu.Item>
      </ButtonMenu.Group>
      <ButtonMenu.Separator />
      <ButtonMenu.Group>
        <ButtonMenu.GroupLabel>Workspace</ButtonMenu.GroupLabel>
        <ButtonMenu.Item
          textValue="Open search"
          aria-keyshortcuts="Control+K"
          onSelect={() => onAction('Open search')}
        >
          <ButtonMenu.Icon name="search" />
          <ButtonMenu.Label>Open search</ButtonMenu.Label>
          <ButtonMenu.Shortcut>Ctrl+K</ButtonMenu.Shortcut>
        </ButtonMenu.Item>
        <ButtonMenu.Item
          href="#button-menu-title"
          textValue="Settings"
          onSelect={() => onAction('Settings')}
        >
          <ButtonMenu.Icon name="settings" />
          <ButtonMenu.Label>Settings</ButtonMenu.Label>
          <ButtonMenu.Trailing name="link" />
        </ButtonMenu.Item>
        <ButtonMenu.Item textValue="Unavailable action" disabled>
          <ButtonMenu.Label>Unavailable action</ButtonMenu.Label>
        </ButtonMenu.Item>
      </ButtonMenu.Group>
      <ButtonMenu.Separator />
      <ButtonMenu.Group>
        <ButtonMenu.GroupLabel>Danger zone</ButtonMenu.GroupLabel>
        <ButtonMenu.Item
          textValue="Archive"
          intent="destructive"
          onSelect={() => onAction('Archive')}
        >
          <ButtonMenu.Icon name="trash" />
          <ButtonMenu.Label>Archive</ButtonMenu.Label>
        </ButtonMenu.Item>
      </ButtonMenu.Group>
    </ButtonMenu.Content>
  );
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
  const [lastAction, setLastAction] = useState('No action yet');
  const [workItemType, setWorkItemType] = useState('task');

  const handleWorkItemTypeChange = (value: string) => {
    setWorkItemType(value);
    setLastAction(`Changed work item type to ${value}`);
  };

  if (!available) return null;

  return (
    <section className={styles.buttonMenuSection} aria-labelledby="button-menu-title">
      <Text as="h3" id="button-menu-title" profile={textProfiles.sectionTitle}>
        Button menu
      </Text>
      <Text as="p" profile={textProfiles.body} className={styles.showcaseSectionDescription}>
        One composition covers a menu button and a split button, while labelled action groups,
        exclusive choices, shortcuts and recursive submenus share the same Dropdown surface.
      </Text>
      <div className={styles.buttonMenuGrid}>
        <article>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            Menu button
          </Text>
          <ButtonMenu.Root presence={presence} scale={scale}>
            <ButtonMenu.Trigger
              intent="primary"
              emphasis="high"
              scale={scale}
              surfaceContext={surfaceContext}
            >
              <Button.Label>Actions</Button.Label>
            </ButtonMenu.Trigger>
            <WorkItemMenuContent
              onAction={setLastAction}
              workItemType={workItemType}
              onWorkItemTypeChange={handleWorkItemTypeChange}
            />
          </ButtonMenu.Root>
        </article>

        <article>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            Leading icon
          </Text>
          <ButtonMenu.Root presence={presence} scale={scale}>
            <ButtonMenu.Trigger
              intent="neutral"
              emphasis="medium"
              scale={scale}
              surfaceContext={surfaceContext}
            >
              <Button.Icon name="settings" />
              <Button.Label>Settings</Button.Label>
            </ButtonMenu.Trigger>
            <MenuContent onAction={setLastAction} />
          </ButtonMenu.Root>
        </article>

        <article>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            Split button
          </Text>
          <ButtonMenu.Root presence={presence} scale={scale}>
            <ButtonMenu.Action
              intent="primary"
              emphasis="high"
              scale={scale}
              surfaceContext={surfaceContext}
              onClick={() => setLastAction('Save')}
            >
              <Button.Label>Save</Button.Label>
            </ButtonMenu.Action>
            <ButtonMenu.Trigger
              aria-label="More save actions"
              intent="primary"
              emphasis="high"
              scale={scale}
              surfaceContext={surfaceContext}
            />
            <MenuContent onAction={setLastAction} />
          </ButtonMenu.Root>
        </article>
      </div>
      <Text as="p" role="status" profile={textProfiles.caption} className={styles.buttonMenuStatus}>
        {lastAction}
      </Text>
    </section>
  );
}
