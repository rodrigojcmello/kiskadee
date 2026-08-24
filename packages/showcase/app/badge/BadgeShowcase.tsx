'use client';

import type { BadgeEmphasis, BadgeIntent, BadgeScale, RadiusMode } from '@kiskadee/core';
import {
  Badge,
  Button,
  FamilyResolvedIcon,
  SurfaceContextProvider,
  Text,
  useShowcase
} from '@kiskadee/react-components';
import { useState } from 'react';
import {
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './Badge.module.scss';

const intents: BadgeIntent[] = [
  'neutral',
  'primary',
  'informative',
  'positive',
  'warning',
  'severe',
  'destructive',
  'important'
];
const emphases: BadgeEmphasis[] = ['high', 'medium', 'low', 'lowest'];
const scales: BadgeScale[] = ['s:sm:3', 's:sm:2', 's:sm:1', 's:md:1', 's:lg:1', 's:lg:2'];

function Unavailable() {
  const profiles = useShowcaseTextProfiles();
  return (
    <div className={styles.unavailable}>
      <Text as="p" profile={profiles.body}>
        Badge is not available in the active design system.
      </Text>
    </div>
  );
}

export default function BadgeShowcase() {
  const { manifest } = useShowcase();
  const profiles = useShowcaseTextProfiles();
  const available = Boolean(manifest?.components?.badge);
  const [intent, setIntent] = useState<BadgeIntent>('positive');
  const [emphasis, setEmphasis] = useState<BadgeEmphasis>('medium');
  const [scale, setScale] = useState<BadgeScale>('s:md:1');
  const [radius, setRadius] = useState<Extract<RadiusMode, 'rounded' | 'pill'>>('pill');
  const [count, setCount] = useState(3);

  const controls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Presentation">
        <ShowcaseControlStack>
          <ShowcaseSelectControl
            label="Intent"
            options={intents.map((value) => ({ value, label: value }))}
            value={intent}
            onValueChange={(value) => setIntent(value as BadgeIntent)}
          />
          <ShowcaseSelectControl
            label="Emphasis"
            options={emphases.map((value) => ({ value, label: value }))}
            value={emphasis}
            onValueChange={(value) => setEmphasis(value as BadgeEmphasis)}
          />
          <ShowcaseSelectControl
            label="Scale"
            options={scales.map((value) => ({ value, label: value }))}
            value={scale}
            onValueChange={(value) => setScale(value as BadgeScale)}
          />
          <ShowcaseSelectControl
            label="Radius"
            options={[
              { value: 'rounded', label: 'rounded' },
              { value: 'pill', label: 'pill' }
            ]}
            value={radius}
            onValueChange={(value) => setRadius(value as typeof radius)}
          />
        </ShowcaseControlStack>
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  return (
    <main className={styles.page}>
      <Text as="h2" profile={profiles.pageTitle}>
        Badge
      </Text>
      <Text as="p" profile={profiles.body} className={styles.lead}>
        Passive metadata for status, novelty, icons and counts. Badge remains Rest-only wherever it
        is composed.
      </Text>
      <ShowcaseRouteControls id="badge" eyebrow="Badge" title="Controls" isAvailable={available}>
        {controls}
      </ShowcaseRouteControls>

      {!available ? (
        <Unavailable />
      ) : (
        <div className={styles.sections}>
          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Runtime composition
            </Text>
            <div className={styles.stage}>
              <Badge intent={intent} emphasis={emphasis} scale={scale} radius={radius}>
                <Badge.Icon>
                  <FamilyResolvedIcon name="settings" />
                </Badge.Icon>
                <Badge.Label>Verified</Badge.Label>
                <Badge.Count>{count}</Badge.Count>
              </Badge>
              <Button type="button" onClick={() => setCount((value) => value + 1)}>
                <Button.Label>Increase count</Button.Label>
              </Button>
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Content anatomy
            </Text>
            <div className={styles.grid}>
              <article className={styles.card}>
                <Badge.Dot intent="destructive" aria-label="New notification" />
                <span>Dot</span>
              </article>
              <article className={styles.card}>
                <Badge intent="primary">
                  <Badge.Icon>
                    <FamilyResolvedIcon name="settings" />
                  </Badge.Icon>
                </Badge>
                <span>Icon</span>
              </article>
              <article className={styles.card}>
                <Badge intent="important">12</Badge>
                <span>Number</span>
              </article>
              <article className={styles.card}>
                <Badge intent="informative">New</Badge>
                <span>Label</span>
              </article>
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Intent and emphasis
            </Text>
            <div className={styles.matrix}>
              {emphases.map((level) => (
                <div className={styles.matrixRow} key={level}>
                  <Text as="strong" profile={profiles.caption}>
                    {level}
                  </Text>
                  <div className={styles.stage}>
                    {intents.map((itemIntent) => (
                      <Badge key={itemIntent} intent={itemIntent} emphasis={level}>
                        {itemIntent}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Six Fluent scales
            </Text>
            <div className={styles.stage}>
              <Badge.Dot scale="s:sm:3" intent="positive" aria-label="Tiny" />
              <Badge scale="s:sm:2" intent="primary">
                1
              </Badge>
              <Badge scale="s:sm:1" intent="informative">
                S
              </Badge>
              <Badge scale="s:md:1" intent="positive">
                Medium
              </Badge>
              <Badge scale="s:lg:1" intent="warning">
                Large
              </Badge>
              <Badge scale="s:lg:2" intent="destructive">
                Extra large
              </Badge>
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Surface Context
            </Text>
            <div className={styles.surfaceGrid}>
              <SurfaceContextProvider value="onSubtle">
                <article className={styles.subtleSurface}>
                  <Badge intent="primary" emphasis="high">
                    onSubtle
                  </Badge>
                </article>
              </SurfaceContextProvider>
              <SurfaceContextProvider value="onVivid">
                <article className={styles.vividSurface}>
                  <Badge intent="primary" emphasis="medium">
                    onVivid
                  </Badge>
                </article>
              </SurfaceContextProvider>
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Host state independence
            </Text>
            <div className={styles.stage}>
              <Button>
                <Button.Label>Enabled</Button.Label>
                <Button.Badge>
                  <Badge.Dot intent="destructive" aria-label="New" />
                </Button.Badge>
              </Button>
              <Button disabled>
                <Button.Label>Disabled</Button.Label>
                <Button.Badge>
                  <Badge intent="destructive" emphasis="high">
                    3
                  </Badge>
                </Button.Badge>
              </Button>
            </div>
            <Text as="p" profile={profiles.caption} className={styles.note}>
              The disabled host remains muted while its passive metadata stays visible and in Rest.
            </Text>
          </section>
        </div>
      )}
    </main>
  );
}
