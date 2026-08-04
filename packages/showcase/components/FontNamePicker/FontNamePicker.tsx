'use client';

import { useFontFamilyStatus, useKiskadee, useShowcase } from '@kiskadee/react-components';
import { Select } from '@/k-components';
import { createFontSelectionOptions, MIXED_FONT_KEY } from '@/utils/font-family-selection';

export default function FontNamePicker({
  className,
  width = 160
}: {
  className?: string;
  width?: number | string;
}) {
  const { fontName, setFontName } = useShowcase();
  const { global } = useKiskadee();
  const { familyResolutions } = useFontFamilyStatus();

  const options = [
    ...(fontName === MIXED_FONT_KEY
      ? [{ value: MIXED_FONT_KEY, label: 'Mixed roles', disabled: true }]
      : []),
    ...createFontSelectionOptions('body', global?.fonts, familyResolutions)
  ];

  return (
    <Select
      className={className}
      label="Font family"
      width={width}
      options={options}
      value={fontName}
      onValueChange={setFontName}
    />
  );
}
