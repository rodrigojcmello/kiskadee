'use client';

import type { ThemeMode } from '@kiskadee/core';
import {
  FamilyResolvedIcon,
  type IconName,
  useKiskadee,
  useShowcase
} from '@kiskadee/react-components';
import { ShowcaseSegmentedControl } from '../ShowcaseControls';
import styles from './ThemeModePicker.module.scss';

const OPTIONS: ReadonlyArray<{
  icon: IconName;
  label: string;
  value: ThemeMode;
}> = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon-star' },
  { value: 'darker', label: 'Darker', icon: 'moon' }
];

export default function ThemeModePicker({ className }: { className?: string }) {
  const { theme, setTheme } = useKiskadee();
  const { availableThemes } = useShowcase();
  const options = OPTIONS.filter((option) => availableThemes.includes(option.value)).map(
    ({ icon, label, value }) => ({
      value,
      label: (
        <span className={styles.optionContent}>
          <span className={styles.icon}>
            <FamilyResolvedIcon name={icon} />
          </span>
          <span>{label}</span>
        </span>
      )
    })
  );

  return (
    <ShowcaseSegmentedControl
      className={className}
      label="Theme"
      options={options}
      value={theme}
      onValueChange={(value) => setTheme(value as ThemeMode)}
    />
  );
}
