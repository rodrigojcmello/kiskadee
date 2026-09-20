'use client';

import { useKiskadee, useShowcase } from '@kiskadee/react-components/resources';
import DynamicColorPicker from '@/components/DynamicColorPicker/DynamicColorPicker';
import FontNamePicker from '@/components/FontNamePicker/FontNamePicker';
import IconFamilyPicker from '@/components/IconFamilyPicker/IconFamilyPicker';
import { ShowcaseBackgroundControls } from '@/components/ShowcaseBackground/ShowcaseBackgroundControls';
import {
  ShowcaseControlField,
  ShowcaseControlGrid,
  ShowcaseControlGroup,
  ShowcaseControlPanel
} from '@/components/ShowcaseControls';
import ThemeModePicker from '@/components/ThemeModePicker/ThemeModePicker';
import { useSegmentMetadata } from '@/hooks/use-segment-metadata';
import { Select } from '@/k-components';
import { playWowTransition } from '@/utils/playWowTransition';
import { orderSegments } from '@/utils/segment-options';
import DesignSystemControls from './DesignSystemControls';
import { ShowcaseDensityControl } from './ShowcaseDensityControl';
import styles from './ShowcaseGlobalControls.module.scss';

type ShowcaseGlobalControlsProps = {
  variant: 'toolbar' | 'panel';
};

export function ShowcaseGlobalSemanticControls() {
  const { segment } = useKiskadee();

  return (
    <ShowcaseControlGrid>
      <ShowcaseControlField fullWidth>
        <ThemeModePicker className={styles.panelSwatches} />
      </ShowcaseControlField>
      {segment === 'dynamic' ? (
        <ShowcaseControlField fullWidth>
          <DynamicColorPicker className={styles.panelSwatches} />
        </ShowcaseControlField>
      ) : null}
      <ShowcaseControlField fullWidth>
        <ShowcaseBackgroundControls />
      </ShowcaseControlField>
    </ShowcaseControlGrid>
  );
}

export function ShowcaseSegmentControl({ className }: { className?: string }) {
  const { designSystem, segment, setSegment, theme } = useKiskadee();
  const { availableSegments } = useShowcase();
  const metadata = useSegmentMetadata(designSystem);
  const segmentOptions = metadata.data
    ? orderSegments(metadata.data)
        .filter((entry) => availableSegments.includes(entry.id))
        .map((entry) => {
          const name = `${entry.name}${entry.id === metadata.data?.defaultSegment ? ' (default)' : ''}`;
          const color = entry.vivid[theme];
          return {
            value: entry.id,
            textValue: name,
            label: (
              <span className={styles.segmentLabel}>
                {color ? (
                  <span
                    aria-hidden="true"
                    className={styles.segmentDot}
                    style={{ backgroundColor: color }}
                  />
                ) : null}
                <span>{name}</span>
              </span>
            )
          };
        })
    : [
        {
          value: segment,
          textValue: undefined,
          label: metadata.error ? 'Segments unavailable' : 'Loading segments…'
        }
      ];

  return (
    <>
      <Select
        className={className}
        label="Segment"
        width="100%"
        minWidth={0}
        maxWidth={300}
        options={segmentOptions}
        selectedLabel={segmentOptions.find((option) => option.value === segment)?.textValue}
        value={segment}
        onValueChange={(value) => {
          if (value === segment) return;
          playWowTransition();
          setSegment(value);
        }}
        disabled={!metadata.data || availableSegments.length <= 1}
      />
      {metadata.error ? (
        <div className={styles.segmentError}>
          <span role="alert">Unable to load segments.</span>
          <button className={styles.segmentRetry} type="button" onClick={metadata.retry}>
            Retry
          </button>
        </div>
      ) : null}
    </>
  );
}

export function ShowcaseTypographyControls() {
  return (
    <ShowcaseControlGrid>
      <ShowcaseControlField fullWidth>
        <FontNamePicker className={styles.panelSelect} width="100%" />
      </ShowcaseControlField>
    </ShowcaseControlGrid>
  );
}

export function ShowcaseIconographyControls() {
  return (
    <ShowcaseControlGrid>
      <ShowcaseControlField fullWidth>
        <IconFamilyPicker className={styles.panelSelect} width="100%" />
      </ShowcaseControlField>
    </ShowcaseControlGrid>
  );
}

export function ShowcaseGlobalPanelControls() {
  return (
    <ShowcaseControlPanel>
      <ShowcaseControlGroup title="Semantic">
        <ShowcaseGlobalSemanticControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Typography">
        <ShowcaseTypographyControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Iconography">
        <ShowcaseIconographyControls />
      </ShowcaseControlGroup>
    </ShowcaseControlPanel>
  );
}

export default function ShowcaseGlobalControls({ variant }: ShowcaseGlobalControlsProps) {
  if (variant === 'panel') {
    return <ShowcaseGlobalPanelControls />;
  }

  return (
    <div className={styles.toolbarLayout}>
      <DesignSystemControls />
      <div className={styles.toolbarSegment}>
        <ShowcaseSegmentControl className={styles.toolbarSelect} />
      </div>
      <ShowcaseDensityControl />
    </div>
  );
}
