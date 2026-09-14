'use client';

import { RotateCcw } from 'lucide-react';
import { useShowcaseDensity } from '@/app/ShowcaseDensityContext';
import { Select } from '@/k-components';
import { playWowTransition } from '@/utils/playWowTransition';
import styles from './ShowcaseGlobalControls.module.scss';

export function ShowcaseDensityControl() {
  const { densityMap, densityOverride, activeDensity, setDensityOverride } = useShowcaseDensity();
  const available = Boolean(densityMap?.c || densityMap?.r || densityMap?.s);
  return (
    <div className={styles.densityControl} data-showcase-density>
      <Select
        label="Density"
        className={styles.toolbarSelect}
        width="100%"
        minWidth={0}
        value={available ? activeDensity : '—'}
        options={[
          { value: 'spacious', label: 'Mobile', disabled: !densityMap?.s },
          { value: 'regular', label: 'Tablet', disabled: !densityMap?.r },
          { value: 'compact', label: 'Desktop', disabled: !densityMap?.c }
        ]}
        onValueChange={(value) => {
          if (!available || value === densityOverride) return;
          playWowTransition();
          setDensityOverride(value as 'compact' | 'regular' | 'spacious');
        }}
      />
      {densityOverride && densityOverride !== 'adaptive' ? (
        <button
          type="button"
          className={styles.densityReset}
          aria-label="Restore automatic density"
          title="Follow window automatically"
          onClick={() => {
            playWowTransition();
            setDensityOverride(undefined);
          }}
        >
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
