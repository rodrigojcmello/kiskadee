'use client';

import ShowcaseGlobalControls from '@/components/DesignSystemControls/ShowcaseGlobalControls';
import styles from './DesignSystemToolbar.module.scss';

export default function DesignSystemToolbar({
  isDesktopSidebarVisible
}: {
  isDesktopSidebarVisible: boolean;
}) {
  return (
    <div
      className={`${styles.toolbar} ${
        isDesktopSidebarVisible ? '' : styles.toolbarWithoutSidebar
      }`.trim()}
    >
      <ShowcaseGlobalControls variant="toolbar" />
    </div>
  );
}
