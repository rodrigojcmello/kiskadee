'use client';

import { useKiskadee } from '@kiskadee/react-components/resources';
import { Separator } from '@kiskadee/react-components/separator';
import { Text } from '@kiskadee/react-components/text';
import { ShowcaseGlobalSemanticControls } from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { ShowcaseControlGroup, ShowcaseRouteControls } from '@/components/ShowcaseControls';
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
        Separator is not available in the active design system.
      </Text>
    </div>
  );
}

export default function SeparatorShowcase() {
  const { manifest } = useShowcaseMetadata(['separator']);
  const { segment, theme } = useKiskadee();
  const { surfaceContext } = useShowcaseBackground();
  const state = getManifestComponentState(
    manifest?.components?.separator,
    String(segment ?? 'default'),
    theme,
    surfaceContext
  );
  const supportedEmphases = (['lowest', 'low', 'medium', 'high', 'highest'] as const).filter(
    (value) => state?.neutral?.[value]?.rest
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
      </ShowcaseRouteControls>

      {!available ? (
        <Unavailable />
      ) : (
        <div className={styles.sections}>
          <section className={styles.section} aria-labelledby="separator-orientation-title">
            <Text as="h3" id="separator-orientation-title" profile={textProfiles.sectionTitle}>
              Emphasis and orientation
            </Text>
            <Text as="p" profile={textProfiles.body} className={styles.description}>
              Compare every available emphasis on the same surface, horizontally and vertically.
              Available levels depend on the design system, theme, and surface context.
            </Text>
            <div className={styles.grid}>
              <ShowcaseExampleCard role="article" className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Horizontal
                </Text>
                {supportedEmphases.map((emphasis) => (
                  <div key={emphasis} className={styles.emphasisExample}>
                    <Text as="p" profile={textProfiles.caption} className={styles.emphasisLabel}>
                      {emphasis}
                    </Text>
                    <div className={styles.horizontalStage}>
                      <Separator emphasis={emphasis} />
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
                    <Text as="p" profile={textProfiles.caption} className={styles.emphasisLabel}>
                      {emphasis}
                    </Text>
                    <div className={styles.verticalStage}>
                      <Text as="span" profile={textProfiles.body}>
                        Previous
                      </Text>
                      <Separator orientation="vertical" emphasis={emphasis} />
                      <Text as="span" profile={textProfiles.body}>
                        Next
                      </Text>
                    </div>
                  </div>
                ))}
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
              <Separator emphasis={layoutEmphasis} />
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
