import { css } from '@stitches/core';
import { useEffect, useState } from 'react';
import type { Weight } from '../components/Text';

const cacheMap = new Map<number, string>();

export const useWeight = (value: Weight = 400): string | undefined => {
  const [className, setClassName] = useState<string | undefined>(
    cacheMap.get(value)
  );

  useEffect(() => {
    if (cacheMap.has(value)) {
      setClassName(cacheMap.get(value));
    } else {
      const style = css({ fontWeight: value })().className;
      cacheMap.set(value, style);
      setClassName(style);
    }
  }, [value]);

  return className;
};
