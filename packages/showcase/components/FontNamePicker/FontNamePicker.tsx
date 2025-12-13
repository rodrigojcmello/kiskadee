'use client';

import { useShowcase } from '@kiskadee/react-components';
import { toCssFontFamily } from '@kiskadee/web-builder/types';
import { Select } from '@/k-components';
import { FONTS } from '@/registry/fonts.registry';

export default function FontNamePicker() {
  const { fontName, setFontName } = useShowcase();

  // Convert FONTS to SelectOption format
  const options = FONTS.map((font) => ({
    value: font.key,
    label: (
      <span style={{ fontFamily: toCssFontFamily(font.family), fontWeight: 500 }}>
        {font.label}
      </span>
    )
  }));

  return (
    <Select
      label="Font"
      width={160}
      options={options}
      value={fontName}
      onValueChange={setFontName}
    />
  );
}
