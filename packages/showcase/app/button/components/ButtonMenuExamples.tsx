'use client';

import type { ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import { Button, ButtonMenu, Text } from '@kiskadee/react-components';
import { useState } from 'react';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';

function MenuContent({ onAction }: { onAction: (label: string) => void }) {
  return (
    <ButtonMenu.Content>
      <ButtonMenu.Item textValue="Duplicate" onSelect={() => onAction('Duplicate')}>
        <ButtonMenu.Icon name="plus" />
        <ButtonMenu.Label>Duplicate</ButtonMenu.Label>
      </ButtonMenu.Item>
      <ButtonMenu.Item textValue="Move" onSelect={() => onAction('Move')}>
        <ButtonMenu.Label>Move to folder</ButtonMenu.Label>
      </ButtonMenu.Item>
      <ButtonMenu.Separator />
      <ButtonMenu.Item
        textValue="Archive"
        intent="destructive"
        onSelect={() => onAction('Archive')}
      >
        <ButtonMenu.Icon name="trash" />
        <ButtonMenu.Label>Archive</ButtonMenu.Label>
      </ButtonMenu.Item>
    </ButtonMenu.Content>
  );
}

export function ButtonMenuExamples({
  available,
  scale,
  surfaceContext
}: {
  available: boolean;
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const textProfiles = useShowcaseTextProfiles();
  const [lastAction, setLastAction] = useState('No action yet');

  if (!available) return null;

  return (
    <section className={styles.buttonMenuSection} aria-labelledby="button-menu-title">
      <Text as="h3" id="button-menu-title" profile={textProfiles.sectionTitle}>
        Button menu
      </Text>
      <Text as="p" profile={textProfiles.body} className={styles.showcaseSectionDescription}>
        One public composition covers a menu button and a split button without nesting interactive
        elements.
      </Text>
      <div className={styles.buttonMenuGrid}>
        <article>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            Menu button
          </Text>
          <ButtonMenu.Root scale={scale}>
            <ButtonMenu.Trigger
              intent="primary"
              emphasis="high"
              scale={scale}
              surfaceContext={surfaceContext}
            >
              <Button.Label>Actions</Button.Label>
            </ButtonMenu.Trigger>
            <MenuContent onAction={setLastAction} />
          </ButtonMenu.Root>
        </article>

        <article>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            Leading icon
          </Text>
          <ButtonMenu.Root scale={scale}>
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
          <ButtonMenu.Root scale={scale}>
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
