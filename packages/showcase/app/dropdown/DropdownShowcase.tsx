'use client';

import type { DropdownPresence } from '@kiskadee/core';
import {
  Button,
  ButtonMenu,
  ContextMenu,
  Dropdown,
  FamilyResolvedIcon,
  Text,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import type { ReactNode, Ref } from 'react';
import { useState } from 'react';
import {
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useDropdownPresenceControl } from '@/hooks/use-dropdown-presence-control';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './Dropdown.module.scss';

type DemoDropdownProps = {
  buttonLabel: string;
  children: ReactNode;
  collection?: boolean;
  layout?: 'independent' | 'columns';
  placement?: 'bottom-start' | 'right-start';
  presence?: DropdownPresence;
  width?: 'content' | 'min-anchor' | 'anchor';
};

function DemoDropdown({
  buttonLabel,
  children,
  collection = true,
  layout = 'independent',
  placement = 'bottom-start',
  presence,
  width = 'min-anchor'
}: DemoDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown.Root open={open} onOpenChange={setOpen} presence={presence}>
      <Dropdown.Anchor
        render={(anchorProps) => {
          const { ref, ...props } = anchorProps;
          return (
            <Button
              {...props}
              ref={ref as Ref<HTMLButtonElement>}
              intent="neutral"
              emphasis="medium"
            >
              <Button.Label>{buttonLabel}</Button.Label>
              <Button.Disclosure />
            </Button>
          );
        }}
      />
      <Dropdown.Content placement={placement} width={width}>
        <Dropdown.Surface>
          {collection ? <Dropdown.Items layout={layout}>{children}</Dropdown.Items> : children}
        </Dropdown.Surface>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}

function DemoItem({
  children,
  disabled = false,
  selected = false
}: {
  children: ReactNode;
  disabled?: boolean;
  selected?: boolean;
}) {
  return (
    <Dropdown.Item
      disabled={disabled}
      selected={selected}
      render={(props) => {
        const { ref, ...buttonProps } = props;
        return (
          <button
            {...buttonProps}
            ref={ref as Ref<HTMLButtonElement>}
            type="button"
            disabled={disabled}
          >
            {children}
          </button>
        );
      }}
    />
  );
}

function Unavailable() {
  const textProfiles = useShowcaseTextProfiles();
  return (
    <div className={styles.unavailable}>
      <Text as="p" profile={textProfiles.body}>
        Dropdown is not available in the active design system.
      </Text>
    </div>
  );
}

const LONG_MENU_ITEMS = Array.from({ length: 64 }, (_, index) => ({
  id: `long-menu-${index + 1}`,
  label: `Workspace command ${index + 1}`
}));

function LongMenu({ presence }: { presence?: DropdownPresence }) {
  return (
    <ButtonMenu.Root presence={presence} buttonGroup={{ intent: 'neutral', emphasis: 'medium' }}>
      <ButtonMenu.Trigger>
        <Button.Label>Open long menu</Button.Label>
      </ButtonMenu.Trigger>
      <ButtonMenu.Content aria-label="Long workspace menu">
        <ButtonMenu.Group>
          <ButtonMenu.GroupLabel>Workspace</ButtonMenu.GroupLabel>
          {LONG_MENU_ITEMS.slice(0, 24).map((item) => (
            <ButtonMenu.Item key={item.id} textValue={item.label}>
              <ButtonMenu.Label>{item.label}</ButtonMenu.Label>
              {item.id.endsWith('1') ? <ButtonMenu.Shortcut>Ctrl+K</ButtonMenu.Shortcut> : null}
            </ButtonMenu.Item>
          ))}
        </ButtonMenu.Group>
        <ButtonMenu.Separator />
        <ButtonMenu.Group>
          <ButtonMenu.GroupLabel>Options</ButtonMenu.GroupLabel>
          <ButtonMenu.CheckboxItem defaultControlState textValue="Keep panel open">
            <ButtonMenu.Label>Keep panel open</ButtonMenu.Label>
          </ButtonMenu.CheckboxItem>
          <ButtonMenu.RadioGroup defaultValue="comfortable">
            <ButtonMenu.RadioItem value="comfortable" textValue="Comfortable density">
              <ButtonMenu.Label>Comfortable density</ButtonMenu.Label>
            </ButtonMenu.RadioItem>
            <ButtonMenu.RadioItem value="compact" textValue="Compact density">
              <ButtonMenu.Label>Compact density</ButtonMenu.Label>
            </ButtonMenu.RadioItem>
          </ButtonMenu.RadioGroup>
          <ButtonMenu.Sub>
            <ButtonMenu.SubTrigger textValue="More commands">
              <ButtonMenu.Label>More commands</ButtonMenu.Label>
            </ButtonMenu.SubTrigger>
            <ButtonMenu.SubContent aria-label="More long-menu commands">
              <ButtonMenu.Group>
                {LONG_MENU_ITEMS.slice(24).map((item) => (
                  <ButtonMenu.Item key={item.id} textValue={item.label}>
                    <ButtonMenu.Label>{item.label}</ButtonMenu.Label>
                  </ButtonMenu.Item>
                ))}
              </ButtonMenu.Group>
            </ButtonMenu.SubContent>
          </ButtonMenu.Sub>
        </ButtonMenu.Group>
      </ButtonMenu.Content>
    </ButtonMenu.Root>
  );
}

function ContextMenuDemo({ presence }: { presence?: DropdownPresence }) {
  return (
    <ContextMenu.Root presence={presence}>
      <ContextMenu.Trigger>
        <div className={styles.contextArea}>
          Right-click here, or focus this area and press Shift+F10 / Menu.
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content aria-label="Canvas context menu">
        <ContextMenu.Group>
          <ContextMenu.GroupLabel>Canvas</ContextMenu.GroupLabel>
          <ContextMenu.Item textValue="Copy">
            <ContextMenu.Label>Copy</ContextMenu.Label>
            <ContextMenu.Shortcut>Ctrl+C</ContextMenu.Shortcut>
          </ContextMenu.Item>
          <ContextMenu.Item textValue="Paste">
            <ContextMenu.Label>Paste</ContextMenu.Label>
            <ContextMenu.Shortcut>Ctrl+V</ContextMenu.Shortcut>
          </ContextMenu.Item>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger textValue="Arrange">
              <ContextMenu.Label>Arrange</ContextMenu.Label>
            </ContextMenu.SubTrigger>
            <ContextMenu.SubContent aria-label="Arrange commands">
              <ContextMenu.Group>
                {LONG_MENU_ITEMS.slice(0, 18).map((item) => (
                  <ContextMenu.Item key={item.id} textValue={item.label}>
                    <ContextMenu.Label>{item.label}</ContextMenu.Label>
                  </ContextMenu.Item>
                ))}
              </ContextMenu.Group>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}

export default function DropdownShowcase() {
  const { designSystem, global } = useKiskadee();
  const { manifest } = useShowcase();
  const textProfiles = useShowcaseTextProfiles();
  const available = Boolean(manifest?.components?.dropdown && manifest.components.button);
  const presenceArtifact = global?.components?.dropdown?.effects?.presence;
  const { presenceOptions, presenceOverride, presenceSelection, setPresenceSelection } =
    useDropdownPresenceControl({ designSystem, presenceArtifact });

  return (
    <main className={styles.page}>
      <Text as="h2" profile={textProfiles.pageTitle}>
        Dropdown
      </Text>
      <Text as="p" profile={textProfiles.body} className={styles.lead}>
        One visual surface shared by menus, value selection and autocomplete suggestions.
      </Text>
      <ShowcaseRouteControls
        id="dropdown"
        eyebrow="Dropdown"
        title="Examples"
        isAvailable={available}
      >
        <ShowcaseControlPanel>
          <ShowcaseControlGroup title="Motion">
            <ShowcaseControlStack>
              <ShowcaseSelectControl
                label="Presence"
                options={presenceOptions}
                value={presenceSelection}
                onValueChange={setPresenceSelection}
              />
            </ShowcaseControlStack>
          </ShowcaseControlGroup>
        </ShowcaseControlPanel>
      </ShowcaseRouteControls>

      {!available ? (
        <Unavailable />
      ) : (
        <div className={styles.sections}>
          <section className={styles.section} aria-labelledby="dropdown-collections-title">
            <Text as="h3" id="dropdown-collections-title" profile={textProfiles.sectionTitle}>
              Collections
            </Text>
            <Text as="p" profile={textProfiles.body} className={styles.description}>
              Leading icons and selection checks reserve columns only inside the group that uses
              them.
            </Text>
            <div className={styles.grid}>
              <article className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Without icons
                </Text>
                <DemoDropdown buttonLabel="Sort by" presence={presenceOverride}>
                  <Dropdown.Group>
                    <Dropdown.GroupLabel>Sort order</Dropdown.GroupLabel>
                    <DemoItem selected>
                      <Dropdown.Label>Most relevant</Dropdown.Label>
                    </DemoItem>
                    <DemoItem>
                      <Dropdown.Label>Newest first</Dropdown.Label>
                    </DemoItem>
                    <DemoItem disabled>
                      <Dropdown.Label>Most discussed</Dropdown.Label>
                    </DemoItem>
                  </Dropdown.Group>
                </DemoDropdown>
              </article>

              <article className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Mixed icons
                </Text>
                <DemoDropdown buttonLabel="Workspace actions" presence={presenceOverride}>
                  <Dropdown.Group>
                    <Dropdown.GroupLabel>Workspace</Dropdown.GroupLabel>
                    <DemoItem>
                      <Dropdown.Icon>
                        <FamilyResolvedIcon name="settings" />
                      </Dropdown.Icon>
                      <Dropdown.Label>Settings</Dropdown.Label>
                      <Dropdown.EndText>Ctrl+,</Dropdown.EndText>
                    </DemoItem>
                    <DemoItem>
                      <Dropdown.Label>Duplicate</Dropdown.Label>
                      <Dropdown.EndText>Ctrl+D</Dropdown.EndText>
                    </DemoItem>
                  </Dropdown.Group>
                  <Dropdown.Separator />
                  <Dropdown.Group>
                    <Dropdown.GroupLabel>Danger zone</Dropdown.GroupLabel>
                    <Dropdown.Item
                      intent="destructive"
                      render={(props) => {
                        const { ref, ...buttonProps } = props;
                        return (
                          <button
                            {...buttonProps}
                            ref={ref as Ref<HTMLButtonElement>}
                            type="button"
                          >
                            <Dropdown.Label>Delete workspace</Dropdown.Label>
                          </button>
                        );
                      }}
                    />
                  </Dropdown.Group>
                </DemoDropdown>
              </article>

              <article className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Rich item
                </Text>
                <DemoDropdown
                  buttonLabel="Notification settings"
                  presence={presenceOverride}
                  width="content"
                >
                  <Dropdown.Group>
                    <Dropdown.GroupLabel>Notifications</Dropdown.GroupLabel>
                    <DemoItem>
                      <Dropdown.Icon>
                        <FamilyResolvedIcon name="bell" />
                      </Dropdown.Icon>
                      <Dropdown.Label>Product updates</Dropdown.Label>
                      <Dropdown.Description>
                        Occasional announcements about new capabilities.
                      </Dropdown.Description>
                    </DemoItem>
                    <DemoItem>
                      <Dropdown.Label>Security alerts</Dropdown.Label>
                      <Dropdown.Description>
                        Important changes to your account and sessions.
                      </Dropdown.Description>
                      <Dropdown.Trailing>
                        <FamilyResolvedIcon name="link" />
                      </Dropdown.Trailing>
                    </DemoItem>
                  </Dropdown.Group>
                </DemoDropdown>
              </article>

              <article className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Selection anatomy
                </Text>
                <DemoDropdown
                  buttonLabel="View layout"
                  layout="columns"
                  presence={presenceOverride}
                  width="content"
                >
                  <Dropdown.Group>
                    <Dropdown.GroupLabel>View mode</Dropdown.GroupLabel>
                    <DemoItem>
                      <Dropdown.Checkmark visible />
                      <Dropdown.Icon>
                        <FamilyResolvedIcon name="dashboard" />
                      </Dropdown.Icon>
                      <Dropdown.Label>Dashboard</Dropdown.Label>
                      <Dropdown.EndText>Default</Dropdown.EndText>
                    </DemoItem>
                    <DemoItem>
                      <Dropdown.Checkmark visible={false} />
                      <Dropdown.Icon>
                        <FamilyResolvedIcon name="list" />
                      </Dropdown.Icon>
                      <Dropdown.Label>List</Dropdown.Label>
                    </DemoItem>
                  </Dropdown.Group>
                  <Dropdown.Separator />
                  <Dropdown.Group>
                    <DemoItem>
                      <Dropdown.Icon>
                        <FamilyResolvedIcon name="spreadsheet" />
                      </Dropdown.Icon>
                      <Dropdown.Label>More layouts</Dropdown.Label>
                      <Dropdown.Trailing>
                        <FamilyResolvedIcon name="chevron-end" />
                      </Dropdown.Trailing>
                    </DemoItem>
                  </Dropdown.Group>
                </DemoDropdown>
              </article>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="dropdown-free-content-title">
            <Text as="h3" id="dropdown-free-content-title" profile={textProfiles.sectionTitle}>
              Free content
            </Text>
            <Text as="p" profile={textProfiles.body} className={styles.description}>
              The shared surface can host non-interactive supporting content without changing the
              semantics of Menu, Select or Autocomplete.
            </Text>
            <div className={`${styles.card} ${styles.edgeStage}`}>
              <DemoDropdown
                buttonLabel="Open project summary"
                collection={false}
                placement="right-start"
                presence={presenceOverride}
                width="content"
              >
                <div className={styles.richContent}>
                  <div>
                    <Text as="p" profile={textProfiles.groupTitle}>
                      Project Aurora
                    </Text>
                    <Text as="p" profile={textProfiles.caption} className={styles.muted}>
                      12 active collaborators
                    </Text>
                  </div>
                  <div className={styles.metric}>
                    <Text as="span" profile={textProfiles.caption}>
                      Progress
                    </Text>
                    <Text as="strong" profile={textProfiles.subsectionTitle}>
                      78%
                    </Text>
                  </div>
                </div>
              </DemoDropdown>
              <Text as="p" profile={textProfiles.caption} className={styles.muted}>
                The preferred right placement flips or shifts when it approaches a viewport edge.
              </Text>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="dropdown-long-menu-title">
            <Text as="h3" id="dropdown-long-menu-title" profile={textProfiles.sectionTitle}>
              Long menus and native scrolling
            </Text>
            <Text as="p" profile={textProfiles.body} className={styles.description}>
              Sixty-four mounted commands exercise native wheel, trackpad, touch and keyboard
              scrolling. Edge arrows appear only while more content exists in that direction.
            </Text>
            <div className={styles.grid}>
              <article className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Extensive ButtonMenu
                </Text>
                <LongMenu presence={presenceOverride} />
              </article>
              <article className={`${styles.card} ${styles.contextCard}`}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Context Menu
                </Text>
                <ContextMenuDemo presence={presenceOverride} />
              </article>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="dropdown-collision-title">
            <Text as="h3" id="dropdown-collision-title" profile={textProfiles.sectionTitle}>
              Collision laboratory
            </Text>
            <Text as="p" profile={textProfiles.body} className={styles.description}>
              Open each trigger near a different edge. Submenus preserve logical keyboard direction
              even when collision handling moves them across their parent.
            </Text>
            <div className={styles.collisionStage}>
              {(['topStart', 'topEnd', 'bottomStart', 'bottomEnd'] as const).map((position) => (
                <div
                  key={position}
                  className={styles[position]}
                  dir={position.endsWith('End') ? 'rtl' : 'ltr'}
                >
                  <ButtonMenu.Root
                    presence={presenceOverride}
                    buttonGroup={{ intent: 'neutral', emphasis: 'low' }}
                  >
                    <ButtonMenu.Trigger>
                      <Button.Label>{position}</Button.Label>
                    </ButtonMenu.Trigger>
                    <ButtonMenu.Content>
                      <ButtonMenu.Group>
                        <ButtonMenu.Sub>
                          <ButtonMenu.SubTrigger textValue="Open submenu">
                            <ButtonMenu.Label>Open submenu</ButtonMenu.Label>
                          </ButtonMenu.SubTrigger>
                          <ButtonMenu.SubContent>
                            <ButtonMenu.Group>
                              {LONG_MENU_ITEMS.slice(0, 12).map((item) => (
                                <ButtonMenu.Item key={item.id} textValue={item.label}>
                                  <ButtonMenu.Label>{item.label}</ButtonMenu.Label>
                                </ButtonMenu.Item>
                              ))}
                            </ButtonMenu.Group>
                          </ButtonMenu.SubContent>
                        </ButtonMenu.Sub>
                      </ButtonMenu.Group>
                    </ButtonMenu.Content>
                  </ButtonMenu.Root>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
