'use client';

import type { ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import {
  Badge,
  type ButtonBadgePlacement,
  FamilyResolvedIcon,
  Button as KButton,
  Text
} from '@kiskadee/react-components';
import { useState } from 'react';
import { ShowcaseSelectControl } from '@/components/ShowcaseControls';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';

const placements: ButtonBadgePlacement[] = [
  'inline-start',
  'inline-end',
  'block-start-inline-start',
  'block-start-inline-end',
  'block-end-inline-start',
  'block-end-inline-end'
];

function FullBleedBadgeArtwork() {
  return <img alt="" src="/fixtures/badge/fluent-full-bleed-marks/01.svg" />;
}

export function ButtonBadgeExamples({
  scale,
  surfaceContext
}: {
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const profiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const [placement, setPlacement] = useState<ButtonBadgePlacement>('block-start-inline-end');

  return (
    <section className={styles.buttonMenuSection}>
      <Text as="h3" profile={profiles.sectionTitle}>
        Passive Badge composition
      </Text>
      {showDescriptions ? (
        <Text as="p" profile={profiles.body} className={styles.showcaseSectionDescription}>
          Inline metadata stays adjacent to the label; external metadata uses logical corners. Both
          remain in Rest across Button states.
        </Text>
      ) : null}
      <div className={styles.buttonMenuGrid}>
        <article>
          <Text as="h4" profile={profiles.subsectionTitle}>
            Runtime logical placement
          </Text>
          <ShowcaseSelectControl
            label="Badge placement"
            options={placements.map((value) => ({ value, label: value }))}
            value={placement}
            onValueChange={(value) => setPlacement(value as ButtonBadgePlacement)}
          />
          <div className={styles.buttonBadgeStage}>
            <KButton scale={scale} surfaceContext={surfaceContext}>
              <KButton.Label>Inbox</KButton.Label>
              <KButton.Badge placement={placement}>
                {placement.startsWith('inline') ? (
                  <Badge intent="neutral">12</Badge>
                ) : (
                  <Badge.Dot intent="attention" separation="ring" aria-label={placement} />
                )}
              </KButton.Badge>
            </KButton>
            <div dir="rtl">
              <KButton scale={scale} surfaceContext={surfaceContext}>
                <KButton.Label>RTL inbox</KButton.Label>
                <KButton.Badge placement={placement}>
                  {placement.startsWith('inline') ? (
                    <Badge intent="neutral">12</Badge>
                  ) : (
                    <Badge.Dot intent="attention" separation="ring" aria-label={placement} />
                  )}
                </KButton.Badge>
              </KButton>
            </div>
          </div>
        </article>

        <article>
          <Text as="h4" profile={profiles.subsectionTitle}>
            Inline number and novelty
          </Text>
          <div className={styles.buttonBadgeStage}>
            <KButton scale={scale} surfaceContext={surfaceContext}>
              <KButton.Label>Pull requests</KButton.Label>
              <KButton.Badge placement="inline-end">
                <Badge intent="neutral">12</Badge>
              </KButton.Badge>
            </KButton>
            <KButton scale={scale} surfaceContext={surfaceContext}>
              <KButton.Label>Copilot</KButton.Label>
              <KButton.Badge placement="inline-end">
                <Badge intent="novelty">New</Badge>
              </KButton.Badge>
            </KButton>
          </div>
        </article>

        <article>
          <Text as="h4" profile={profiles.subsectionTitle}>
            Number and Mark on labeled or icon-only Buttons
          </Text>
          <div className={styles.buttonBadgeStage}>
            <KButton
              intent="neutral"
              emphasis="medium"
              scale={scale}
              surfaceContext={surfaceContext}
            >
              <KButton.Label>Messages</KButton.Label>
              <KButton.Badge>
                <Badge intent="attention" emphasis="high" separation="ring">
                  12
                </Badge>
              </KButton.Badge>
            </KButton>
            <KButton
              aria-label="Camera"
              intent="primary"
              emphasis="high"
              scale={scale}
              surfaceContext={surfaceContext}
            >
              <KButton.Icon>
                <FamilyResolvedIcon name="settings" />
              </KButton.Icon>
              <KButton.Badge>
                <Badge.Mark intent="positive" separation="ring" aria-label="Verified camera">
                  <FamilyResolvedIcon name="check" />
                </Badge.Mark>
              </KButton.Badge>
            </KButton>
            <KButton intent="neutral" scale={scale} surfaceContext={surfaceContext}>
              <KButton.Label>Profile</KButton.Label>
              <KButton.Badge>
                <Badge.Mark
                  presentation="full-bleed"
                  intent="positive"
                  separation="ring"
                  aria-label="Available"
                >
                  <FullBleedBadgeArtwork />
                </Badge.Mark>
              </KButton.Badge>
            </KButton>
          </div>
        </article>

        <article>
          <Text as="h4" profile={profiles.subsectionTitle}>
            Disabled host
          </Text>
          <div className={styles.buttonBadgeStage}>
            <KButton disabled scale={scale} surfaceContext={surfaceContext}>
              <KButton.Label>Notifications</KButton.Label>
              <KButton.Badge>
                <Badge intent="novelty" emphasis="high">
                  New
                </Badge>
              </KButton.Badge>
            </KButton>
          </div>
          <Text as="p" profile={profiles.caption} className={styles.buttonMenuStatus}>
            The Badge stays visible because its metadata is not disabled.
          </Text>
        </article>

        <article dir="rtl">
          <Text as="h4" profile={profiles.subsectionTitle}>
            RTL logical placement
          </Text>
          <div className={styles.buttonBadgeStage}>
            <KButton scale={scale} surfaceContext={surfaceContext}>
              <KButton.Label>RTL inbox</KButton.Label>
              <KButton.Badge placement="block-start-inline-end">
                <Badge.Dot intent="attention" separation="ring" aria-label="New" />
              </KButton.Badge>
            </KButton>
          </div>
        </article>
      </div>
    </section>
  );
}
