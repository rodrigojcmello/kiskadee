'use client';

import type { ProgressIntent, ProgressScale, SurfaceContext } from '@kiskadee/core';
import { Progress, useKiskadee, useShowcase } from '@kiskadee/react-components';
import type { ManifestComponentState } from '@kiskadee/web-builder/types';
import { useEffect, useState } from 'react';
import {
  ShowcaseControlGrid,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseRouteControls,
  ShowcaseSegmentedControl,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import {
  getManifestComponentState,
  supportsManifestSurfaceContext
} from '@/utils/manifest-surface-context';
import styles from './Progress.module.scss';

const INTENT_ORDER: ProgressIntent[] = ['neutral', 'primary', 'positive', 'warning', 'destructive'];
const INTENT_LABELS: Record<ProgressIntent, string> = {
  neutral: 'Neutral',
  primary: 'Primary',
  positive: 'Positive',
  warning: 'Warning',
  destructive: 'Destructive'
};
const SURFACE_CONTEXT_OPTIONS: Array<{ value: SurfaceContext; label: string }> = [
  { value: 'onSubtle', label: 'On subtle' },
  { value: 'onVivid', label: 'On vivid' }
];
const MODE_OPTIONS = [
  { value: 'determinate', label: 'Determinate' },
  { value: 'indeterminate', label: 'Indeterminate' }
] as const;
const SCALE_OPTIONS: Array<{ value: ProgressScale; label: string }> = [
  { value: 's:md:1', label: 'Medium' },
  { value: 's:lg:1', label: 'Large' }
];
const VALUE_BEHAVIOR_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'simulated', label: 'Simulated' }
] as const;

function hasRestProfile(
  state: ManifestComponentState | undefined,
  intent: ProgressIntent
): boolean {
  return Boolean(state?.[intent]?.medium?.rest);
}

export default function ProgressPage() {
  const { segment, theme } = useKiskadee();
  const { manifest } = useShowcase();
  const [value, setValue] = useState(64);
  const [mode, setMode] = useState<(typeof MODE_OPTIONS)[number]['value']>('determinate');
  const [valueBehavior, setValueBehavior] =
    useState<(typeof VALUE_BEHAVIOR_OPTIONS)[number]['value']>('manual');
  const [scale, setScale] = useState<ProgressScale>('s:md:1');
  const [intent, setIntent] = useState<ProgressIntent>('neutral');
  const [surfaceContext, setSurfaceContext] = useState<SurfaceContext>('onSubtle');

  useEffect(() => {
    if (mode !== 'determinate' || valueBehavior !== 'simulated') return;

    const runDurationMs = 4200;
    const holdDurationMs = 800;
    const cycleDurationMs = runDurationMs + holdDurationMs;
    const startedAt = performance.now();
    let animationFrame = 0;

    const advanceSimulation = (timestamp: number) => {
      const elapsed = (timestamp - startedAt) % cycleDurationMs;
      const nextValue =
        elapsed >= runDurationMs ? 100 : Math.round((elapsed / runDurationMs) * 100);

      setValue((currentValue) => (currentValue === nextValue ? currentValue : nextValue));
      animationFrame = requestAnimationFrame(advanceSimulation);
    };

    animationFrame = requestAnimationFrame(advanceSimulation);
    return () => cancelAnimationFrame(animationFrame);
  }, [mode, valueBehavior]);

  const progressMeta = manifest?.components?.progress;
  const isProgressAvailable = Boolean(progressMeta);
  const availableScaleOptions = SCALE_OPTIONS.filter(
    (option) => progressMeta?.scale?.[option.value]
  );
  const activeScale =
    availableScaleOptions.find((option) => option.value === scale)?.value ??
    availableScaleOptions[0]?.value ??
    's:md:1';
  const surfaceContextOptions = SURFACE_CONTEXT_OPTIONS.filter((option) =>
    supportsManifestSurfaceContext(progressMeta, segment, theme, option.value)
  );
  const activeSurfaceContext =
    surfaceContextOptions.find((option) => option.value === surfaceContext)?.value ??
    surfaceContextOptions[0]?.value ??
    'onSubtle';
  const progressState = getManifestComponentState(
    progressMeta,
    segment,
    theme,
    activeSurfaceContext
  );
  const intentOptions = INTENT_ORDER.filter((candidateIntent) =>
    hasRestProfile(progressState, candidateIntent)
  ).map((candidateIntent) => ({
    value: candidateIntent,
    label: INTENT_LABELS[candidateIntent]
  }));
  const activeIntent =
    intentOptions.find((option) => option.value === intent)?.value ??
    intentOptions.find((option) => option.value === 'neutral')?.value ??
    intentOptions[0]?.value ??
    'neutral';
  const hasActiveProfile = hasRestProfile(progressState, activeIntent);

  const controls = (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Appearance">
        <ShowcaseControlGrid>
          <ShowcaseSelectControl
            label="Intent"
            options={intentOptions}
            value={activeIntent}
            onValueChange={(nextIntent) => setIntent(nextIntent as ProgressIntent)}
            disabled={intentOptions.length <= 1}
          />
          <ShowcaseSelectControl
            label="Size"
            options={availableScaleOptions}
            value={activeScale}
            onValueChange={(nextScale) => setScale(nextScale as ProgressScale)}
            disabled={availableScaleOptions.length <= 1}
          />
        </ShowcaseControlGrid>
        <ShowcaseSegmentedControl
          label="Surface context"
          options={surfaceContextOptions}
          value={activeSurfaceContext}
          onValueChange={(nextSurfaceContext) =>
            setSurfaceContext(nextSurfaceContext as SurfaceContext)
          }
          disabled={surfaceContextOptions.length <= 1}
        />
        <ShowcaseSegmentedControl
          label="Mode"
          options={MODE_OPTIONS}
          value={mode}
          onValueChange={(nextMode) => setMode(nextMode as typeof mode)}
        />
        {mode === 'determinate' ? (
          <ShowcaseSegmentedControl
            label="Value behavior"
            options={VALUE_BEHAVIOR_OPTIONS}
            value={valueBehavior}
            onValueChange={(nextBehavior) => setValueBehavior(nextBehavior as typeof valueBehavior)}
          />
        ) : null}
        {mode === 'determinate' && valueBehavior === 'manual' ? (
          <label className={styles.valueControl} htmlFor="progress-value">
            <span className={styles.valueControlHeader}>
              <span>Value</span>
              <output htmlFor="progress-value">{value}%</output>
            </span>
            <input
              id="progress-value"
              type="range"
              min={0}
              max={100}
              step={1}
              value={value}
              onChange={(event) => setValue(event.currentTarget.valueAsNumber)}
            />
          </label>
        ) : null}
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h2>Progress</h2>
        <p className={styles.summary}>
          A controlled progress indicator. Determinate mode exposes a measured value; indeterminate
          mode communicates ongoing work without inventing a percentage.
        </p>
      </header>

      <ShowcaseRouteControls
        id="progress"
        eyebrow="Progress"
        title="Controls"
        isAvailable={isProgressAvailable}
      >
        {controls}
      </ShowcaseRouteControls>

      {isProgressAvailable && hasActiveProfile ? (
        <section
          className={`${styles.preview} k-root`}
          data-surface-context={activeSurfaceContext}
          data-theme={theme}
          aria-labelledby="progress-preview-title"
        >
          <div className={styles.valueHeader}>
            <h3 id="progress-preview-title">Deployment</h3>
            <output>{mode === 'determinate' ? `${value}%` : 'Working…'}</output>
          </div>
          {mode === 'determinate' ? (
            <Progress
              aria-labelledby="progress-preview-title"
              aria-valuetext={`${value}% complete`}
              intent={activeIntent}
              scale={activeScale}
              surfaceContext={activeSurfaceContext}
              value={value}
            />
          ) : (
            <Progress
              aria-label="Deployment in progress"
              intent={activeIntent}
              mode="indeterminate"
              scale={activeScale}
              surfaceContext={activeSurfaceContext}
            />
          )}
          <fieldset className={styles.referenceGrid}>
            <legend>Semantic intents</legend>
            {INTENT_ORDER.map((referenceIntent) => (
              <div className={styles.referenceItem} key={referenceIntent}>
                <span>{INTENT_LABELS[referenceIntent]}</span>
                {hasRestProfile(progressState, referenceIntent) ? (
                  <Progress
                    aria-label={`${INTENT_LABELS[referenceIntent]} progress`}
                    intent={referenceIntent}
                    scale="s:md:1"
                    surfaceContext={activeSurfaceContext}
                    value={64}
                  />
                ) : null}
              </div>
            ))}
          </fieldset>
        </section>
      ) : (
        <div className={styles.emptyState}>
          {isProgressAvailable
            ? 'Progress has no Rest profile for the active palette.'
            : 'Progress is not available in the current design system.'}
        </div>
      )}
    </section>
  );
}
