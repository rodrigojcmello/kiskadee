'use client';
import { useKiskadee } from '@kiskadee/react-components';
import { FONTS } from '@/app/registry/fonts.registry';
import { Select } from '@/k-components';
import styles from './FontNamePicker.module.scss';

export default function FontNamePicker({
  position = 'inline'
}: {
  position?: 'inline' | 'fixed-right-top';
}) {
  const { fontName, setFontName } = useKiskadee();

  // Convert FONTS to SelectOption format
  const options = FONTS.map((font) => ({
    value: font.key,
    label: <span style={{ fontFamily: font.family, fontWeight: 500 }}>{font.label}</span>
  }));

  return (
    <Select
      options={options}
      value={fontName}
      onValueChange={setFontName}
      className={position === 'fixed-right-top' ? styles.fixed : ''}
    />
  );
}
