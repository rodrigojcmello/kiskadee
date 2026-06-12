'use client';

import { useShowcase } from '@kiskadee/react-components';
import { toCssFontFamily } from '@kiskadee/web-builder/types';
import { Select } from '@/k-components';
import { FONTS } from '@/registry/fonts.registry';

export default function FontNamePicker({
  className,
  width = 160
}: {
  className?: string;
  width?: number | string;
}) {
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
      className={className}
      label="Font"
      width={width}
      options={options}
      value={fontName}
      onValueChange={setFontName}
    />
  );
}
