'use client';
import { useKiskadee, useShowcase } from '@kiskadee/react-components';
import DynamicColorPicker from '@/components/DynamicColorPicker/DynamicColorPicker';
import FontNamePicker from '@/components/FontNamePicker/FontNamePicker';
import { Select } from '@/k-components';
import { playWowTransition } from '@/utils/playWowTransition';
import styles from './DesignSystemControls.module.scss';

type DesignSystemControlsProps = {
  variant?: 'toolbar' | 'panel';
};

export default function DesignSystemControls({ variant = 'toolbar' }: DesignSystemControlsProps) {
  const { designSystem, setDesignSystem, segment, setSegment } = useKiskadee();
  const { designSystemKeys, availableSegments, designSystemList } = useShowcase();
  const isPanel = variant === 'panel';

  const displayNameByKey = new Map<string, string>(
    designSystemList.map((entry) => [entry.key, entry.displayName])
  );

  const designSystemOptions = designSystemKeys.map((key) => ({
    value: key,
    label: displayNameByKey.get(key) ?? key
  }));

  const segmentOptions = availableSegments.map((s) => ({
    value: s,
    label: s
  }));

  return (
    <div className={`${styles.container} ${isPanel ? styles.panelContainer : ''}`.trim()}>
      {/* 1. Design system selector */}
      <div className={styles.group}>
        <Select
          className={isPanel ? styles.panelSelect : undefined}
          label="Design System"
          width={isPanel ? '100%' : 220}
          options={designSystemOptions}
          value={designSystem}
          onValueChange={(value) => {
            playWowTransition();
            setDesignSystem(value);
          }}
        />
      </div>

      {/* 2. Segment selector (Brand/Product) */}
      <div className={styles.group}>
        <Select
          className={isPanel ? styles.panelSelect : undefined}
          label="Segment"
          width={isPanel ? '100%' : 160}
          options={segmentOptions}
          value={segment}
          onValueChange={(value) => {
            playWowTransition();
            setSegment(value);
          }}
          disabled={availableSegments.length <= 1}
        />
      </div>

      {/* 3. Dynamic theme color picker (only for "dynamic" segment) */}
      {segment === 'dynamic' && (
        <div className={`${styles.group} ${isPanel ? styles.panelFull : ''}`.trim()}>
          <DynamicColorPicker className={isPanel ? styles.panelSwatches : undefined} />
        </div>
      )}

      <div className={styles.group}>
        <FontNamePicker
          className={isPanel ? styles.panelSelect : undefined}
          width={isPanel ? '100%' : 160}
        />
      </div>
    </div>
  );
}
