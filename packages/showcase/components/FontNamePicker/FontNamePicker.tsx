'use client';
import { Select } from '@kiskadee/react-headless';
import { useKiskadee } from '@kiskadee/react-components';
import { Icon } from '../Icon/Icon';
import styles from './FontNamePicker.module.scss';
import { FONTS } from '../../app/registry/fonts.registry';

export default function FontNamePicker({
  position = 'inline'
}: {
  position?: 'inline' | 'fixed-right-top';
}) {
  const { fontName, setFontName } = useKiskadee();

  const selectedFont = FONTS.find((f) => f.key === fontName) || FONTS[0];

  // Convert FONTS to SelectOption format
  const options = FONTS.map((font) => ({
    value: font.key,
    label: font.label
  }));

  return (
    <Select.Root
      options={options}
      value={fontName}
      onValueChange={setFontName}
      classNames={{
        e1: `${styles.container} ${position === 'fixed-right-top' ? styles.fixed : ''}`,
        e2: styles.trigger,
        e3: styles.dropdown,
        e4: styles.option,
        e4a: `${styles.option} ${styles.selected}`
      }}
    >
      <Select.Trigger>
        <span className={styles.triggerLabel} style={{ fontFamily: selectedFont.family }}>
          {selectedFont.label}
        </span>
        <Icon name="ChevronDown" className={styles.chevron} />
      </Select.Trigger>

      <Select.Content>
        {FONTS.map((font) => (
          <Select.Option key={font.key} value={font.key}>
            <span style={{ fontFamily: font.family }}>{font.label}</span>
          </Select.Option>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
