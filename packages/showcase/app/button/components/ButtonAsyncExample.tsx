'use client';

import type {
  ComponentEmphasis,
  ElementSizeValue,
  SurfaceContext,
  SystemButtonIntent
} from '@kiskadee/core';
import {
  FamilyResolvedIcon,
  Button as KButton,
  SmoothText,
  Text
} from '@kiskadee/react-components';
import type { ManifestComponentState } from '@kiskadee/web-builder/types';
import { useEffect, useId, useState } from 'react';
import { ShowcaseSegmentedControl } from '@/components/ShowcaseControls';
import { useShowcaseDisplayPreferences } from '@/components/ShowcaseDisplayPreferences';
import { useShowcaseTextProfiles } from '@/utils/showcase-text-profiles';
import styles from '../Button.module.scss';

type PendingPresentation = 'text' | 'spinner' | 'progress';

type PendingButtonProfile = {
  emphasis: ComponentEmphasis;
  intent: SystemButtonIntent;
};

const PENDING_INTENT_ORDER: SystemButtonIntent[] = [
  'primary',
  'neutral',
  'positive',
  'destructive'
];
const PENDING_EMPHASIS_ORDER: ComponentEmphasis[] = ['high', 'medium', 'low', 'lowest', 'highest'];

function resolvePendingButtonProfile(
  buttonState: ManifestComponentState | undefined
): PendingButtonProfile | undefined {
  for (const intent of PENDING_INTENT_ORDER) {
    for (const emphasis of PENDING_EMPHASIS_ORDER) {
      if (buttonState?.[intent]?.[emphasis]?.pending) {
        return { emphasis, intent };
      }
    }
  }

  return undefined;
}

export function ButtonAsyncExample({
  buttonState,
  fontName,
  progressAvailable,
  progressSurfaceContext,
  scale,
  surfaceContext
}: {
  buttonState: ManifestComponentState | undefined;
  fontName: string;
  progressAvailable: boolean;
  progressSurfaceContext: SurfaceContext;
  scale: ElementSizeValue;
  surfaceContext: SurfaceContext;
}) {
  const statusId = useId();
  const textProfiles = useShowcaseTextProfiles();
  const { showDescriptions } = useShowcaseDisplayPreferences();
  const [presentation, setPresentation] = useState<PendingPresentation>('text');
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const pendingProfile = resolvePendingButtonProfile(buttonState);
  const activePresentation =
    presentation === 'progress' && !progressAvailable ? 'text' : presentation;
  const presentationOptions = [
    {
      value: 'text',
      label: (
        <Text as="span" profile={textProfiles.caption}>
          Text
        </Text>
      )
    },
    {
      value: 'spinner',
      label: (
        <Text as="span" profile={textProfiles.caption}>
          Spinner
        </Text>
      )
    },
    ...(progressAvailable
      ? [
          {
            value: 'progress',
            label: (
              <Text as="span" profile={textProfiles.caption}>
                Progress
              </Text>
            )
          }
        ]
      : [])
  ];

  useEffect(() => {
    if (!pending) return;

    const intervalId =
      activePresentation === 'progress'
        ? window.setInterval(() => {
            setProgressValue((currentValue) => Math.min(currentValue + 15, 90));
          }, 450)
        : undefined;
    const timeoutId = window.setTimeout(() => {
      setProgressValue(100);
      setPending(false);
      setCompleted(true);
    }, 3000);

    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
      window.clearTimeout(timeoutId);
    };
  }, [activePresentation, pending]);

  if (!pendingProfile) return null;

  const statusMessage = pending
    ? activePresentation === 'progress'
      ? `Submitting order: ${progressValue}% complete.`
      : 'Submitting order.'
    : completed
      ? 'Order submitted.'
      : 'Ready to submit.';
  const pendingLabel = pending && activePresentation === 'text' ? 'Submitting…' : 'Submit order';

  return (
    <section className={styles.asyncSection} aria-labelledby="button-async-example-title">
      <div>
        <Text as="h3" id="button-async-example-title" profile={textProfiles.sectionTitle}>
          Async pending
        </Text>
        {showDescriptions ? (
          <Text as="p" profile={textProfiles.body} className={styles.showcaseSectionDescription}>
            One pending state, three optional feedback presentations. Start the request to inspect
            the interaction lock and focus-preserving lifecycle.
          </Text>
        ) : null}
      </div>
      <div className={styles.asyncLayout}>
        <div className={styles.asyncControls}>
          <ShowcaseSegmentedControl
            label={
              <Text as="span" profile={textProfiles.caption}>
                Pending content
              </Text>
            }
            options={presentationOptions}
            value={activePresentation}
            onValueChange={(value) => setPresentation(value as PendingPresentation)}
            disabled={pending}
          />
        </div>
        <div className={`${styles.asyncPreview} k-root`}>
          <div className={styles.asyncButton}>
            <KButton
              aria-describedby={statusId}
              emphasis={pendingProfile.emphasis}
              intent={pendingProfile.intent}
              onClick={() => {
                setCompleted(false);
                setProgressValue(0);
                setPending(true);
              }}
              pending={pending}
              scale={scale}
              surfaceContext={surfaceContext}
            >
              {pending && activePresentation === 'progress' ? (
                <KButton.Progress
                  intent={pendingProfile.intent}
                  max={100}
                  surfaceContext={progressSurfaceContext}
                  value={progressValue}
                />
              ) : null}
              {pending && activePresentation === 'spinner' ? (
                <KButton.Icon className={styles.asyncSpinner}>
                  <FamilyResolvedIcon name="loader-circle" />
                </KButton.Icon>
              ) : null}
              <KButton.Label>
                <SmoothText fontName={fontName} align="center">
                  {pendingLabel}
                </SmoothText>
              </KButton.Label>
            </KButton>
          </div>
          <Text
            as="p"
            emphasis="lowest"
            profile={textProfiles.caption}
            className={styles.asyncStatus}
            id={statusId}
            role="status"
            aria-atomic="true"
          >
            {statusMessage}
          </Text>
        </div>
      </div>
    </section>
  );
}
