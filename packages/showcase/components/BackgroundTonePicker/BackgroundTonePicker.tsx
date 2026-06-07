'use client';

import { useEffect, useState } from 'react';
import { useBackgroundTones } from '@/hooks/use-background-tones';
import { SwatchRadioGroup } from '@/k-components';

export default function BackgroundTonePicker() {
  const { defaultToneKey, items } = useBackgroundTones();
  const [selected, setSelected] = useState<string>(defaultToneKey);

  useEffect(() => {
    setSelected(defaultToneKey);
  }, [defaultToneKey]);

  return (
    <SwatchRadioGroup
      groupLabel="Background"
      value={selected}
      onValueChange={setSelected}
      items={items}
      aria-label="Background tone"
    />
  );
}
