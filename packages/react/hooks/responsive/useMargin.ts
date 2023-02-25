import { css } from '@stitches/core';
import { useEffect, useState } from 'react';
import type { BreakpointKey, SizeResponsive, SpacingValue } from '../../utils';
import { breakpoints } from '../../utils';

const cacheMap = new Map<number | string, string>();

export const useMargin = (
  value?: SpacingValue,
  responsive?: SizeResponsive<SpacingValue>
): (string | undefined)[] => {
  const mainKey = `${value?.top || 0}:${value?.right || 0}:${
    value?.bottom || 0
  }:${value?.left || 0}`;
  const responsiveKey = `${mainKey}:${JSON.stringify(responsive)}`;

  const [mainClass, setMainClass] = useState<string | undefined>(
    cacheMap.get(mainKey)
  );

  const [responsiveClass, setResponsiveClass] = useState<string | undefined>(
    cacheMap.get(JSON.stringify(value))
  );

  useEffect(() => {
    if (cacheMap.has(mainKey)) {
      setMainClass(cacheMap.get(mainKey));
    } else {
      const style = css({
        marginTop: value?.top || 0,
        marginRight: value?.right || 0,
        marginBottom: value?.bottom || 0,
        marginLeft: value?.left || 0,
      })().className;
      cacheMap.set(mainKey, style);
      setMainClass(style);
    }
  }, [mainKey]);

  useEffect(() => {
    if (responsiveClass && cacheMap.has(responsiveClass)) {
      setResponsiveClass(cacheMap.get(responsiveClass));
    } else if (mainClass && responsive) {
      const mediaQueries: Record<string, Record<string, number>> = {};

      for (const breakpoint of Object.keys(responsive)) {
        const property = responsive?.[breakpoint as BreakpointKey];
        const mediaQuery = breakpoints[breakpoint as BreakpointKey];

        if (mediaQuery && property) {
          mediaQueries[`@media (min-width: ${mediaQuery}px)`] = {
            marginTop: property?.top || 0,
            marginRight: property?.right || 0,
            marginBottom: property?.bottom || 0,
            marginLeft: property?.left || 0,
          };
        }
      }

      const style = css({
        [`&.${mainClass}`]: mediaQueries,
      })().className;

      cacheMap.set(responsiveKey, style);
      setResponsiveClass(style);
    }
  }, [responsiveKey, mainClass]);

  return [mainClass, responsiveClass];
};
