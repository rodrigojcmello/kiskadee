'use client';

import {
  componentScaleToSize,
  type ElementSizeValue,
  type RadiusMode,
  resolveButtonStackedRadiusMode,
  resolveSupportedSize,
  type SurfaceContext
} from '@kiskadee/core';
import { Button, type ButtonArtifactConfig } from '@kiskadee/react-components/button';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import { Layout } from '@kiskadee/react-components/layout';
import { useComponentMetadata, useKiskadee } from '@kiskadee/react-components/resources';
import { SmoothText } from '@kiskadee/react-components/smooth-text';
import { Text } from '@kiskadee/react-components/text';
import { useId, useState } from 'react';
import { ShowcaseExampleCard } from '@/components/ShowcaseBackground/ShowcaseExampleCard';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';
import {
  ButtonCompositionControls,
  useButtonCompositionControls
} from './ButtonCompositionControls';
import { ButtonUnavailableExample } from './ButtonUnavailableExample';
import { supportsStackedButtonSize } from './buttonStackedAvailability';

const MEETING_OPTIONS = [
  { label: 'Record', icon: 'record' },
  { label: 'Chat', icon: 'chat' },
  { label: 'Share', icon: 'screen-share' },
  { label: 'People', icon: 'users' },
  { label: 'Raise', icon: 'hand' },
  { label: 'React', icon: 'smile' },
  { label: 'View', icon: 'grid' },
  { label: 'More', icon: 'ellipsis' },
  { label: 'Camera', icon: 'video' },
  { label: 'Mic', icon: 'mic' },
  { label: 'Leave', icon: 'phone-hangup' }
] as const;

const RADIUS_BUCKETS = { rounded: 'rr', pill: 'rp', square: 'rs' } as const;

function MeetingOptionsBar({
  available,
  classesMap,
  fontName,
  layout,
  radius,
  scale,
  selectionControlAvailable,
  descriptionId,
  surfaceContext
}: {
  available: boolean;
  classesMap: ButtonArtifactConfig['buttonClassesMap'];
  fontName: string;
  layout: 'stacked' | 'icon';
  radius?: RadiusMode;
  scale: ElementSizeValue;
  selectionControlAvailable: boolean;
  descriptionId?: string;
  surfaceContext: SurfaceContext;
}) {
  const profiles = useShowcaseTextProfiles();
  const presentation = useButtonCompositionControls(classesMap, {
    intent: 'original',
    emphasis: 'low',
    selectionIntent: 'same',
    selectionEmphasis: layout === 'stacked' ? 'low' : 'medium'
  });
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    layout === 'stacked' ? ['Share', 'Raise'] : ['React', 'Leave']
  );
  const title = layout === 'stacked' ? 'Stacked' : 'Icon only';
  const titleId = `button-videoconferencing-${layout}-title`;

  return (
    <section
      className={styles.meetingLayoutSection}
      aria-labelledby={titleId}
      data-button-meeting-layout={layout}
    >
      <Text as="h5" id={titleId} profile={profiles.bodyStrong}>
        {title}
      </Text>
      {available ? (
        <ShowcaseExampleCard context={surfaceContext} padding={false} clipContent>
          {selectionControlAvailable ? (
            <ButtonCompositionControls {...presentation.controls} descriptionId={descriptionId} />
          ) : null}
          <Layout padding="md" classNames={{ e2: styles.stackedOptionsContent }}>
            <fieldset
              className={`${styles.stackedOptionsBar} k-root`}
              aria-label={`${title} meeting options`}
            >
              <div
                className={`${styles.stackedOptionsGrid}${layout === 'icon' ? ` ${styles.meetingIconGrid}` : ''}`}
              >
                {MEETING_OPTIONS.map(({ label, icon }) => {
                  const selected = selectedOptions.includes(label);
                  const buttonPresentation = presentation.buttonProps(
                    label === 'Leave' ? 'destructive' : label === 'Share' ? 'positive' : 'neutral'
                  );
                  return (
                    <Button
                      key={label}
                      type="button"
                      iconLayout={layout === 'stacked' ? 'stacked' : 'inline'}
                      iconTreatment="plain"
                      aria-label={layout === 'icon' ? label : undefined}
                      title={layout === 'icon' ? label : undefined}
                      {...buttonPresentation}
                      selectionEmphasis={
                        selectionControlAvailable ? buttonPresentation.selectionEmphasis : 'lowest'
                      }
                      radius={radius}
                      size={componentScaleToSize(scale)}
                      toggle
                      controlState={selected}
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
                      {layout === 'stacked' ? (
                        <Button.Label>
                          <SmoothText fontName={fontName} align="center">
                            {label}
                          </SmoothText>
                        </Button.Label>
                      ) : null}
                    </Button>
                  );
                })}
              </div>
            </fieldset>
          </Layout>
        </ShowcaseExampleCard>
      ) : (
        <ButtonUnavailableExample
          description={
            layout === 'stacked'
              ? 'The active preset does not publish stacked Buttons at the selected size and radius.'
              : 'The active preset does not publish icon-only Buttons at its default radius and the effective size.'
          }
        />
      )}
    </section>
  );
}

export function ButtonVideoconferencingExamples({
  classesMap,
  fontName,
  radius,
  scale = 's:md:1',
  selectionControlAvailable,
  stackedSizes,
  surfaceContext
}: {
  classesMap: ButtonArtifactConfig['buttonClassesMap'];
  fontName: string;
  radius: RadiusMode;
  scale?: ElementSizeValue;
  selectionControlAvailable: boolean;
  stackedSizes: readonly string[] | undefined;
  surfaceContext: SurfaceContext;
}) {
  const profiles = useShowcaseTextProfiles();
  const { global } = useKiskadee();
  const descriptionId = useId();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const metadata = useComponentMetadata('button');
  const supportedSizes = metadata?.sizeSupport?.sizes;
  const effectiveSize = supportedSizes
    ? resolveSupportedSize(scale.replace(/^s:/, ''), supportedSizes)
    : undefined;
  const defaultRadiusClasses = classesMap?.e1?.[RADIUS_BUCKETS[global?.radius ?? 'rounded']];
  const stackedRadius = resolveButtonStackedRadiusMode(radius);
  const iconOnlyAvailable = Boolean(
    effectiveSize &&
      (classesMap?.e1?.s?.all || classesMap?.e1?.s?.[effectiveSize]) &&
      (classesMap?.e3?.s?.all || classesMap?.e3?.s?.[effectiveSize]) &&
      (defaultRadiusClasses?.all || defaultRadiusClasses?.[effectiveSize])
  );

  return (
    <section
      className={styles.videoconferencingSection}
      aria-labelledby="button-videoconferencing-title"
    >
      <Text as="h4" id="button-videoconferencing-title" profile={profiles.subsectionTitle}>
        Videoconferencing
      </Text>
      {showDescriptions ? (
        <Text as="p" id={descriptionId} profile={profiles.body}>
          Options bars for a videoconferencing application, using stacked and icon-only Buttons.
          Stacked starts with Share and Raise selected; Icon only starts with React and Leave.
          Select up to two options independently in each bar; a third replaces the oldest selection.
          Adjust each bar's button and selection appearance independently.
        </Text>
      ) : null}
      <MeetingOptionsBar
        available={supportsStackedButtonSize(classesMap, scale, stackedSizes, stackedRadius)}
        classesMap={classesMap}
        fontName={fontName}
        layout="stacked"
        radius={stackedRadius}
        scale={scale}
        selectionControlAvailable={selectionControlAvailable}
        descriptionId={showDescriptions ? descriptionId : undefined}
        surfaceContext={surfaceContext}
      />
      <MeetingOptionsBar
        available={iconOnlyAvailable}
        classesMap={classesMap}
        fontName={fontName}
        layout="icon"
        scale={scale}
        selectionControlAvailable={selectionControlAvailable}
        descriptionId={showDescriptions ? descriptionId : undefined}
        surfaceContext={surfaceContext}
      />
    </section>
  );
}
