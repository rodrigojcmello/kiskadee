'use client';

import type { ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import { Badge, FamilyResolvedIcon, Button as KButton, Text } from '@kiskadee/react-components';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';

export function ButtonBadgeExamples({
  scale,
  surfaceContext
}: {
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const profiles = useShowcaseTextProfiles();

  return (
    <section className={styles.buttonMenuSection}>
      <Text as="h3" profile={profiles.sectionTitle}>
        Passive Badge overlays
      </Text>
      <Text as="p" profile={profiles.body} className={styles.showcaseSectionDescription}>
        Dot, count and icon metadata use logical corners and remain in Rest across Button states.
      </Text>
      <div className={styles.buttonMenuGrid}>
        <article>
          <Text as="h4" profile={profiles.subsectionTitle}>
            Four logical positions
          </Text>
          <div className={styles.buttonBadgeStage}>
            {(
              [
                'block-start-inline-start',
                'block-start-inline-end',
                'block-end-inline-start',
                'block-end-inline-end'
              ] as const
            ).map((placement) => (
              <KButton key={placement} scale={scale} surfaceContext={surfaceContext}>
                <KButton.Label>Inbox</KButton.Label>
                <KButton.Badge placement={placement}>
                  <Badge.Dot intent="destructive" aria-label={placement} />
                </KButton.Badge>
              </KButton>
            ))}
          </div>
        </article>

        <article>
          <Text as="h4" profile={profiles.subsectionTitle}>
            Count and icon
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
                <Badge intent="destructive" emphasis="high">
                  12
                </Badge>
              </KButton.Badge>
            </KButton>
            <KButton intent="primary" emphasis="high" scale={scale} surfaceContext={surfaceContext}>
              <KButton.Label>Camera</KButton.Label>
              <KButton.Badge>
                <Badge intent="positive" emphasis="medium" aria-label="Verified camera">
                  <Badge.Icon>
                    <FamilyResolvedIcon name="settings" />
                  </Badge.Icon>
                </Badge>
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
                <Badge intent="primary" emphasis="high">
                  New
                </Badge>
              </KButton.Badge>
            </KButton>
          </div>
          <Text as="p" profile={profiles.caption} className={styles.buttonMenuStatus}>
            The Badge stays visible because its metadata is not disabled.
          </Text>
        </article>
      </div>
    </section>
  );
}
