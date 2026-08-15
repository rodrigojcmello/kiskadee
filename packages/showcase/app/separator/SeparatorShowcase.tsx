'use client';

import { Separator, Text, useShowcase } from '@kiskadee/react-components';
import { ShowcaseRouteControls } from '@/components/ShowcaseControls';
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
      >
        {null}
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
              <article className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Horizontal
                </Text>
                <div className={styles.horizontalStage}>
                  <Separator />
                </div>
              </article>

              <article className={styles.card}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Vertical
                </Text>
                <div className={styles.verticalStage}>
                  <Text as="span" profile={textProfiles.body}>
                    Previous
                  </Text>
                  <Separator orientation="vertical" />
                  <Text as="span" profile={textProfiles.body}>
                    Next
                  </Text>
                </div>
              </article>
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
            <article className={`${styles.card} ${styles.contentCard}`}>
              <div className={styles.contentBlock}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Account
                </Text>
                <Text as="p" profile={textProfiles.body}>
                  Profile, sign-in and security preferences.
                </Text>
              </div>
              <Separator />
              <div className={styles.contentBlock}>
                <Text as="h4" profile={textProfiles.subsectionTitle}>
                  Notifications
                </Text>
                <Text as="p" profile={textProfiles.body}>
                  Product updates and workspace activity.
                </Text>
              </div>
            </article>
          </section>
        </div>
      )}
    </main>
  );
}
