'use client';

import {
  type ButtonSelectionEmphasis,
  type RadiusMode,
  resolveButtonStackedRadiusMode,
  type SurfaceContext
} from '@kiskadee/core';
import { Button, useButtonArtifactConfig } from '@kiskadee/react-components/button';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import { useComponentMetadata } from '@kiskadee/react-components/resources';
import { SmoothText } from '@kiskadee/react-components/smooth-text';
import { Text } from '@kiskadee/react-components/text';
import { useId, useState } from 'react';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';
import { ButtonUnavailableExample } from './ButtonUnavailableExample';
import { supportsStackedButtonSize } from './buttonStackedAvailability';

const SAMPLES = [
  {
    id: 'selected',
    level: 'lowest',
    label: 'Enable',
    activeLabel: 'Enabled',
    caption: 'Selection emphasis: Lowest'
  },
  {
    id: 'indicator',
    level: 'low',
    label: 'Enable',
    activeLabel: 'Enabled',
    caption: 'Selection emphasis: Low'
  },
  {
    id: 'emphasis',
    level: 'medium',
    label: 'Follow',
    activeLabel: 'Unfollow',
    caption: 'Selection emphasis: Medium'
  },
  {
    id: 'stacked',
    level: 'high',
    label: 'Raise hand',
    activeLabel: 'Hand raised',
    caption: 'Selection emphasis: High'
  }
] as const satisfies ReadonlyArray<{
  id: string;
  level: ButtonSelectionEmphasis;
  label: string;
  activeLabel: string;
  caption: string;
}>;

type SampleId = (typeof SAMPLES)[number]['id'];

export function ButtonSelectionExamples({
  fontName,
  radius,
  surfaceContext
}: {
  fontName: string;
  radius: RadiusMode;
  surfaceContext: SurfaceContext;
}) {
  const profiles = useShowcaseTextProfiles();
  const descriptionId = useId();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const metadata = useComponentMetadata('button');
  const {
    buttonClassesMap,
    indicatorSizesByRadius,
    outsideIndicatorSizesByRadius,
    stackedIndicatorSizesByRadius,
    stackedOutsideIndicatorSizesByRadius,
    stackedSizesByRadius,
    options
  } = useButtonArtifactConfig();
  const [selected, setSelected] = useState<Partial<Record<SampleId, boolean>>>({});
  const mediumAvailable = metadata?.sizeSupport?.sizes?.includes('md:1') === true;
  const placement = options.indicatorPlacement ?? 'inside';
  const indicatorCoverage =
    placement === 'inside' ? indicatorSizesByRadius : outsideIndicatorSizesByRadius;
  const stackedIndicatorCoverage =
    placement === 'inside' ? stackedIndicatorSizesByRadius : stackedOutsideIndicatorSizesByRadius;
  const stackedRadius = resolveButtonStackedRadiusMode(radius);
  const stackedAvailable = supportsStackedButtonSize(
    buttonClassesMap,
    's:md:1',
    stackedSizesByRadius?.[stackedRadius],
    stackedRadius
  );

  return (
    <section className={styles.selectionBehaviors} aria-labelledby="button-selection-title">
      <Text as="h3" id="button-selection-title" profile={profiles.sectionTitle}>
        Selection behaviors
      </Text>
      {showDescriptions ? (
        <Text as="p" profile={profiles.body}>
          Compare four selection emphasis levels on Medium Buttons with Medium base emphasis. Lowest
          and Low use Selected colors; Medium and High use High at Rest. Low and High add the
          selection indicator. Each action keeps its own selection.
        </Text>
      ) : null}
      <ShowcaseExampleCard
        context={surfaceContext}
        contentClassName={styles.selectionBehaviorsGrid}
      >
        {SAMPLES.map(({ id, level, label, activeLabel, caption }) => {
          const stacked = id === 'stacked';
          const indicated = level === 'low' || level === 'high';
          const effectiveRadius = stacked ? stackedRadius : radius;
          const coverage = stacked ? stackedIndicatorCoverage : indicatorCoverage;
          const available =
            mediumAvailable &&
            (!stacked || stackedAvailable) &&
            (!indicated || coverage?.[effectiveRadius]?.includes('md:1') === true);
          return (
            <article
              className={styles.selectionBehaviorSample}
              data-button-selection-example={id}
              key={id}
            >
              <div className={`${styles.selectionBehaviorControl} k-root`}>
                {available ? (
                  <Button
                    type="button"
                    aria-describedby={`${descriptionId}-${id}`}
                    size="md"
                    radius={effectiveRadius}
                    intent="primary"
                    emphasis="medium"
                    selectionEmphasis={level}
                    indicatorPlacement={placement}
                    iconLayout={stacked ? 'stacked' : 'inline'}
                    iconTreatment="plain"
                    toggle
                    controlState={selected[id] === true}
                    onClick={() => setSelected((current) => ({ ...current, [id]: !current[id] }))}
                  >
                    {stacked ? (
                      <Button.Icon>
                        <FamilyResolvedIcon name="hand" />
                      </Button.Icon>
                    ) : null}
                    <Button.Label>
                      <SmoothText fontName={fontName} align="center">
                        {selected[id] ? activeLabel : label}
                      </SmoothText>
                    </Button.Label>
                  </Button>
                ) : (
                  <ButtonUnavailableExample description="The active preset does not publish this Medium Button composition and indicator position at the selected radius." />
                )}
              </div>
              <Text
                as="p"
                id={`${descriptionId}-${id}`}
                profile={profiles.caption}
                emphasis="medium"
              >
                {caption}
              </Text>
            </article>
          );
        })}
      </ShowcaseExampleCard>
    </section>
  );
}
