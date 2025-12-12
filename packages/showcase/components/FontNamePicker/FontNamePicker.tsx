'use client';

import { useShowcase } from '@kiskadee/react-components';
import { useEffect } from 'react';
import { Select } from '@/k-components';
import { FONTS } from '@/registry/fonts.registry';
import styles from './FontNamePicker.module.scss';

export default function FontNamePicker({
  position = 'inline'
}: {
  position?: 'inline' | 'fixed-right-top';
}) {
  const { fontName, setFontName } = useShowcase();

  // Convert FONTS to SelectOption format
  const options = FONTS.map((font) => ({
    value: font.key,
    label: <span style={{ fontFamily: font.family, fontWeight: 500 }}>{font.label}</span>
  }));

  useEffect(() => {
    const font = FONTS.find((f) => f.key === fontName) ?? FONTS[0];
    document.documentElement.style.setProperty('--k-font-body', font.family);
  }, [fontName]);

  return (
    <Select
      options={options}
      value={fontName}
      onValueChange={setFontName}
      className={position === 'fixed-right-top' ? styles.fixed : ''}
    />
  );
}
