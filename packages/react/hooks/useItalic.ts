import { css } from '@stitches/core';
import { useEffect, useState } from 'react';

const cacheMap = new Map<boolean, string>();

export const useItalic = (value = false): string | undefined => {
  const [className, setClassName] = useState<string | undefined>(
    cacheMap.get(value)
  );

  useEffect(() => {
    if (cacheMap.has(value)) {
      setClassName(cacheMap.get(value));
    } else {
      const style = css({ fontStyle: value ? 'italic' : 'normal' })().className;
      cacheMap.set(value, style);
      setClassName(style);
    }
  }, [value]);

  return className;
};
