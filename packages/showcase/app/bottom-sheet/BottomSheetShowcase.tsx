'use client';

import type {
  BottomSheetCenteredIcons,
  BottomSheetInitialHeight,
  BottomSheetItemLayout,
  BottomSheetPageTransition,
  BottomSheetSwipeBehavior
} from '@kiskadee/core';
import type { IconName } from '@kiskadee/icons/interface';
import {
  BottomSheetMenu,
  Button,
  type MenuTree,
  Text,
  useShowcase
} from '@kiskadee/react-components';
import { useMemo, useState } from 'react';
import {
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './BottomSheet.module.scss';

const HEIGHT_OPTIONS = [
  { value: 'content', label: 'Content' },
  { value: 'standard', label: 'Standard' },
  { value: 'maximum', label: 'Maximum' }
];
const SWIPE_OPTIONS = [
  { value: 'expand-dismiss', label: 'Expand + dismiss' },
  { value: 'dismiss', label: 'Dismiss only' },
  { value: 'none', label: 'None' }
];
const TRANSITION_OPTIONS = [
  { value: 'slide', label: 'Slide (lazy)' },
  { value: 'none', label: 'None' }
];
const LAYOUT_OPTIONS = [
  { value: 'centered', label: 'Centered' },
  { value: 'structured', label: 'Structured' }
];
const ICON_OPTIONS = [
  { value: 'hide', label: 'Hide centered icons' },
  { value: 'show', label: 'Show centered icons' }
];

function createShowcaseTree(onAction: (label: string) => void): MenuTree<IconName> {
  return {
    id: 'bottom-sheet-showcase',
    title: 'Workspace actions',
    items: [
      {
        type: 'group',
        id: 'workspace-primary',
        label: 'Workspace',
        items: [
          {
            type: 'item',
            id: 'new-document',
            label: 'New document',
            icon: 'plus',
            description: 'Create an empty document',
            onSelect: () => onAction('New document')
          },
          {
            type: 'link',
            id: 'open-settings',
            label: 'Settings',
            icon: 'settings',
            href: '#bottom-sheet-title',
            trailingIcon: 'link',
            onSelect: () => onAction('Settings')
          },
          {
            type: 'submenu',
            id: 'share',
            label: 'Share',
            title: 'Share workspace',
            icon: 'share',
            items: [
              {
                type: 'item',
                id: 'share-link',
                label: 'Copy public link',
                icon: 'link',
                onSelect: () => onAction('Copy public link')
              },
              {
                type: 'submenu',
                id: 'share-permissions',
                label: 'Permissions',
                title: 'Share permissions',
                icon: 'settings',
                items: [
                  {
                    type: 'radio-group',
                    id: 'permission-level',
                    label: 'Access level',
                    defaultValue: 'view',
                    items: [
                      {
                        type: 'radio',
                        id: 'permission-view',
                        value: 'view',
                        label: 'Can view',
                        icon: 'user'
                      },
                      {
                        type: 'radio',
                        id: 'permission-comment',
                        value: 'comment',
                        label: 'Can comment',
                        icon: 'mail'
                      },
                      {
                        type: 'radio',
                        id: 'permission-edit',
                        value: 'edit',
                        label: 'Can edit',
                        icon: 'pencil'
                      }
                    ],
                    onValueChange: (value) => onAction(`Permission: ${value}`)
                  }
                ]
              }
            ]
          }
        ]
      },
      { type: 'separator', id: 'workspace-separator' },
      ...Array.from({ length: 28 }, (_, index) => ({
        type: 'item' as const,
        id: `recent-${index + 1}`,
        label: `Recent workspace ${index + 1}`,
        icon: 'folder-move' as IconName,
        onSelect: () => onAction(`Recent workspace ${index + 1}`)
      })),
      { type: 'separator', id: 'danger-separator' },
      {
        type: 'item',
        id: 'delete-workspace',
        label: 'Delete workspace',
        icon: 'trash',
        intent: 'destructive',
        onSelect: () => onAction('Delete workspace')
      }
    ]
  };
}

export default function BottomSheetShowcase() {
  const { manifest } = useShowcase();
  const textProfiles = useShowcaseTextProfiles();
  const available = Boolean(manifest?.components?.bottomSheet && manifest.components.button);
  const [initialHeight, setInitialHeight] = useState<BottomSheetInitialHeight>('standard');
  const [swipeBehavior, setSwipeBehavior] = useState<BottomSheetSwipeBehavior>('expand-dismiss');
  const [pageTransition, setPageTransition] = useState<BottomSheetPageTransition>('slide');
  const [itemLayout, setItemLayout] = useState<BottomSheetItemLayout>('centered');
  const [centeredIcons, setCenteredIcons] = useState<BottomSheetCenteredIcons>('hide');
  const [lastAction, setLastAction] = useState('No action yet');
  const tree = useMemo(() => createShowcaseTree(setLastAction), []);

  return (
    <main className={styles.page}>
      <Text as="h2" id="bottom-sheet-title" profile={textProfiles.pageTitle}>
        BottomSheet
      </Text>
      <Text as="p" profile={textProfiles.body} className={styles.lead}>
        Modal mobile presentation with fixed detents, vertical gestures and page-based submenus.
      </Text>
      <ShowcaseRouteControls
        id="bottom-sheet"
        eyebrow="BottomSheet"
        title="Examples"
        isAvailable={available}
      >
        <ShowcaseControlPanel>
          <ShowcaseControlGroup title="Behavior">
            <ShowcaseControlStack>
              <ShowcaseSelectControl
                label="Initial height"
                options={HEIGHT_OPTIONS}
                value={initialHeight}
                onValueChange={(value) => setInitialHeight(value as BottomSheetInitialHeight)}
              />
              <ShowcaseSelectControl
                label="Swipe"
                options={SWIPE_OPTIONS}
                value={swipeBehavior}
                onValueChange={(value) => setSwipeBehavior(value as BottomSheetSwipeBehavior)}
              />
              <ShowcaseSelectControl
                label="Page transition"
                options={TRANSITION_OPTIONS}
                value={pageTransition}
                onValueChange={(value) => setPageTransition(value as BottomSheetPageTransition)}
              />
              <ShowcaseSelectControl
                label="Item layout"
                options={LAYOUT_OPTIONS}
                value={itemLayout}
                onValueChange={(value) => setItemLayout(value as BottomSheetItemLayout)}
              />
              <ShowcaseSelectControl
                label="Centered icons"
                options={ICON_OPTIONS}
                value={centeredIcons}
                onValueChange={(value) => setCenteredIcons(value as BottomSheetCenteredIcons)}
              />
            </ShowcaseControlStack>
          </ShowcaseControlGroup>
        </ShowcaseControlPanel>
      </ShowcaseRouteControls>

      {!available ? (
        <div className={styles.unavailable}>
          <Text as="p" profile={textProfiles.body}>
            BottomSheet is not available in the active design system.
          </Text>
        </div>
      ) : (
        <section className={styles.section} aria-labelledby="bottom-sheet-behavior-title">
          <Text as="h3" id="bottom-sheet-behavior-title" profile={textProfiles.sectionTitle}>
            Menu navigation and overflow
          </Text>
          <Text as="p" profile={textProfiles.body} className={styles.description}>
            The long root page exercises scrolling; Share exercises two nested page levels.
          </Text>
          <div className={styles.stage}>
            <BottomSheetMenu.Root
              tree={tree}
              initialHeight={initialHeight}
              swipeBehavior={swipeBehavior}
              pageTransition={pageTransition}
              itemLayout={itemLayout}
              centeredIcons={centeredIcons}
              buttonGroup={{ emphasis: 'high', intent: 'primary' }}
            >
              <BottomSheetMenu.Trigger>
                <Button.Label>Open actions</Button.Label>
              </BottomSheetMenu.Trigger>
            </BottomSheetMenu.Root>
            <Text as="p" role="status" profile={textProfiles.caption} className={styles.status}>
              {lastAction}
            </Text>
          </div>
        </section>
      )}
    </main>
  );
}
