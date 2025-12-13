'use client';

import BackgroundTonePicker from '@/components/BackgroundTonePicker/BackgroundTonePicker';
import DesignSystemControls from '@/components/DesignSystemControls/DesignSystemControls';
import ThemeModePicker from '@/components/ThemeModePicker/ThemeModePicker';
import styles from './DesignSystemToolbar.module.scss';

export default function DesignSystemToolbar() {
  return (
    <div className={styles.toolbar}>
      <div>
        <DesignSystemControls />
      </div>
      <div>
        <ThemeModePicker />
        <BackgroundTonePicker />
      </div>
    </div>
  );
}
