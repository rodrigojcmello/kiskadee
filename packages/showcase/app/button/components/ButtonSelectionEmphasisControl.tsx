'use client';

import type { ButtonSelectionEmphasis } from '@kiskadee/core';
import type { SelectProps } from '@kiskadee/react-components/select';
import { ShowcaseContentSelectControl } from '@/components/ShowcaseControls';

const SELECTION_EMPHASIS_OPTIONS: Array<{ value: ButtonSelectionEmphasis; label: string }> = [
  { value: 'lowest', label: 'Lowest' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export function ButtonSelectionEmphasisControl({
  descriptionId,
  disabled = false,
  loop,
  onValueChange,
  sequential,
  size,
  value,
  width = '200px'
}: {
  descriptionId?: string;
  disabled?: boolean;
  loop?: boolean;
  onValueChange: (value: ButtonSelectionEmphasis) => void;
  sequential?: boolean;
  size?: SelectProps['size'];
  value: ButtonSelectionEmphasis;
  width?: string;
}) {
  return (
    <ShowcaseContentSelectControl
      label="Selection emphasis"
      aria-describedby={descriptionId}
      disabled={disabled}
      variant={sequential ? 'sequential' : 'standard'}
      loop={loop}
      size={size}
      value={value}
      onValueChange={(next) => onValueChange(next as ButtonSelectionEmphasis)}
      options={SELECTION_EMPHASIS_OPTIONS}
      width={width}
      maxWidth="100%"
    />
  );
}
