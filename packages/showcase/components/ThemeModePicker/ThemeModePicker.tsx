'use client';
import type { ThemeMode } from '@kiskadee/core';
import { useKiskadee, useShowcase } from '@kiskadee/react-components';
import { SwatchRadioGroup } from '@/k-components';
import { playWowTransition } from '@/utils/playWowTransition';
import { Icon, type IconName } from '../Icon/Icon';

/*
  ThemeModePicker: mirrors BackgroundTonePicker identity
  Icons mapping (per request):
  - light  → sun
  - dark   → full moon (céu mais claro)
  - darker → bright crescent moon (lua "mordida")
*/

const OPTIONS: Array<{
  key: ThemeMode;
  label: string;
  aria: string;
}> = [
  { key: 'light', label: 'Light', aria: 'Light theme' },
  { key: 'dark', label: 'Dark', aria: 'Dark theme' },
  { key: 'darker', label: 'Darker', aria: 'Darker theme' }
];

export default function ThemeModePicker() {
  const { theme, setTheme } = useKiskadee();
  const { availableThemes } = useShowcase();

  const visibleOptions = OPTIONS.filter((o) => availableThemes.includes(o.key));

  const iconFor = (mode: ThemeMode): IconName => {
    switch (mode) {
      case 'light':
        return 'SunMax';
      case 'dark':
        return 'MoonStars';
      case 'darker':
        return 'Moon';
      default:
        return 'SunMax';
    }
  };

  return (
    <SwatchRadioGroup
      groupLabel="Theme"
      aria-label="Theme mode"
      value={theme}
      items={visibleOptions.map((opt) => ({
        value: opt.key,
        label: opt.label
      }))}
      showItemLabels
      onBeforeValueChange={() => {
        playWowTransition();
      }}
      onValueChange={(value) => {
        setTheme(value as ThemeMode);
      }}
      renderSwatch={(item) => (
        <Icon name={iconFor(item.value as ThemeMode)} aria-hidden="true" focusable="false" />
      )}
    />
  );
}
