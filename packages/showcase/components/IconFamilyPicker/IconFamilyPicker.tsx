'use client';

import { interfaceIconFamilyOptions } from '@kiskadee/icons/interface/catalog';
import { useShowcase } from '@kiskadee/react-components';
import { Select } from '@/k-components';

type IconPickerProps = {
  className?: string;
  width?: number | string;
};

const ICON_FAMILY_SELECTION_SEPARATOR = '::';
const iconFamilySelectionOptions = interfaceIconFamilyOptions.flatMap((family) =>
  family.variants.map((variant) => ({
    value: `${family.id}${ICON_FAMILY_SELECTION_SEPARATOR}${variant.id}`,
    label: `${family.label} — ${variant.label}`,
    familyId: family.id,
    variantId: variant.id
  }))
);
const iconFamilySelectionByValue = new Map(
  iconFamilySelectionOptions.map((option) => [option.value, option])
);

export default function IconFamilyPicker({ className, width = 160 }: IconPickerProps) {
  const { iconFamilyFallbackFor, iconFamilyId, iconVariantId, setIconFamilySelection } =
    useShowcase();
  const value = `${iconFamilyId}${ICON_FAMILY_SELECTION_SEPARATOR}${iconVariantId}`;
  const options = iconFamilySelectionOptions.map((option) => ({
    value: option.value,
    label:
      option.value === value && iconFamilyFallbackFor === 'sf-symbols'
        ? `${option.label} (fallback for SF Symbols)`
        : option.label
  }));

  return (
    <Select
      className={className}
      label="Icon family"
      width={width}
      options={options}
      value={value}
      variant="sequential"
      onValueChange={(nextValue) => {
        const selection = iconFamilySelectionByValue.get(nextValue);
        if (selection) {
          setIconFamilySelection(selection.familyId, selection.variantId);
        }
      }}
    />
  );
}
