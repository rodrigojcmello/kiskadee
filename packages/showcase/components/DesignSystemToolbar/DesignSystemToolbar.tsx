'use client';

import BackgroundTonePicker from '@/components/BackgroundTonePicker/BackgroundTonePicker';
import DesignSystemControls from '@/components/DesignSystemControls/DesignSystemControls';
import FontNamePicker from '@/components/FontNamePicker/FontNamePicker';
import ThemeModePicker from '@/components/ThemeModePicker/ThemeModePicker';
import styles from './DesignSystemToolbar.module.scss';

export default function DesignSystemToolbar() {
  return (
    <>
      <div className={styles.left}>
        <DesignSystemControls />
      </div>
      <div className={styles.right}>
        <ThemeModePicker />
        <BackgroundTonePicker />
        <FontNamePicker />
      </div>
    </>
  );
}
