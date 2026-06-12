'use client';

import ShowcaseGlobalControls from '@/components/DesignSystemControls/ShowcaseGlobalControls';
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
      <ShowcaseGlobalControls
        variant="toolbar"
        showColorScale={Boolean(showColorScale)}
        onToggleColorScale={(next) => onToggleColorScale?.(next)}
      />
    </div>
  );
}
