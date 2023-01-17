import { css } from '@stitches/core';
import { useEffect, useState } from 'react';

const cacheMap = new Map<string, string>();

export const useColor = (
  // eslint-disable-next-line default-param-last
  hexLight = '#000',
  hexDark?: string
): (string | undefined)[] => {
  const keyMain = hexLight;
  const keyCombo = `${hexLight}:${hexDark}`;

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
        color: hexLight,
      })().className;
      cacheMap.set(keyMain, style);
      setMainClass(style);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyMain]);

  useEffect(() => {
    if (cacheMap.has(keyCombo)) {
      setComboClass(cacheMap.get(keyCombo));
    } else if (mainClass && hexDark) {
      const style = css({
        [`&.${mainClass}`]: {
          '@media (prefers-color-scheme: dark)': {
            color: hexDark,
          },
        },
      })().className;
      cacheMap.set(keyCombo, style);
      setComboClass(style);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyCombo, mainClass]);

  return [mainClass, comboClass];
};
