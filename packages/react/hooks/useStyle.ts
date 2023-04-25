import { css, globalCss } from '@stitches/core';
import { useEffect, useState } from 'react';

export function useStyle(
  cacheMap: Map<string | undefined, string>,
  main: {
    key?: string;
    style: Record<string, string | number>;
  },
  combo?: {
    key: string;
    style: Record<string, string | number>;
    type: 'color' | 'spacing';
  }
): (string | undefined)[] {
  const keyMain = main.key;
  const keyCombo = `${keyMain}:${JSON.stringify(combo?.key)}`;

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
      const style = css(main.style)().className;
      cacheMap.set(keyMain, style);
      setMainClass(style);
    }
  }, [keyMain]);

  useEffect(() => {
    if (combo?.type === 'color') {
      if (cacheMap.has(keyCombo)) {
        setComboClass(cacheMap.get(keyCombo));
      } else if (mainClass && combo?.style) {
        globalCss({
          [`.d.${mainClass}`]: {
            '@media (prefers-color-scheme: dark)': combo.style,
          },
        })();
        cacheMap.set(keyCombo, 'd');
        setComboClass('d');
      }
    }
  }, [keyCombo, mainClass]);

  // console.log({ mainClass, main, combo });

  return [mainClass, comboClass];
}
