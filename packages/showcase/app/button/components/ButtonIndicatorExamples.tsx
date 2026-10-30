'use client';

import {
  componentScaleToSize,
  type ElementSizeValue,
  type RadiusMode,
  resolveButtonStackedRadiusMode,
  resolveDensityScale,
  resolveSupportedSize,
  type SurfaceContext
} from '@kiskadee/core';
import { Button, useButtonArtifactConfig } from '@kiskadee/react-components/button';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import { useComponentMetadata, useKiskadee } from '@kiskadee/react-components/resources';
import { Text } from '@kiskadee/react-components/text';
import { useState } from 'react';
import { useShowcaseDensity } from '@/app/ShowcaseDensityContext';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';
import { ButtonUnavailableExample } from './ButtonUnavailableExample';

const INTENTS = ['primary', 'neutral', 'destructive', 'positive'] as const;
const PLACEMENTS = ['inside', 'outside'] as const;

export function ButtonIndicatorExamples({
  radius,
  scale,
  surfaceContext
}: {
  radius: RadiusMode;
  scale?: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const profiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const {
    indicatorSizesByRadius,
    stackedIndicatorSizesByRadius,
    outsideIndicatorSizesByRadius,
    stackedOutsideIndicatorSizesByRadius,
    stackedSizesByRadius
  } = useButtonArtifactConfig();
  const { global } = useKiskadee();
  const { activeDensity } = useShowcaseDensity();
  const metadata = useComponentMetadata('button');
  const [deselected, setDeselected] = useState<string[]>([]);
  const size = scale ? componentScaleToSize(scale) : undefined;
  const densityMap = metadata?.density ?? global?.density;
  const requestedScale =
    scale?.replace(/^s:/, '') ??
    (densityMap ? resolveDensityScale(activeDensity, densityMap) : undefined);
  const scaleKey =
    requestedScale && requestedScale !== 'a' && metadata?.sizeSupport?.sizes
      ? resolveSupportedSize(requestedScale, metadata.sizeSupport.sizes)
      : requestedScale;
  const hasCoverage = (coverage: readonly string[] | undefined) =>
    scaleKey && scaleKey !== 'a' ? coverage?.includes(scaleKey) : Boolean(coverage?.length);
  const available =
    hasCoverage(indicatorSizesByRadius?.[radius]) ||
    hasCoverage(outsideIndicatorSizesByRadius?.[radius]);
  const stackedSize = scaleKey ? componentScaleToSize(`s:${scaleKey}` as ElementSizeValue) : size;
  const stackedRadius = resolveButtonStackedRadiusMode(radius);
  const toggle = (key: string) =>
    setDeselected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );

  return (
    <section className={styles.indicatorSection} aria-labelledby="button-indicator-title">
      <Text as="h3" id="button-indicator-title" profile={profiles.sectionTitle}>
        Selection selectionEmphasis="low"
      </Text>
      {showDescriptions ? (
        <Text as="p" profile={profiles.body}>
          Toggle a Button to compare its selection indicator. Placement preserves the Button box;
          the external line needs clearance in its surrounding layout. Unavailable actions keep
          their selection and hide the line. Preset default uses Lowest selection emphasis; the
          other samples use Low to show the indicator. Icon only reference shows the nominal line;
          the narrow I tests its width limit.
        </Text>
      ) : null}
      {available ? (
        <div className={styles.indicatorGrid}>
          {PLACEMENTS.map((placement) => {
            const coverage =
              placement === 'inside' ? indicatorSizesByRadius : outsideIndicatorSizesByRadius;
            const stackedCoverage =
              placement === 'inside'
                ? stackedIndicatorSizesByRadius
                : stackedOutsideIndicatorSizesByRadius;
            const stackedAvailable =
              hasCoverage(stackedSizesByRadius?.[stackedRadius]) &&
              hasCoverage(stackedCoverage?.[stackedRadius]);
            if (!hasCoverage(coverage?.[radius])) {
              return (
                <ShowcaseExampleCard
                  key={placement}
                  context={surfaceContext}
                  contentClassName={styles.indicatorCard}
                >
                  <Text as="h4" profile={profiles.subsectionTitle}>
                    {placement === 'inside' ? 'Inside' : 'Outside'}
                  </Text>
                  <ButtonUnavailableExample description="The active preset does not publish this indicator position at this size and radius." />
                </ShowcaseExampleCard>
              );
            }
            return (
              <ShowcaseExampleCard
                key={placement}
                context={surfaceContext}
                contentClassName={styles.indicatorCard}
              >
                <Text as="h4" profile={profiles.subsectionTitle}>
                  {placement === 'inside' ? 'Inside' : 'Outside'}
                </Text>
                <div className={styles.indicatorRow}>
                  <Button
                    type="button"
                    size={size}
                    radius={radius}
                    intent="neutral"
                    emphasis="low"
                    selectionEmphasis="low"
                    indicatorPlacement={placement}
                    toggle
                    aria-label="Icon only reference"
                    controlState={!deselected.includes(`${placement}-reference`)}
                    onClick={() => toggle(`${placement}-reference`)}
                  >
                    <Button.Icon>
                      <FamilyResolvedIcon name="chat" />
                    </Button.Icon>
                  </Button>
                  <Button
                    type="button"
                    size={size}
                    radius={radius}
                    intent="neutral"
                    emphasis="low"
                    indicatorPlacement={placement}
                    toggle
                    controlState={!deselected.includes(`${placement}-default`)}
                    onClick={() => toggle(`${placement}-default`)}
                  >
                    <Button.Label>Preset default</Button.Label>
                  </Button>
                  <Button
                    type="button"
                    size={size}
                    radius={radius}
                    intent="neutral"
                    emphasis="low"
                    selectionEmphasis="low"
                    indicatorPlacement={placement}
                    toggle
                    aria-label="Narrow label"
                    controlState={!deselected.includes(`${placement}-narrow`)}
                    onClick={() => toggle(`${placement}-narrow`)}
                  >
                    <Button.Label>I</Button.Label>
                  </Button>
                </div>
                {(['low', 'high'] as const).map((emphasis) => (
                  <fieldset
                    key={emphasis}
                    className={styles.indicatorRow}
                    aria-label={`${placement} ${emphasis} emphasis`}
                  >
                    {INTENTS.map((intent) => {
                      const key = `${placement}-${intent}-${emphasis}`;
                      return (
                        <Button
                          key={key}
                          type="button"
                          size={size}
                          radius={radius}
                          intent={intent}
                          emphasis={emphasis}
                          selectionEmphasis="low"
                          indicatorPlacement={placement}
                          toggle
                          controlState={!deselected.includes(key)}
                          onClick={() => toggle(key)}
                        >
                          <Button.Label>{intent}</Button.Label>
                        </Button>
                      );
                    })}
                  </fieldset>
                ))}
                <div className={styles.indicatorRow}>
                  {stackedAvailable ? (
                    <Button
                      type="button"
                      size={stackedSize}
                      radius={stackedRadius}
                      intent="neutral"
                      emphasis="low"
                      iconLayout="stacked"
                      selectionEmphasis="low"
                      indicatorPlacement={placement}
                      toggle
                      controlState={!deselected.includes(`${placement}-chat`)}
                      onClick={() => toggle(`${placement}-chat`)}
                    >
                      <Button.Icon>
                        <FamilyResolvedIcon name="chat" />
                      </Button.Icon>
                      <Button.Label>Chat</Button.Label>
                    </Button>
                  ) : null}
                  <Button.Group size={size} radius={radius} intent="neutral" emphasis="low">
                    {['Day', 'Week', 'Month'].map((label) => {
                      const key = `${placement}-${label}`;
                      return (
                        <Button
                          key={key}
                          type="button"
                          selectionEmphasis="low"
                          indicatorPlacement={placement}
                          toggle
                          controlState={!deselected.includes(key)}
                          onClick={() => toggle(key)}
                        >
                          <Button.Label>{label}</Button.Label>
                        </Button>
                      );
                    })}
                  </Button.Group>
                </div>
                <fieldset
                  className={styles.indicatorRow}
                  aria-label={`${placement} unavailable selections`}
                >
                  <Button
                    size={size}
                    radius={radius}
                    intent="neutral"
                    emphasis="low"
                    selectionEmphasis="low"
                    indicatorPlacement={placement}
                    toggle
                    controlState
                    disabled
                  >
                    <Button.Label>Disabled</Button.Label>
                  </Button>
                  <Button
                    size={size}
                    radius={radius}
                    intent="neutral"
                    emphasis="low"
                    selectionEmphasis="low"
                    indicatorPlacement={placement}
                    toggle
                    controlState
                    pending
                  >
                    <Button.Label>Pending</Button.Label>
                  </Button>
                  <Button
                    size={size}
                    radius={radius}
                    intent="neutral"
                    emphasis="low"
                    selectionEmphasis="low"
                    indicatorPlacement={placement}
                    toggle
                    controlState
                    aria-disabled="true"
                  >
                    <Button.Label>Unavailable</Button.Label>
                  </Button>
                </fieldset>
              </ShowcaseExampleCard>
            );
          })}
        </div>
      ) : (
        <ButtonUnavailableExample description="The active preset does not publish a selection indicator at this size and radius." />
      )}
    </section>
  );
}
