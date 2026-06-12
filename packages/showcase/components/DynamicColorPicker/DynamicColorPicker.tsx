'use client';

import { applyDynamicTheme } from '@kiskadee/runtime';
import { useEffect, useState } from 'react';
import { SwatchRadioGroup } from '@/k-components';

const SEGMENT_COLORS = [
  { value: 'blue', color: '#0091FF', label: 'Blue' }, // iOS
  { value: 'green', color: '#25D366', label: 'Green' }, // WhatsApp
  { value: 'red', color: '#FF0000', label: 'Red' }, // YouTube
  { value: 'purple', color: '#9146FF', label: 'Purple' }, // Twitch
  { value: 'cyan', color: '#1DA1F2', label: 'Cyan' }, // Twitter
  { value: 'orange', color: '#FF5500', label: 'Orange' }, // SoundCloud
  { value: 'brown', color: '#351C15', label: 'Brown' }, // UPS
  { value: 'black', color: '#000000', label: 'Black' } // Uber
];

export default function DynamicColorPicker({ className }: { className?: string }) {
  const [selected, setSelected] = useState(SEGMENT_COLORS[0].value);

  // Apply initial color on mount
  useEffect(() => {
    const segment = SEGMENT_COLORS.find((s) => s.value === selected);
    if (segment) {
      applyDynamicTheme(segment.color);
    }
  }, [selected]);

  const items = SEGMENT_COLORS.map((segment) => ({
    value: segment.value,
    label: segment.label,
    swatch: {
      color: segment.color
    }
  }));

  return (
    <SwatchRadioGroup
      className={className}
      groupLabel="Dynamic Theme Color"
      value={selected}
      onValueChange={setSelected}
      items={items}
      aria-label="Choose dynamic theme color"
    />
  );
}
