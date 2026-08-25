'use client';

import type {
  BadgeEmphasis,
  BadgeIntent,
  BadgeScale,
  BadgeSeparation,
  RadiusMode
} from '@kiskadee/core';
import {
  Badge,
  Button,
  FamilyResolvedIcon,
  SurfaceContextProvider,
  Text,
  useShowcase
} from '@kiskadee/react-components';
import { type ReactNode, useState } from 'react';
import {
  ShowcaseBooleanControl,
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
  'novelty',
  'positive',
  'warning',
  'attention'
];
const emphases: BadgeEmphasis[] = ['high', 'medium', 'low', 'lowest'];
const scales: BadgeScale[] = ['s:sm:3', 's:sm:2', 's:sm:1', 's:md:1', 's:lg:1', 's:lg:2'];
const radii = ['square', 'rounded', 'pill'] as const;

const fullBleedMarkFixtures = Array.from(
  { length: 8 },
  (_, index) => `/fixtures/badge/fluent-full-bleed-marks/${String(index + 1).padStart(2, '0')}.svg`
);

function FullBleedArtwork({ index = 0 }: { index?: number }) {
  return <img alt="" src={fullBleedMarkFixtures[index]} />;
}

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

function ScaleRow({ title, render }: { title: string; render: (scale: BadgeScale) => ReactNode }) {
  const profiles = useShowcaseTextProfiles();
  return (
    <div className={styles.matrixRow}>
      <Text as="strong" profile={profiles.caption}>
        {title}
      </Text>
      <div className={styles.stage}>{scales.map(render)}</div>
    </div>
  );
}

export default function BadgeShowcase() {
  const { manifest } = useShowcase();
  const profiles = useShowcaseTextProfiles();
  const available = Boolean(manifest?.components?.badge);
  const [intent, setIntent] = useState<BadgeIntent>('attention');
  const [emphasis, setEmphasis] = useState<BadgeEmphasis>('medium');
  const [scale, setScale] = useState<BadgeScale>('s:md:1');
  const [radius, setRadius] = useState<Extract<RadiusMode, 'square' | 'rounded' | 'pill'>>('pill');
  const [separation, setSeparation] = useState<BadgeSeparation>('none');
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
            options={radii.map((value) => ({ value, label: value }))}
            value={radius}
            onValueChange={(value) => setRadius(value as typeof radius)}
          />
          <ShowcaseBooleanControl
            label="Separation ring"
            checked={separation === 'ring'}
            onCheckedChange={(checked) => setSeparation(checked ? 'ring' : 'none')}
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
        Passive dot, text, number, or icon-only metadata. Badge remains Rest-only wherever it is
        composed.
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
              Runtime text or number
            </Text>
            <div className={styles.stage}>
              <Badge
                intent={intent}
                emphasis={emphasis}
                scale={scale}
                radius={radius}
                separation={separation}
              >
                {count}
              </Badge>
              <Button type="button" onClick={() => setCount((value) => value + 1)}>
                <Button.Label>Increase count</Button.Label>
              </Button>
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Contained and full-bleed ownership
            </Text>
            <Text as="p" profile={profiles.body} className={styles.note}>
              Contained Marks combine a family-resolved glyph with a Badge-owned surface.
              Full-bleed Marks are complete consumer-owned artworks; these eight exact Fluent
              vectors are private Showcase fixtures and do not follow the icon-family selector.
            </Text>
            <div className={styles.ownershipGrid}>
              <article className={styles.ownershipCard}>
                <Text as="strong" profile={profiles.caption}>
                  Contained Marks
                </Text>
                <div className={styles.stage}>
                  {(['check', 'bell', 'rocket'] as const).map((name) => (
                    <Badge.Mark
                      key={name}
                      intent={name === 'check' ? 'positive' : 'novelty'}
                      scale="s:lg:1"
                      aria-label={`${name} contained Mark`}
                    >
                      <FamilyResolvedIcon name={name} />
                    </Badge.Mark>
                  ))}
                </div>
              </article>
              <article className={styles.ownershipCard}>
                <Text as="strong" profile={profiles.caption}>
                  Fluent full-bleed artworks
                </Text>
                <div className={styles.fixtureGrid}>
                  {fullBleedMarkFixtures.map((fixture, index) => (
                    <Badge.Mark
                      key={fixture}
                      presentation="full-bleed"
                      intent="attention"
                      scale="s:lg:1"
                      aria-label={`Fluent source artwork ${index + 1}`}
                    >
                      <FullBleedArtwork index={index} />
                    </Badge.Mark>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Four anatomies
            </Text>
            <div className={styles.grid}>
              <article className={styles.card}>
                <Badge.Dot intent="attention" scale="s:md:1" separation="ring" aria-label="New" />
                <span>Dot</span>
              </article>
              <article className={styles.card}>
                <Badge intent="novelty">New</Badge>
                <span>Text or number</span>
              </article>
              <article className={styles.card}>
                <Badge.Mark intent="positive" separation="ring" aria-label="Verified">
                  <FamilyResolvedIcon name="check" />
                </Badge.Mark>
                <span>Contained Mark</span>
              </article>
              <article className={styles.card}>
                <Badge.Mark
                  presentation="full-bleed"
                  intent="positive"
                  separation="ring"
                  aria-label="Verified"
                >
                  <FullBleedArtwork />
                </Badge.Mark>
                <span>Full-bleed Mark</span>
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
              Six scales for every indicator anatomy
            </Text>
            <div className={styles.matrix}>
              <ScaleRow
                title="Dot"
                render={(itemScale) => (
                  <Badge.Dot
                    key={itemScale}
                    scale={itemScale}
                    intent="attention"
                    aria-label={`Dot ${itemScale}`}
                  />
                )}
              />
              <ScaleRow
                title="Contained Mark"
                render={(itemScale) => (
                  <Badge.Mark
                    key={itemScale}
                    scale={itemScale}
                    intent="positive"
                    aria-label="Verified"
                  >
                    <FamilyResolvedIcon name="check" />
                  </Badge.Mark>
                )}
              />
              <ScaleRow
                title="Full-bleed Mark"
                render={(itemScale) => (
                  <Badge.Mark
                    key={itemScale}
                    presentation="full-bleed"
                    scale={itemScale}
                    intent="positive"
                    aria-label="Verified"
                  >
                    <FullBleedArtwork />
                  </Badge.Mark>
                )}
              />
              <ScaleRow
                title="Text or number"
                render={(itemScale) => (
                  <Badge key={itemScale} scale={itemScale} intent="novelty">
                    12
                  </Badge>
                )}
              />
            </div>
          </section>

          <section className={styles.section}>
            <Text as="h3" profile={profiles.sectionTitle}>
              Three text radii and optional separation
            </Text>
            <div className={styles.stage}>
              {radii.map((itemRadius) => (
                <Badge key={itemRadius} intent="primary" radius={itemRadius}>
                  {itemRadius}
                </Badge>
              ))}
              <Badge.Dot intent="attention" scale="s:lg:1" aria-label="Without ring" />
              <Badge.Dot
                intent="attention"
                scale="s:lg:1"
                separation="ring"
                aria-label="With ring"
              />
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
                  <Badge intent="primary" emphasis="low">
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
              <Button aria-label="Settings">
                <Button.Icon>
                  <FamilyResolvedIcon name="settings" />
                </Button.Icon>
                <Button.Badge>
                  <Badge.Dot intent="attention" separation="ring" aria-label="New" />
                </Button.Badge>
              </Button>
              <Button disabled>
                <Button.Label>Disabled</Button.Label>
                <Button.Badge>
                  <Badge intent="attention" emphasis="high">
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
