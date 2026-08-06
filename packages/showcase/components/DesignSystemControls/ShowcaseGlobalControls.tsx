'use client';

import { useKiskadee, useShowcase } from '@kiskadee/react-components';
import { useState } from 'react';
import DynamicColorPicker from '@/components/DynamicColorPicker/DynamicColorPicker';
import FontNamePicker from '@/components/FontNamePicker/FontNamePicker';
import IconFamilyPicker from '@/components/IconFamilyPicker/IconFamilyPicker';
import {
  ShowcaseControlField,
  ShowcaseControlGrid,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseSelectControl
} from '@/components/ShowcaseControls';
import ThemeModePicker from '@/components/ThemeModePicker/ThemeModePicker';
import { playWowTransition } from '@/utils/playWowTransition';
import DesignSystemControls from './DesignSystemControls';
import styles from './ShowcaseGlobalControls.module.scss';

type ShowcaseGlobalControlsProps = {
  variant: 'toolbar' | 'panel';
};

const typographySizeOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'default', label: 'Default' },
  { value: 'comfortable', label: 'Comfortable' }
];

export function ShowcaseGlobalSemanticControls() {
  const { segment, setSegment } = useKiskadee();
  const { availableSegments } = useShowcase();

  const segmentOptions = availableSegments.map((availableSegment) => ({
    value: availableSegment,
    label: availableSegment
  }));

  return (
    <ShowcaseControlGrid>
      <ShowcaseSelectControl
        label="Segment"
        options={segmentOptions}
        value={segment}
        onValueChange={(value) => {
          playWowTransition();
          setSegment(value);
        }}
        disabled={availableSegments.length <= 1}
      />
      <ShowcaseControlField fullWidth>
        <ThemeModePicker className={styles.panelSwatches} />
      </ShowcaseControlField>
      {segment === 'dynamic' ? (
        <ShowcaseControlField fullWidth>
          <DynamicColorPicker className={styles.panelSwatches} />
        </ShowcaseControlField>
      ) : null}
    </ShowcaseControlGrid>
  );
}

export function ShowcaseTypographyControls() {
  const [typographySize, setTypographySize] = useState('default');

  return (
    <ShowcaseControlGrid>
      <FontNamePicker className={styles.panelSelect} width="100%" />
      <ShowcaseSelectControl
        label="Size"
        options={typographySizeOptions}
        value={typographySize}
        onValueChange={setTypographySize}
      />
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
      <ShowcaseControlGroup title="Tipografia">
        <ShowcaseTypographyControls />
      </ShowcaseControlGroup>
      <ShowcaseControlGroup title="Iconografia">
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
    </div>
  );
}
