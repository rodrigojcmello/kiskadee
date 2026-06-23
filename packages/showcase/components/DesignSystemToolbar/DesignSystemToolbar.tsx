'use client';

import ShowcaseGlobalControls from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import styles from './DesignSystemToolbar.module.scss';

export default function DesignSystemToolbar() {
  return (
    <div className={styles.toolbar}>
      <ShowcaseGlobalControls variant="toolbar" />
    </div>
  );
}
