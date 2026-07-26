'use client';

import type { ThemeMode } from '@kiskadee/core';
import type { IconProps } from '@kiskadee/icons/kiskadee';
import { MoonIcon } from '@kiskadee/icons/kiskadee/MoonIcon';
import { MoonStarsIcon } from '@kiskadee/icons/kiskadee/MoonStarsIcon';
import { SunIcon } from '@kiskadee/icons/kiskadee/SunIcon';
import { useKiskadee, useShowcase } from '@kiskadee/react-components';
import type { ComponentType } from 'react';
import { ShowcaseSegmentedControl } from '../ShowcaseControls';
import styles from './ThemeModePicker.module.scss';

const OPTIONS: ReadonlyArray<{
  Icon: ComponentType<IconProps>;
  label: string;
  value: ThemeMode;
}> = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonStarsIcon },
  { value: 'darker', label: 'Darker', Icon: MoonIcon }
];

export default function ThemeModePicker({ className }: { className?: string }) {
  const { theme, setTheme } = useKiskadee();
  const { availableThemes } = useShowcase();
  const options = OPTIONS.filter((option) => availableThemes.includes(option.value)).map(
    ({ Icon, label, value }) => ({
      value,
      label: (
        <span className={styles.optionContent}>
          <Icon className={styles.icon} />
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
