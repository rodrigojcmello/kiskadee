import { css } from '@stitches/core';
import { useEffect, useState } from 'react';
import type { TextAlign } from '../components/Text';

const cacheMap = new Map<string, string>();

export const useTextAlign = (value: TextAlign = 'left'): string | undefined => {
  const [className, setClassName] = useState<string | undefined>(
    cacheMap.get(value)
  );

  useEffect(() => {
    if (cacheMap.has(value)) {
      setClassName(cacheMap.get(value));
    } else {
      const style = css({ textAlign: value })().className;
      cacheMap.set(value, style);
      setClassName(style);
    }
  }, [value]);

  return className;
};
