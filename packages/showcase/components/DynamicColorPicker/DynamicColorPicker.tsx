'use client';

import { ColorRadioGroup } from '@kiskadee/react-headless';
import { applyDynamicTheme } from '@kiskadee/runtime';
import { useEffect, useState } from 'react';
import styles from './DynamicColorPicker.module.scss';

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

export default function DynamicColorPicker() {
  const [selected, setSelected] = useState(SEGMENT_COLORS[0].value);

  const handleColorChange = (value: string) => {
    setSelected(value);
  };

  // Apply initial color on mount
  useEffect(() => {
    const segment = SEGMENT_COLORS.find((s) => s.value === selected);
    if (segment) {
      applyDynamicTheme(segment.color);
    }
  }, [selected]);

  const items = SEGMENT_COLORS.map((segment) => ({
    value: segment.value,
    color: segment.color,
    label: segment.label
  }));

  return (
    <div className={styles.container}>
      <span className={styles.label}>Dynamic Theme Color</span>
      <ColorRadioGroup
        value={selected}
        onValueChange={handleColorChange}
        items={items}
        aria-label="Choose dynamic theme color"
        classNames={{
          e1: styles.fieldset,
          e2: styles.swatches,
          e3: styles.swatch,
          e4: styles.input,
          e5: styles.dot,
          e5a: styles.selected
        }}
      />
    </div>
  );
}
