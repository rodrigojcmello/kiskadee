import { css } from '@stitches/core';
import type { GenericCSSProperties, StitchesProperties } from '../Button';

export const TextStyle = {
  // textElementContainer() {
  //   return {
  //     color: TextStyle.containerColor(),
  //   };
  // }

  render(properties: GenericCSSProperties): string | undefined {
    const validProperties = Object.keys(properties).length > 0;

    /**
     * Empty objects generates a css class empty in Stitches library
     */
    if (validProperties) {
      return css(properties as StitchesProperties)().className;
    }
  },

  // TODO: add support to token color
  color(hexLight?: string, hexDark?: string): string | undefined {
    return TextStyle.render({
      color: hexLight || '#000',
      '@media (prefers-color-scheme: dark)': hexDark
        ? {
            color: hexDark,
          }
        : undefined,
    });
  },

  weight(
    value?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  ): string | undefined {
    return TextStyle.render({
      fontWeight: value || 400,
    });
  },

  italic(value?: boolean): string | undefined {
    if (value) {
      return TextStyle.render({
        fontStyle: 'italic',
      });
    }
  },
};
