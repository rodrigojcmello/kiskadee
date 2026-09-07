'use client';

import type { ComponentEmphasis } from '@kiskadee/core';
import { Separator, Text, useKiskadee, useShowcase } from '@kiskadee/react-components';
import { useState } from 'react';
import { ShowcaseGlobalSemanticControls } from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import {
  ShowcaseControlGroup,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { getManifestComponentState } from '@/utils/manifest-surface-context';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './Separator.module.scss';

function Unavailable() {
  const textProfiles = useShowcaseTextProfiles();

  return (
    <div className={styles.unavailable}>
      <Text as="p" profile={textProfiles.body}>
        Separator is not available in the active design system.
      </Text>
    </div>
  );
}

export default function SeparatorShowcase() {
  const { manifest } = useShowcase();
  const { segment, theme } = useKiskadee();
  const { surfaceContext } = useShowcaseBackground();
  const [emphasis, setEmphasis] = useState<ComponentEmphasis>('medium');
  const state = getManifestComponentState(
    manifest?.components?.separator,
    String(segment ?? 'default'),
    theme,
    surfaceContext
  );
  const supportedEmphases = (['lowest', 'low', 'medium', 'high', 'highest'] as const).filter(
    (value) => state?.neutral?.[value]?.rest
  );
  const activeEmphasis = supportedEmphases.includes(emphasis)
    ? emphasis
    : (supportedEmphases[0] ?? 'medium');
  const textProfiles = useShowcaseTextProfiles();
  const available = Boolean(manifest?.components?.separator);

  return (
    <main className={styles.page}>
      <Text as="h2" profile={textProfiles.pageTitle}>
        Separator
      </Text>
      <Text as="p" profile={textProfiles.body} className={styles.lead}>
        A neutral line whose spacing and placement remain the responsibility of its layout.
      </Text>
      <ShowcaseRouteControls
        id="separator"
        eyebrow="Separator"
        title="Examples"
        isAvailable={available}
        showGlobalControls={false}
      >
        <ShowcaseControlGroup title="Semantic">
          <ShowcaseGlobalSemanticControls />
        </ShowcaseControlGroup>
        <ShowcaseControlGroup title="Appearance">
          <ShowcaseSelectControl
            label="Emphasis"
            variant="sequential"
            loop
            options={supportedEmphases.map((value) => ({ value, label: value }))}
            value={activeEmphasis}
            onValueChange={(value) => setEmphasis(value as ComponentEmphasis)}
          />
        </ShowcaseControlGroup>
      </ShowcaseRouteControls>

      {!available ? (
        <Unavailable />
      ) : (
        <div className={styles.sections}>
          <section className={styles.section} aria-labelledby="separator-orientation-title">
            <Text as="h3" id="separator-orientation-title" profile={textProfiles.sectionTitle}>
              Orientation
            </Text>
            <div className={styles.grid}>
              <ShowcaseExampleCard role="article" className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Horizontal
                </Text>
                <div className={styles.horizontalStage}>
                  <Separator emphasis={activeEmphasis} />
                </div>
              </ShowcaseExampleCard>

              <ShowcaseExampleCard role="article" className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Vertical
                </Text>
                <div className={styles.verticalStage}>
                  <Text as="span" profile={textProfiles.body}>
                    Previous
                  </Text>
                  <Separator orientation="vertical" emphasis={activeEmphasis} />
                  <Text as="span" profile={textProfiles.body}>
                    Next
                  </Text>
                </div>
              </ShowcaseExampleCard>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="separator-layout-title">
            <Text as="h3" id="separator-layout-title" profile={textProfiles.sectionTitle}>
              Layout ownership
            </Text>
            <Text as="p" profile={textProfiles.body} className={styles.description}>
              The surrounding layout creates the distance around the line; Separator itself has no
              margin or padding.
            </Text>
            <ShowcaseExampleCard role="article" className={`${styles.card} ${styles.contentCard}`}>
              <div className={styles.contentBlock}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Account
                </Text>
                <Text as="p" profile={textProfiles.body}>
                  Profile, sign-in and security preferences.
                </Text>
              </div>
              <Separator emphasis={activeEmphasis} />
              <div className={styles.contentBlock}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Notifications
                </Text>
                <Text as="p" profile={textProfiles.body}>
                  Product updates and workspace activity.
                </Text>
              </div>
            </ShowcaseExampleCard>
          </section>
        </div>
      )}
    </main>
  );
}
