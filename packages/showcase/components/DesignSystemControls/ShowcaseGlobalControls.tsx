'use client';

import {
  ShowcaseBooleanControl,
  ShowcaseControlGroup,
  ShowcaseControlPanel,
  ShowcaseControlStack
} from '@/components/ShowcaseControls';
import ThemeModePicker from '@/components/ThemeModePicker/ThemeModePicker';
import DesignSystemControls from './DesignSystemControls';
import styles from './ShowcaseGlobalControls.module.scss';

type ShowcaseGlobalControlsProps = {
  onToggleColorScale: (next: boolean) => void;
  showColorScale: boolean;
  variant: 'toolbar' | 'panel';
};

export default function ShowcaseGlobalControls({
  onToggleColorScale,
  showColorScale,
  variant
}: ShowcaseGlobalControlsProps) {
  if (variant === 'panel') {
    return (
      <ShowcaseControlPanel>
        <ShowcaseControlGroup title="Preset">
          <DesignSystemControls variant="panel" />
        </ShowcaseControlGroup>
        <ShowcaseControlGroup title="Theme">
          <div className={styles.panelTheme}>
            <ThemeModePicker className={styles.panelThemePicker} />
            <ShowcaseControlStack>
              <ShowcaseBooleanControl
                label="Color scale"
                checked={showColorScale}
                onCheckedChange={onToggleColorScale}
              />
            </ShowcaseControlStack>
          </div>
        </ShowcaseControlGroup>
      </ShowcaseControlPanel>
    );
  }

  return (
    <div className={styles.toolbarLayout}>
      <DesignSystemControls />
      <div className={styles.toolbarSecondary}>
        <ThemeModePicker />
        <ShowcaseBooleanControl
          className={styles.toolbarColorScale}
          label="Color scale"
          checked={showColorScale}
          onCheckedChange={onToggleColorScale}
        />
      </div>
    </div>
  );
}
