'use client';

import { interfaceIconFamilyOptions } from '@kiskadee/icons/interface/catalog';
import { useIconFamilyStatus, useShowcase } from '@kiskadee/react-components';
import { Select } from '@/k-components';

export default function IconFamilyPicker({
  className,
  width = 160
}: {
  className?: string;
  width?: number | string;
}) {
  const { iconFamilyId, setIconFamilyId } = useShowcase();
  const { fallbackFor } = useIconFamilyStatus();
  const options = interfaceIconFamilyOptions.map((entry) => ({
    value: entry.id,
    label:
      entry.id === iconFamilyId && fallbackFor === 'sf-symbols'
        ? `${entry.label} (fallback for SF Symbols)`
        : entry.label
  }));

  return (
    <Select
      className={className}
      label="Icon family"
      width={width}
      options={options}
      value={iconFamilyId}
      onValueChange={setIconFamilyId}
    />
  );
}
