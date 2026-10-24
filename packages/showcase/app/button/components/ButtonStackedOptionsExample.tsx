'use client';

import {
  componentScaleToSize,
  type ElementSizeValue,
  type RadiusMode,
  type SurfaceContext
} from '@kiskadee/core';
import { Button, type ButtonArtifactConfig } from '@kiskadee/react-components/button';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import { SmoothText } from '@kiskadee/react-components/smooth-text';
import { Text } from '@kiskadee/react-components/text';
import { useState } from 'react';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';
import { ButtonUnavailableExample } from './ButtonUnavailableExample';
import { supportsStackedButtonSize } from './buttonStackedAvailability';

const MEETING_OPTIONS = [
  { label: 'Record', icon: 'record' },
  { label: 'Chat', icon: 'chat' },
  { label: 'People', icon: 'users' },
  { label: 'Raise', icon: 'hand' },
  { label: 'React', icon: 'smile' },
  { label: 'View', icon: 'grid' },
  { label: 'More', icon: 'ellipsis' },
  { label: 'Camera', icon: 'video' },
  { label: 'Mic', icon: 'mic' },
  { label: 'Share', icon: 'screen-share' },
  { label: 'Leave', icon: 'phone-hangup' }
] as const;

export function ButtonStackedOptionsExample({
  classesMap,
  fontName,
  radius,
  scale = 's:md:1',
  stackedSizes,
  surfaceContext
}: {
  classesMap: ButtonArtifactConfig['buttonClassesMap'];
  fontName: string;
  radius: RadiusMode;
  scale?: ElementSizeValue;
  stackedSizes: readonly string[] | undefined;
  surfaceContext: SurfaceContext;
}) {
  const profiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const available = supportsStackedButtonSize(classesMap, scale, stackedSizes, radius);

  return (
    <section
      className={styles.stackedOptionsSection}
      aria-labelledby="button-stacked-options-title"
    >
      <Text as="h3" id="button-stacked-options-title" profile={profiles.sectionTitle}>
        Stacked
      </Text>
      {showDescriptions ? (
        <Text as="p" profile={profiles.body}>
          A horizontally scrolling options bar inspired by Microsoft Teams. Icons follow the
          selected family. Select up to two options; a third replaces the oldest selection.
        </Text>
      ) : null}
      {available ? (
        <ShowcaseExampleCard
          context={surfaceContext}
          padding="md"
          contentClassName={styles.stackedOptionsContent}
        >
          <fieldset className={`${styles.stackedOptionsBar} k-root`} aria-label="Meeting options">
            <div className={styles.stackedOptionsGrid}>
              {MEETING_OPTIONS.map(({ label, icon }) => (
                <Button
                  key={label}
                  type="button"
                  iconLayout="stacked"
                  iconTreatment="plain"
                  intent={label === 'Leave' ? 'destructive' : 'neutral'}
                  emphasis="low"
                  radius={radius}
                  size={componentScaleToSize(scale)}
                  toggle
                  controlState={selectedOptions.includes(label)}
                  onClick={() =>
                    setSelectedOptions((current) =>
                      current.includes(label)
                        ? current.filter((option) => option !== label)
                        : [...current.slice(-1), label]
                    )
                  }
                  onFocus={(event) =>
                    event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })
                  }
                >
                  <Button.Icon>
                    <FamilyResolvedIcon name={icon} />
                  </Button.Icon>
                  <Button.Label>
                    <SmoothText fontName={fontName} align="center">
                      {label}
                    </SmoothText>
                  </Button.Label>
                </Button>
              ))}
            </div>
          </fieldset>
        </ShowcaseExampleCard>
      ) : (
        <ButtonUnavailableExample description="The active preset does not publish stacked Buttons at the selected size." />
      )}
    </section>
  );
}
