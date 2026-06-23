'use client';

import { ShowcaseBooleanControl } from '@/components/ShowcaseControls';
import styles from './ShowcaseFooter.module.scss';

type ShowcaseFooterProps = {
  onToggleColorScale: (next: boolean) => void;
  showColorScale: boolean;
};

export default function ShowcaseFooter({
  onToggleColorScale,
  showColorScale
}: ShowcaseFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <ShowcaseBooleanControl
          className={styles.colorSchema}
          label="Color schema"
          checked={showColorScale}
          onCheckedChange={onToggleColorScale}
        />
      </div>
    </footer>
  );
}
