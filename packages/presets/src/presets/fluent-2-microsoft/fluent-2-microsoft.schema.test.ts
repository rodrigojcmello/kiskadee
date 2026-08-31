import { validateSchemaForegroundsContract } from '@kiskadee/core/foreground-contract';
import { describe, expect, it } from 'vitest';
import { schema } from './fluent-2-microsoft.schema.ts';

describe('Fluent 2 Microsoft typography', () => {
  it('publishes the Fluent Web stacks through semantic font roles', () => {
    expect(schema.global?.fonts).toEqual({
      families: {
        'segoe-ui': {
          stack: [
            'Segoe UI',
            'Segoe UI Web (West European)',
            'Open Sans',
            '-apple-system',
            'BlinkMacSystemFont',
            'Roboto',
            'Helvetica Neue',
            'sans-serif'
          ]
        },
        'fluent-monospace': {
          stack: ['Consolas', 'Courier New', 'Courier', 'monospace']
        }
      },
      roles: {
        body: 'segoe-ui',
        code: 'fluent-monospace'
      }
    });
  });

  it('publishes the regular 16/22 body-large profile used by large Dropdown items', () => {
    expect(schema.global?.typography?.profiles['body-large']).toEqual({
      decorations: { textFont: 'body', textWeight: 'normal' },
      scales: { textSize: 16, textHeight: 22 }
    });
  });

  it('publishes legibility-adapted micro Caption Strong profiles for compact metadata', () => {
    expect(schema.global?.typography?.profiles['caption-tiny-strong']).toEqual({
      decorations: { textFont: 'body', textWeight: 'semiBold' },
      scales: { textSize: 6, textHeight: 6 }
    });
    expect(schema.global?.typography?.profiles['caption-extra-small-strong']).toEqual({
      decorations: { textFont: 'body', textWeight: 'semiBold' },
      scales: { textSize: 8, textHeight: 8 }
    });
  });
});

describe('Fluent 2 Microsoft Text foreground', () => {
  it('publishes the complete neutral matrix for every theme and Surface Context', () => {
    expect(() => validateSchemaForegroundsContract(schema)).not.toThrow();
    expect(schema.components.text?.elements.e1.foreground).toEqual({
      neutral: 'neutral',
      blue: 'blue',
      red: 'red',
      green: 'green',
      purple: 'purple',
      orange: 'orange',
      yellow: 'yellow'
    });

    const palettes = schema.global?.foregrounds?.profiles.neutral?.palettes.default;
    expect(palettes?.light).toEqual({
      onSubtle: {
        medium: { rest: '#21242d' },
        low: { rest: '#5d616b' },
        lowest: { rest: '#cdd1de' }
      },
      onVivid: {
        medium: { rest: '#ffffff' },
        low: { rest: '#ffffffad' },
        lowest: { rest: '#ffffff3d' }
      }
    });

    const dark = {
      onSubtle: {
        medium: { rest: '#ffffff' },
        low: { rest: '#b0b4c0' },
        lowest: { rest: '#555965' }
      },
      onVivid: {
        medium: { rest: '#ffffff' },
        low: { rest: '#ffffffad' },
        lowest: { rest: '#ffffff3d' }
      }
    };
    expect(palettes?.dark).toEqual(dark);
    expect(palettes?.darker).toEqual(dark);
  });

  it('publishes every available Fluent hue with one shared three-level formula', () => {
    const expected = {
      blue: {
        light: '#0064b4',
        dark: '#79b9ff',
        vivid: '#d3e7ff'
      },
      red: {
        light: '#c50f1f',
        dark: '#ff958b',
        vivid: '#ffdbd7'
      },
      green: {
        light: '#107c10',
        dark: '#7ec879',
        vivid: '#d4edd2'
      },
      purple: {
        light: '#c239b3',
        dark: '#eb94dd',
        vivid: '#f8daf2'
      },
      orange: {
        light: '#f7630c',
        dark: '#f49d79',
        vivid: '#ffdccf'
      },
      yellow: {
        light: '#eaa300',
        dark: '#d1af7c',
        vivid: '#f6e2c4'
      }
    } as const;

    const emphases = (color: string) => ({
      medium: { rest: color },
      low: { rest: `${color}ad` },
      lowest: { rest: `${color}3d` }
    });

    for (const [foreground, colors] of Object.entries(expected)) {
      const palettes = schema.global?.foregrounds?.profiles[foreground]?.palettes.default;
      const light = {
        onSubtle: emphases(colors.light),
        onVivid: emphases(colors.vivid)
      };
      const dark = {
        onSubtle: emphases(colors.dark),
        onVivid: emphases(colors.vivid)
      };

      expect(palettes?.light).toEqual(light);
      expect(palettes?.dark).toEqual(dark);
      expect(palettes?.darker).toEqual(dark);
    }
  });
});
