import { css } from '@stitches/core';
import { useEffect, useState } from 'react';

const cacheMap = new Map<string | number, string>();

export const useGenericSimpleProperty = (
  value: string,
  property: string
): string | undefined => {
  const [className, setClassName] = useState<string | undefined>(
    cacheMap.get(value)
  );

  useEffect(() => {
    if (cacheMap.has(value)) {
      setClassName(cacheMap.get(value));
    } else {
      const style = css({ [property]: value })().className;
      cacheMap.set(value, style);
      setClassName(style);
    }
  }, [value]);

  return className;
};
