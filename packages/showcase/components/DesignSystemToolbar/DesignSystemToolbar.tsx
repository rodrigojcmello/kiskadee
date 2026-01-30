'use client';

import BackgroundTonePicker from '@/components/BackgroundTonePicker/BackgroundTonePicker';
import DesignSystemControls from '@/components/DesignSystemControls/DesignSystemControls';
import ThemeModePicker from '@/components/ThemeModePicker/ThemeModePicker';
import styles from './DesignSystemToolbar.module.scss';

type DesignSystemToolbarProps = {
  showColorScale?: boolean;
  onToggleColorScale?: (next: boolean) => void;
};

export default function DesignSystemToolbar({
  showColorScale,
  onToggleColorScale
}: DesignSystemToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div>
        <DesignSystemControls />
      </div>
      <div>
        <ThemeModePicker />
        <BackgroundTonePicker />
        <label>
          <input
            type="checkbox"
            checked={Boolean(showColorScale)}
            onChange={(event) => onToggleColorScale?.(event.target.checked)}
          />
        </label>
      </div>
    </div>
  );
}
