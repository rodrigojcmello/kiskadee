'use client';
import { useKiskadee } from '@kiskadee/react-components';
import { Select } from '@/k-components';
import { playWowTransition } from '@/utils/playWowTransition';
import styles from './DesignSystemControls.module.scss';

export default function DesignSystemControls() {
  const {
    designSystem,
    setDesignSystem,
    designSystemKeys,
    designSystemMeta,
    segment,
    setSegment,
    availableSegments
  } = useKiskadee();

  const designSystemOptions = designSystemKeys.map((key) => ({
    value: key,
    label: designSystemMeta[key]?.displayName || key
  }));

  const segmentOptions = availableSegments.map((s) => ({
    value: s,
    label: s
  }));

  return (
    <div className={styles.container}>
      {/* 1. Design system selector */}
      <div className={styles.group}>
        <span className={styles.label}>Design System</span>
        <Select
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
        <span className={styles.label}>Segment</span>
        <Select
          options={segmentOptions}
          value={segment}
          onValueChange={(value) => {
            playWowTransition();
            setSegment(value);
          }}
          disabled={availableSegments.length <= 1}
        />
      </div>
    </div>
  );
}
