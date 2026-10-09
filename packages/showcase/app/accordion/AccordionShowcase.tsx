'use client';

import { Accordion, type AccordionProps } from '@kiskadee/react-components/accordion';
import { Button } from '@kiskadee/react-components/button';
import { Card } from '@kiskadee/react-components/card';
import { Crossfade } from '@kiskadee/react-components/crossfade';
import { FamilyResolvedIcon, Icon } from '@kiskadee/react-components/icon';
import { Layout } from '@kiskadee/react-components/layout';
import { useComponentMetadata, useKiskadee } from '@kiskadee/react-components/resources';
import { Rotate } from '@kiskadee/react-components/rotate';
import { Text } from '@kiskadee/react-components/text';
import { type ReactNode, useState } from 'react';
import { ShowcaseGlobalSemanticControls } from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import {
  ShowcaseBooleanControl,
  ShowcaseControlGroup,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseMetadata } from '@/hooks/use-showcase-metadata';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './Accordion.module.scss';

function Example({ title, children }: { title: string; children: ReactNode }) {
  const profiles = useShowcaseTextProfiles();
  return (
    <Layout display="flex" direction="column" gap="sm">
      <Text as="h3" profile={profiles.sectionTitle}>
        {title}
      </Text>
      <Card intent="neutral" emphasis="lowest" border clipContent shadow={false}>
        <Layout padding="lg">{children}</Layout>
      </Card>
    </Layout>
  );
}
function PanelContent({ children }: { children: ReactNode }) {
  const profiles = useShowcaseTextProfiles();
  return (
    <Layout padding="md">
      <Text as="div" profile={profiles.body}>
        {children}
      </Text>
    </Layout>
  );
}
function Support({
  motion,
  emphasis,
  border,
  shadow,
  panelEmphasis = 'low',
  divider,
  indicatorTransition
}: {
  motion: boolean;
  emphasis: NonNullable<AccordionProps['emphasis']>;
  panelEmphasis?: AccordionProps['panelEmphasis'];
  divider?: boolean;
  indicatorTransition?: AccordionProps['indicatorTransition'];
  border: boolean;
  shadow: boolean;
}) {
  return (
    <Accordion
      border={border}
      shadow={shadow}
      motion={motion}
      emphasis={emphasis}
      panelEmphasis={panelEmphasis}
      divider={divider}
      indicatorTransition={indicatorTransition}
      defaultExpandedItems={['support']}
    >
      <Accordion.Item value="support">
        <Accordion.Header icon={<FamilyResolvedIcon name="settings" />}>
          Help with Windows Update
        </Accordion.Header>
        <Accordion.Panel>
          <PanelContent>
            <Layout display="flex" direction="column" gap="sm">
              <a href="https://support.microsoft.com/windows/windows-update">
                Learn about Windows Update
              </a>
              <a href="https://support.microsoft.com/windows">Find Windows support</a>
            </Layout>
          </PanelContent>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
export default function AccordionShowcase() {
  const { manifest } = useShowcaseMetadata([
    'accordion',
    'card',
    'container',
    'separator',
    'layout',
    'text',
    'button',
    'icon'
  ]);
  const metadata = useComponentMetadata('accordion');
  const { theme } = useKiskadee();
  const profiles = useShowcaseTextProfiles();
  const [divider, setDivider] = useState<boolean | undefined>();
  const [border, setBorder] = useState(true);
  const [shadow, setShadow] = useState(false);
  const [indicatorOverride, setIndicatorOverride] =
    useState<AccordionProps['indicatorTransition']>();
  const [helperAlternate, setHelperAlternate] = useState(false);
  const indicatorTransition = indicatorOverride;
  const helperTiming = metadata?.effects?.presence?.profiles['grow-height'];
  const helperDuration = helperTiming?.enterDurationMs ?? 0;
  const helperEasing = helperTiming?.enterEasing ?? 'ease-out';
  const [motion, setMotion] = useState(true);
  const [multiple, setMultiple] = useState(false);
  const [locked, setLocked] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [paragraphs, setParagraphs] = useState(['1']);
  const available = Boolean(
    manifest?.components?.accordion && metadata?.options?.themes.includes(theme as 'light')
  );
  return (
    <main className={styles.page}>
      <ShowcaseRouteControls
        id="accordion"
        eyebrow="Accordion"
        title="Controls"
        showGlobalControls={false}
      >
        <ShowcaseControlGroup title="Semantic">
          <ShowcaseGlobalSemanticControls />
        </ShowcaseControlGroup>
        <ShowcaseControlGroup title="Comparison appearance">
          <ShowcaseBooleanControl
            label="Divider"
            checked={divider ?? metadata?.options?.divider ?? false}
            onCheckedChange={setDivider}
          />
          <ShowcaseBooleanControl label="Border" checked={border} onCheckedChange={setBorder} />
          <ShowcaseBooleanControl label="Shadow" checked={shadow} onCheckedChange={setShadow} />
        </ShowcaseControlGroup>
        <ShowcaseControlGroup title="Behavior">
          <ShowcaseSelectControl
            label="Indicator transition"
            options={[
              { label: 'Preset default', value: 'preset' },
              { label: 'Rotate', value: 'rotate' },
              { label: 'Crossfade', value: 'crossfade' },
              { label: 'None', value: 'none' }
            ]}
            value={indicatorOverride ?? 'preset'}
            onValueChange={(value) =>
              setIndicatorOverride(
                value === 'preset' ? undefined : (value as AccordionProps['indicatorTransition'])
              )
            }
          />
          <ShowcaseBooleanControl
            label="Panel motion"
            checked={motion}
            onCheckedChange={setMotion}
          />
          <ShowcaseBooleanControl
            label="Multiple open"
            checked={multiple}
            onCheckedChange={(value) => {
              setMultiple(value);
              setExpanded((current) => (value ? current : current.slice(0, 1)));
            }}
          />
          <ShowcaseBooleanControl
            label="Interaction locked"
            checked={locked}
            onCheckedChange={setLocked}
          />
          <ShowcaseBooleanControl label="Right to left" checked={rtl} onCheckedChange={setRtl} />
        </ShowcaseControlGroup>
      </ShowcaseRouteControls>
      <Layout display="flex" direction="column" gap="lg2">
        <Layout display="flex" direction="column" gap="sm">
          <Text as="h2" profile={profiles.pageTitle}>
            Accordion
          </Text>
          <Text as="p" profile={profiles.body}>
            Neutral emphases use the same surfaces as Card. These examples use low panel emphasis,
            except for the matching-emphasis example. Divider follows the preset default unless
            overridden.
          </Text>
        </Layout>
        {!available ? (
          <Text as="p" profile={profiles.body}>
            Accordion is available in Fluent 2 by Microsoft, Light theme. Select that preset and
            theme to explore these examples.
          </Text>
        ) : (
          <Layout display="flex" direction="column" gap="lg2" dir={rtl ? 'rtl' : 'ltr'}>
            <Layout display="grid" columns={{ 'bp:all': 1, 'bp:lg:1': 2 }} gap="lg">
              {metadata?.options?.emphases.map((emphasis) => (
                <Example
                  key={emphasis}
                  title={`${emphasis[0].toUpperCase()}${emphasis.slice(1)} emphasis`}
                >
                  <Support
                    indicatorTransition={indicatorTransition}
                    motion={motion}
                    emphasis={emphasis}
                    border={border}
                    shadow={shadow}
                    divider={divider}
                  />
                </Example>
              ))}
            </Layout>
            <Layout display="grid" columns={{ 'bp:all': 1, 'bp:lg:1': 2 }} gap="lg">
              <Example title="Matching header and panel emphasis">
                <Support
                  indicatorTransition={indicatorTransition}
                  motion={motion}
                  emphasis="medium"
                  panelEmphasis="medium"
                  border={border}
                  shadow={shadow}
                  divider
                />
              </Example>
              <Example title="Without an internal divider">
                <Support
                  indicatorTransition={indicatorTransition}
                  motion={motion}
                  emphasis="high"
                  panelEmphasis="low"
                  border={border}
                  shadow={shadow}
                  divider={false}
                />
              </Example>
            </Layout>
            <Example title="Controlled expansion">
              <Layout display="flex" direction="column" gap="md">
                <Layout display="flex" gap="sm" wrap>
                  <Button onClick={() => setExpanded(['details'])}>Open details</Button>
                  <Button onClick={() => setExpanded([])}>Close all</Button>
                </Layout>
                <Accordion
                  indicatorTransition={indicatorTransition}
                  panelEmphasis="low"
                  multiple={multiple}
                  expandedItems={expanded}
                  onExpandedItemsChange={setExpanded}
                  interactionLocked={locked}
                  motion={motion}
                >
                  <Layout display="flex" direction="column" gap="sm">
                    <Accordion.Item value="details">
                      <Accordion.Header>Project details</Accordion.Header>
                      <Accordion.Panel>
                        <PanelContent>
                          <label>
                            Project name <input aria-label="Project name" defaultValue="Kiskadee" />
                          </label>
                        </PanelContent>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="preferences">
                      <Accordion.Header>
                        Preferences with a longer title that wraps naturally on narrower screens
                      </Accordion.Header>
                      <Accordion.Panel>
                        <PanelContent>
                          Content stays in normal page flow and pushes the following items down.
                        </PanelContent>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item value="unavailable" disabled>
                      <Accordion.Header>Unavailable section</Accordion.Header>
                      <Accordion.Panel>
                        <PanelContent>
                          This section cannot be opened through interaction.
                        </PanelContent>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Layout>
                </Accordion>
                <Text as="p" profile={profiles.caption} role="status">
                  Open: {expanded.join(', ') || 'none'}
                </Text>
              </Layout>
            </Example>
            <Example title="Disabled while open">
              <Accordion
                panelEmphasis="low"
                disabled
                defaultExpandedItems={['retained']}
                motion={motion}
              >
                <Accordion.Item value="retained">
                  <Accordion.Header>Previously expanded content</Accordion.Header>
                  <Accordion.Panel>
                    <PanelContent>
                      Disabling the header preserves the expanded content.
                    </PanelContent>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Example>
            <Example title="Dynamic content and nested sections">
              <Accordion
                indicatorTransition={indicatorTransition}
                panelEmphasis="low"
                defaultExpandedItems={['content']}
                motion={motion}
              >
                <Accordion.Item value="content">
                  <Accordion.Header>Content that changes height</Accordion.Header>
                  <Accordion.Panel>
                    <PanelContent>
                      <Layout display="flex" direction="column" gap="md">
                        <Layout display="flex" gap="sm" wrap>
                          <Button
                            onClick={() =>
                              setParagraphs((value) => [...value, String(value.length + 1)])
                            }
                          >
                            Add paragraph
                          </Button>
                          <Button onClick={() => setParagraphs(['1'])}>Reset content</Button>
                        </Layout>
                        {paragraphs.map((id) => (
                          <p key={id}>
                            This paragraph changes the natural panel height. Closing and reopening
                            preserves the content.
                          </p>
                        ))}
                        <Accordion
                          indicatorTransition={indicatorTransition}
                          panelEmphasis="low"
                          motion={motion}
                        >
                          <Accordion.Item value="nested">
                            <Accordion.Header headingLevel={4}>
                              Independent nested section
                            </Accordion.Header>
                            <Accordion.Panel>
                              <PanelContent>
                                <label>
                                  Notes <input aria-label="Nested notes" />
                                </label>
                              </PanelContent>
                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                      </Layout>
                    </PanelContent>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Example>
            <Example title="Reusable visual helpers">
              <Layout display="flex" direction="column" gap="md">
                <Button onClick={() => setHelperAlternate((value) => !value)}>
                  Swap content and rotate
                </Button>
                <Layout display="flex" gap="lg" align="center">
                  <Crossfade
                    transitionKey={helperAlternate ? 'updated' : 'ready'}
                    durationMs={helperDuration}
                    easing={helperEasing}
                  >
                    {helperAlternate ? 'Updated' : 'Ready'}
                  </Crossfade>
                  <Rotate
                    angle={helperAlternate ? 180 : 45}
                    durationMs={helperDuration}
                    easing={helperEasing}
                    aria-hidden="true"
                  >
                    <Icon decorative>
                      <FamilyResolvedIcon name="chevron-down" />
                    </Icon>
                  </Rotate>
                </Layout>
              </Layout>
            </Example>
            <Example title="Immediate expansion">
              <Accordion
                indicatorTransition={indicatorTransition}
                panelEmphasis="low"
                motion={false}
              >
                <Accordion.Item value="instant">
                  <Accordion.Header>Open without animation</Accordion.Header>
                  <Accordion.Panel>
                    <PanelContent>
                      The same accessible behavior with immediate expansion.
                    </PanelContent>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Example>
          </Layout>
        )}
      </Layout>
    </main>
  );
}
