'use client';

import type { ElementSizeValue, SurfaceContext } from '@kiskadee/core';
import { Button, FamilyResolvedIcon, Text } from '@kiskadee/react-components';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';

export function ButtonGroupExamples({
  scale,
  shadowAvailable,
  surfaceContext
}: {
  scale: ElementSizeValue;
  shadowAvailable: boolean;
  surfaceContext: SurfaceContext;
}) {
  const textProfiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();

  return (
    <section className={styles.buttonGroupSection} aria-labelledby="button-group-title">
      <Text as="h3" id="button-group-title" profile={textProfiles.sectionTitle}>
        Button group
      </Text>
      {showDescriptions ? (
        <Text as="p" profile={textProfiles.body} className={styles.showcaseSectionDescription}>
          Connected buttons inherit one visual contract from the group. The group may also own one
          static shadow instead of combining shadows from its individual buttons.
        </Text>
      ) : null}
      <div className={styles.buttonGroupGrid}>
        <article>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            Connected actions
          </Text>
          <Button.Group
            emphasis="medium"
            intent="neutral"
            scale={scale}
            surfaceContext={surfaceContext}
          >
            <Button>
              <Button.Label>Previous</Button.Label>
            </Button>
            <Button>
              <Button.Label>Today</Button.Label>
            </Button>
            <Button>
              <Button.Label>Next</Button.Label>
            </Button>
          </Button.Group>
        </article>

        <article>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            Low emphasis / outlined
          </Text>
          <Button.Group
            emphasis="low"
            intent="neutral"
            scale={scale}
            surfaceContext={surfaceContext}
          >
            <Button>
              <Button.Label>Day</Button.Label>
            </Button>
            <Button>
              <Button.Label>Week</Button.Label>
            </Button>
            <Button>
              <Button.Label>Month</Button.Label>
            </Button>
          </Button.Group>
        </article>

        <article>
          <Text as="h4" profile={textProfiles.subsectionTitle}>
            Group shadow
          </Text>
          {shadowAvailable ? (
            <Button.Group
              emphasis="high"
              intent="primary"
              scale={scale}
              shadow
              surfaceContext={surfaceContext}
            >
              <Button>
                <Button.Icon>
                  <FamilyResolvedIcon name="share" />
                </Button.Icon>
                <Button.Label>Share</Button.Label>
              </Button>
              <Button aria-label="More sharing options">
                <Button.Disclosure />
              </Button>
            </Button.Group>
          ) : (
            <Text as="p" profile={textProfiles.caption}>
              The active preset does not publish a Button Rest shadow.
            </Text>
          )}
        </article>
      </div>
    </section>
  );
}
