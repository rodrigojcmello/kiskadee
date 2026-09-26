'use client';

import { useKiskadee } from '@kiskadee/react-components/resources';
import { Separator, type SeparatorIntent } from '@kiskadee/react-components/separator';
import { Text } from '@kiskadee/react-components/text';
import { useState } from 'react';
import { ShowcaseGlobalSemanticControls } from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import {
  ShowcaseControlGroup,
  ShowcaseRouteControls,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import { useShowcaseBackground } from '@/hooks/use-showcase-background';
import { useShowcaseMetadata } from '@/hooks/use-showcase-metadata';
import { getManifestComponentState } from '@/utils/manifest-surface-context';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from './Separator.module.scss';

function Unavailable() {
  const textProfiles = useShowcaseTextProfiles();

  return (
    <div className={styles.unavailable}>
      <Text as="p" profile={textProfiles.body}>
        No Separator recipe is available for the active preset, theme and example surface.
      </Text>
    </div>
  );
}

export default function SeparatorShowcase() {
  const { manifest } = useShowcaseMetadata(['separator', 'text']);
  const { segment, theme } = useKiskadee();
  const background = useShowcaseBackground();
  const surfaceContext = background.cardSurface?.contentSurfaceContext ?? background.surfaceContext;
  const [requestedIntent, setRequestedIntent] = useState<SeparatorIntent>('neutral');
  const state = getManifestComponentState(
    manifest?.components?.separator,
    String(segment ?? 'default'),
    theme,
    surfaceContext
  );
  const textState = getManifestComponentState(
    manifest?.components?.text,
    String(segment ?? 'default'),
    theme,
    surfaceContext
  );
  const labelForeground = textState?.blue?.medium?.rest ? 'blue' : 'neutral';
  const emphasisOrder = ['lowest', 'low', 'medium', 'high', 'highest'] as const;
  const supportedIntents = (['neutral', 'primary'] as const).filter((intent) =>
    emphasisOrder.some((emphasis) => state?.[intent]?.[emphasis]?.rest)
  );
  const intent = supportedIntents.includes(requestedIntent) ? requestedIntent : supportedIntents[0];
  const supportedEmphases = emphasisOrder.filter(
    (value) => intent && state?.[intent]?.[value]?.rest
  );
  const layoutEmphasis = supportedEmphases.includes('medium') ? 'medium' : supportedEmphases[0];
  const textProfiles = useShowcaseTextProfiles();
  const available = Boolean(manifest?.components?.separator);

  return (
    <main className={styles.page}>
      <Text as="h2" profile={textProfiles.pageTitle}>
        Separator
      </Text>
      <Text as="p" profile={textProfiles.body} className={styles.lead}>
        A line separating content regions. Intent selects its color family; emphasis controls its
        strength. Spacing and placement belong to the surrounding layout.
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
          {supportedIntents.length ? (
            <ShowcaseSelectControl
              label="Intent"
              variant="sequential"
              loop
              value={intent}
              options={supportedIntents.map((value) => ({
                value,
                label: value === 'neutral' ? 'Neutral' : 'Primary'
              }))}
              onValueChange={(value) => setRequestedIntent(value as SeparatorIntent)}
            />
          ) : null}
        </ShowcaseControlGroup>
      </ShowcaseRouteControls>

      {!available || !intent || !supportedEmphases.length ? (
        <Unavailable />
      ) : (
        <div className={styles.sections}>
          <section className={styles.section} aria-labelledby="separator-orientation-title">
            <Text as="h3" id="separator-orientation-title" profile={textProfiles.sectionTitle}>
              Emphasis and orientation
            </Text>
            <Text as="p" profile={textProfiles.body} className={styles.description}>
              Compare every available emphasis on the same surface, horizontally and vertically.
              Available levels depend on the preset, theme, intent and the surface inside each Card.
              The current intent is {intent === 'neutral' ? 'Neutral' : 'Primary'}.
            </Text>
            <div className={styles.grid}>
              <ShowcaseExampleCard role="article" className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Horizontal
                </Text>
                {supportedEmphases.map((emphasis) => (
                  <div key={emphasis} className={styles.emphasisExample}>
                    <Text
                      as="p"
                      profile={textProfiles.bodyStrong}
                      foreground={labelForeground}
                      className={styles.emphasisLabel}
                    >
                      {emphasis}
                    </Text>
                    <div className={styles.horizontalStage}>
                      <Text as="span" profile={textProfiles.caption} emphasis="low">
                        Above
                      </Text>
                      <Separator intent={intent} emphasis={emphasis} />
                      <Text as="span" profile={textProfiles.caption} emphasis="low">
                        Below
                      </Text>
                    </div>
                  </div>
                ))}
              </ShowcaseExampleCard>

              <ShowcaseExampleCard role="article" className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Vertical
                </Text>
                {supportedEmphases.map((emphasis) => (
                  <div key={emphasis} className={styles.emphasisExample}>
                    <Text
                      as="p"
                      profile={textProfiles.bodyStrong}
                      foreground={labelForeground}
                      className={styles.emphasisLabel}
                    >
                      {emphasis}
                    </Text>
                    <div className={styles.verticalStage}>
                      <Text as="span" profile={textProfiles.caption} emphasis="low">
                        Before
                      </Text>
                      <Separator intent={intent} orientation="vertical" emphasis={emphasis} />
                      <Text as="span" profile={textProfiles.caption} emphasis="low">
                        After
                      </Text>
                    </div>
                  </div>
                ))}
              </ShowcaseExampleCard>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="separator-context-title">
            <Text as="h3" id="separator-context-title" profile={textProfiles.sectionTitle}>
              Inherited surface
            </Text>
            <Text as="p" profile={textProfiles.body} className={styles.description}>
              Each Separator inherits the surface created by its nearest Card or Container. These
              examples use {surfaceContext === 'onVivid' ? 'On vivid' : 'On subtle'}. Neutral can
              use dark or light paint depending on the preset and context; Primary uses the preset's
              primary color family. Changing intent does not change the background.
            </Text>
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
              <Separator intent={intent} emphasis={layoutEmphasis} />
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
