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
      neutral: { family: 'neutral', profile: 'standard' },
      blue: { family: 'blue', profile: 'standard' },
      'blue-deep': { family: 'blue', profile: 'deep' },
      red: { family: 'red', profile: 'standard' },
      'red-deep': { family: 'red', profile: 'deep' },
      green: { family: 'green', profile: 'standard' },
      'green-deep': { family: 'green', profile: 'deep' },
      purple: { family: 'purple', profile: 'standard' },
      'purple-deep': { family: 'purple', profile: 'deep' },
      orange: { family: 'orange', profile: 'standard' },
      'orange-deep': { family: 'orange', profile: 'deep' },
      yellow: { family: 'yellow', profile: 'standard' },
      'yellow-deep': { family: 'yellow', profile: 'deep' }
    });

    const palettes = schema.global?.foregrounds?.profiles.neutral?.standard.palettes.default;
    expect(palettes?.light).toMatchObject({
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
    expect(palettes?.dark).toMatchObject(dark);
    expect(palettes?.darker).toMatchObject(dark);
    expect(palettes?.light?.onSubtle.medium).toEqual({
      rest: '#21242d',
      hover: '#1a1d25',
      pressed: '#000001',
      pending: '#21242db3'
    });
    expect(palettes?.light?.onVivid.medium).toEqual({
      rest: '#ffffff',
      hover: '#ffffff',
      pressed: '#ffffff',
      pending: '#ffffffb3'
    });
  });

  it('publishes every available Fluent hue with one shared three-level formula', () => {
    const expected = {
      blue: {
        light: '#0064b4',
        dark: '#79b9ff',
        vividLight: '#94c7ff',
        vividDark: '#f1f7ff'
      },
      red: {
        light: '#c50f1f',
        dark: '#ff958b',
        vividLight: '#ffa89f',
        vividDark: '#fff4f2'
      },
      green: {
        light: '#107c10',
        dark: '#7ec879',
        vividLight: '#91d78c',
        vividDark: '#f0faef'
      },
      purple: {
        light: '#c239b3',
        dark: '#eb94dd',
        vividLight: '#fe99ee',
        vividDark: '#fef2fc'
      },
      orange: {
        light: '#f7630c',
        dark: '#f49d79',
        vividLight: '#ffaa89',
        vividDark: '#fff4ef'
      },
      yellow: {
        light: '#eaa300',
        dark: '#d1af7c',
        vividLight: '#f6b545',
        vividDark: '#fdf5ea'
      }
    } as const;

    const emphases = (color: string) => ({
      medium: { rest: color },
      low: { rest: `${color}ad` },
      lowest: { rest: `${color}3d` }
    });

    for (const [foreground, colors] of Object.entries(expected)) {
      const palettes = schema.global?.foregrounds?.profiles[foreground]?.standard.palettes.default;
      const onVividEmphases = (color: string) => ({
        medium: { rest: color },
        low: { rest: `${color}c2` },
        lowest: { rest: `${color}66` }
      });
      const light = {
        onSubtle: emphases(colors.light),
        onVivid: onVividEmphases(colors.vividLight)
      };
      const dark = {
        onSubtle: emphases(colors.dark),
        onVivid: onVividEmphases(colors.vividDark)
      };

      expect(palettes?.light).toMatchObject(light);
      expect(palettes?.dark).toMatchObject(dark);
      expect(palettes?.darker).toMatchObject(dark);
    }
  });

  it('publishes every chromatic deep profile through the Button-calibrated formula', () => {
    const profiles = schema.global?.foregrounds?.profiles;
    const expected = {
      blue: {
        light: '#0d477e',
        dark: '#61a7f3',
        vivid: '#d3e7ff'
      },
      red: {
        light: '#811819',
        dark: '#f67c73',
        vivid: '#ffdbd7'
      },
      green: {
        light: '#155513',
        dark: '#67b661',
        vivid: '#d4edd2'
      },
      purple: {
        light: '#6b2762',
        dark: '#dd80cf',
        vivid: '#f8daf2'
      },
      orange: {
        light: '#6f3217',
        dark: '#e68962',
        vivid: '#ffdccf'
      },
      yellow: {
        light: '#5a4117',
        dark: '#c19c65',
        vivid: '#f6e2c4'
      }
    } as const;
    const onSubtle = (color: string) => ({
      medium: { rest: color },
      low: { rest: `${color}ad` },
      lowest: { rest: `${color}3d` }
    });
    const onVivid = (color: string) => ({
      medium: { rest: color },
      low: { rest: `${color}c2` },
      lowest: { rest: `${color}66` }
    });

    expect(Object.entries(profiles ?? {}).filter(([, family]) => family.deep)).toHaveLength(7);

    for (const [foreground, colors] of Object.entries(expected)) {
      const palettes = profiles?.[foreground]?.deep?.palettes.default;
      const dark = { onSubtle: onSubtle(colors.dark), onVivid: onVivid(colors.vivid) };

      expect(palettes?.light).toMatchObject({
        onSubtle: onSubtle(colors.light),
        onVivid: onVivid(colors.vivid)
      });
      expect(palettes?.dark).toMatchObject(dark);
      expect(palettes?.darker).toMatchObject(dark);
    }
  });

  it('publishes neutral.deep as the shared Button foreground coordinate family', () => {
    const palettes = schema.global?.foregrounds?.profiles.neutral?.deep?.palettes.default;

    expect(palettes?.light?.onSubtle).toMatchObject({
      medium: {
        rest: '#000000',
        pressed: '#000000',
        pending: '#000000b3'
      },
      low: {
        rest: '#434650',
        pending: '#434650b3',
        disabled: '#a7abb6d1'
      },
      lowest: {
        disabled: '#b6bac6'
      }
    });
    expect(palettes?.dark?.onSubtle.low).toMatchObject({
      rest: '#9ea2ae',
      disabled: '#555965'
    });
    expect(palettes?.light?.onVivid.medium).toEqual({
      rest: '#d6dbe7',
      pending: '#d6dbe7b3',
      disabled: '#ffffff66'
    });
  });
});
