'use client';

import type { ThemeMode } from '@kiskadee/core';
import type { IconName } from '@kiskadee/react-components';
import { FamilyResolvedIcon } from '@kiskadee/react-components/icon';
import { useKiskadee, useShowcase } from '@kiskadee/react-components/resources';
import { ShowcaseSegmentedControl } from '../ShowcaseControls';
import styles from './ThemeModePicker.module.scss';

const OPTIONS: ReadonlyArray<{
  icon: IconName;
  label: string;
  value: ThemeMode;
}> = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'darker', label: 'Darker', icon: 'moon-star' }
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
