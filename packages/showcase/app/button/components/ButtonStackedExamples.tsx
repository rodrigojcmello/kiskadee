'use client';

import type {
  ElementHeightReference,
  ElementSizeValue,
  RadiusMode,
  SurfaceContext,
  TypographyProfileId
} from '@kiskadee/core';
import { componentScaleToSize, resolveButtonStackedRadiusMode } from '@kiskadee/core';
import { Button, type ButtonArtifactConfig } from '@kiskadee/react-components/button';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import { SmoothText } from '@kiskadee/react-components/smooth-text';
import { Text } from '@kiskadee/react-components/text';
import { useState } from 'react';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';
import { ButtonSizeScaleExample } from './ButtonSizeScaleExample';
import { ButtonUnavailableExample } from './ButtonUnavailableExample';
import { supportsStackedButtonSize } from './buttonStackedAvailability';

const STACKED_SIZES: ReadonlyArray<{ value: ElementSizeValue; label: string }> = [
  { value: 's:sm:1', label: 'Small' },
  { value: 's:md:1', label: 'Medium' },
  { value: 's:lg:1', label: 'Large' },
  { value: 's:lg:2', label: 'Large 2' }
];

type Props = {
  classesMap: ButtonArtifactConfig['buttonClassesMap'];
  fontName: string;
  heightReference: ElementHeightReference | undefined;
  radius: RadiusMode;
  referenceProfile: TypographyProfileId;
  stackedSizes: readonly string[] | undefined;
  surfaceContext: SurfaceContext;
};

export function ButtonStackedExamples({
  classesMap,
  fontName,
  heightReference,
  radius,
  referenceProfile,
  stackedSizes,
  surfaceContext
}: Props) {
  const textProfiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const [addedItems, setAddedItems] = useState(0);
  const stackedRadius = resolveButtonStackedRadiusMode(radius);
  const supportsAction = supportsStackedButtonSize(
    classesMap,
    's:md:1',
    stackedSizes,
    stackedRadius
  );

  return (
    <section className={styles.sizeScaleComposition} aria-labelledby="button-stacked-title">
      <Text
        as="h4"
        id="button-stacked-title"
        profile={textProfiles.subsectionTitle}
        emphasis="medium"
      >
        Stacked
      </Text>
      <div
        className={`${styles['example-states']} ${styles.sizeScaleExamples} k-root`}
        data-button-scale-composition="stacked"
      >
        {STACKED_SIZES.map(({ value, label }) =>
          supportsStackedButtonSize(classesMap, value, stackedSizes, stackedRadius) ? (
            <ButtonSizeScaleExample
              key={value}
              compact
              scale={value}
              heightReference={heightReference}
              referenceProfile={referenceProfile}
            >
              {({ buttonRef, descriptionId }) => (
                <Button
                  ref={buttonRef}
                  aria-describedby={descriptionId}
                  iconLayout="stacked"
                  iconTreatment="plain"
                  radius={stackedRadius}
                  size={componentScaleToSize(value)}
                  intent="primary"
                  emphasis="high"
                  surfaceContext={surfaceContext}
                >
                  <Button.Icon>
                    <FamilyResolvedIcon name="plus" />
                  </Button.Icon>
                  <Button.Label>
                    <SmoothText fontName={fontName} align="center">
                      {label}
                    </SmoothText>
                  </Button.Label>
                </Button>
              )}
            </ButtonSizeScaleExample>
          ) : (
            <div key={value} className={styles.sizeScaleUnavailable}>
              <ButtonUnavailableExample
                description={`Stacked Button size ${label} is not published in the active design system.`}
              />
            </div>
          )
        )}
      </div>
      <div className={`${styles.stackedActionExample} k-root`}>
        {supportsAction ? (
          <>
            <Button
              type="button"
              iconLayout="stacked"
              iconTreatment="plain"
              intent="neutral"
              emphasis="low"
              radius={stackedRadius}
              size="md"
              surfaceContext={surfaceContext}
              onClick={() => setAddedItems((count) => count + 1)}
            >
              <Button.Icon>
                <FamilyResolvedIcon name="plus" />
              </Button.Icon>
              <Button.Label>
                <SmoothText fontName={fontName} align="center">
                  Add item
                </SmoothText>
              </Button.Label>
            </Button>
            <Text as="p" profile={textProfiles.caption} emphasis="medium" role="status">
              {addedItems > 0
                ? `Added ${addedItems} ${addedItems === 1 ? 'item' : 'items'}.`
                : 'No items added yet.'}
            </Text>
          </>
        ) : null}
        {showDescriptions ? (
          <Text as="p" profile={textProfiles.caption} emphasis="medium">
            Stacked places the icon above a single-line label. Its size recipes and reference
            heights are independent from the horizontal composition.
          </Text>
        ) : null}
      </div>
    </section>
  );
}
