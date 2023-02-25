import { css } from '@stitches/core';
import { useEffect, useState } from 'react';
import type { BreakpointKey, SizeResponsive } from '../../utils';

const cacheMap = new Map<number | string, string>();

const breakpoints: Record<BreakpointKey, number> = {
  small1: 0,
  small2: 321,
  small3: 376,

  medium1: 481,
  medium2: 641,
  medium3: 769,

  big1: 1025,
  big2: 1281,
  big3: 1441,
};

export const useLineHeight = (
  // eslint-disable-next-line default-param-last
  value = 16 * 1.5,
  responsive?: SizeResponsive<number>
): (string | undefined)[] => {
  const keyMain = value;
  const keyCombo = `${value}:${JSON.stringify(responsive)}`;

  const [mainClass, setMainClass] = useState<string | undefined>(
    cacheMap.get(keyMain)
  );
  const [comboClass, setComboClass] = useState<string | undefined>(
    cacheMap.get(keyCombo)
  );

  useEffect(() => {
    if (cacheMap.has(keyMain)) {
      setMainClass(cacheMap.get(keyMain));
    } else {
      const style = css({
        lineHeight: `${value / 16}rem`,
      })().className;
      cacheMap.set(keyMain, style);
      setMainClass(style);
    }
  }, [keyMain]);

  useEffect(() => {
    if (cacheMap.has(keyCombo)) {
      setComboClass(cacheMap.get(keyCombo));
    } else if (mainClass && responsive) {
      const mediaQueries: Record<string, Record<string, string>> = {};

      for (const breakpoint of Object.keys(responsive)) {
        const fontSize = responsive?.[breakpoint as BreakpointKey];
        const mediaQuery = breakpoints[breakpoint as BreakpointKey];

        if (mediaQuery && fontSize) {
          mediaQueries[`@media (min-width: ${mediaQuery}px)`] = {
            lineHeight: `${fontSize / 16}rem`,
          };
        }
      }

      const style = css({
        [`&.${mainClass}`]: mediaQueries,
      })().className;

      cacheMap.set(keyCombo, style);
      setComboClass(style);
    }
  }, [keyCombo, mainClass]);

  return [mainClass, comboClass];
};