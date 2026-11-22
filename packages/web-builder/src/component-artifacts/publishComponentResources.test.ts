import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { Color, ColorSchema, Schema } from '@kiskadee/core';
import { expect, it } from 'vitest';
import { publishComponentResources } from './publishComponentResources.ts';
import { decodePaletteSurfaceConfig } from './surfacePaletteWire.ts';

it('rejects malformed region aliases and ambiguous parent coordinates', () => {
  const map = { v: { s: { primary: { m: { r: 's' } } } } };
  const parent = ['v', 's', 'primary', 'h', 'r', map];
  expect(() =>
    decodePaletteSurfaceConfig({ sc: 'e7', g: { e3: map } }, 'default', 'light')
  ).toThrow('Unknown surface region alias');
  expect(() => decodePaletteSurfaceConfig({ g: { title: map } }, 'default', 'light')).toThrow(
    'Invalid surface region element'
  );
  expect(() =>
    decodePaletteSurfaceConfig({ g: { e8: [map, [parent, parent]] } }, 'default', 'light')
  ).toThrow('Duplicate parent surface coordinate');
});

it('publishes only selected-palette regions and preserves conditional parent recipes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kiskadee-regions-'));
  const output = {
    teams: { dark: { onSubtle: { standard: { neutral: { medium: { rest: 'inherit' } } } } } }
  } as const;
  const vivid = {
    teams: { dark: { onSubtle: { standard: { neutral: { medium: { rest: 'onVivid' } } } } } }
  } as const;
  const parentKey = JSON.stringify(['onSubtle', 'standard', 'neutral', 'high', 'selected']);
  const regions = { e3: { output }, e8: { output: vivid, against: { [parentKey]: output } } };
  const read = async (path: string) => JSON.parse(await readFile(join(dir, path), 'utf8'));
  try {
    await writeFile(
      join(dir, 'manifest.json'),
      JSON.stringify({
        components: { textField: {} },
        themes: { teams: ['light', 'dark'] }
      })
    );
    await writeFile(join(dir, 'core.kiskadee.json'), '{}');
    await writeFile(
      join(dir, 'global.kiskadee.json'),
      JSON.stringify({
        components: {
          textField: {
            variants: {
              standard: {
                modes: {
                  outline: {
                    contentSurfaceContext: output,
                    contentRegionSurfaceContext: vivid
                  }
                }
              }
            }
          }
        }
      })
    );
    await publishComponentResources(dir, { components: { textField: {} } } as Schema, {
      textField: { variants: { standard: { modes: { outline: { regions } } } } }
    });
    const metadata = await read('components/text-field.kiskadee.json');
    expect(metadata.resources.palettes['teams.light']).toBeUndefined();
    expect(metadata.variants.standard.modes.outline).not.toHaveProperty('regions');
    const palette = await read(metadata.resources.palettes['teams.dark']);
    expect(palette.config.variants.standard.modes.outline).toMatchObject({ sc: 'e3', sr: 'e8' });
    const mode = decodePaletteSurfaceConfig(palette.config, 'teams', 'dark').variants?.standard
      .modes?.outline;
    expect(mode?.regions).toEqual(regions);
    expect(mode?.contentSurfaceContext).toBe(mode?.regions?.e3.output);
    expect(mode?.contentRegionSurfaceContext).toBe(mode?.regions?.e8.output);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

it('publishes Dropdown panel fill evidence only for the painted Rest palette', async () => {
  const fill = (rest: Color): ColorSchema => ({ boxColor: { neutral: { medium: { rest } } } });
  const gradient = (from: string, to: string): Color => ({
    kind: 'linear',
    angle: 90,
    stops: [
      { color: from, position: 0 },
      { color: to, position: 100 }
    ]
  });
  const cases: [string, ColorSchema | undefined, boolean][] = [
    ['opaque', fill('#fff'), true],
    ['partial', fill('#fff1'), true],
    ['gradient', fill(gradient('#fff0', '#000')), true],
    ['transparentGradient', fill(gradient('#fff0', '#abcdef00')), false],
    ['missing', undefined, false],
    ['borderOnly', { borderColor: { neutral: { medium: { rest: '#fff' } } } }, false],
    ['transparent', fill('#ffffff00'), false],
    ['dynamicFill', fill('var(--panel)'), false]
  ];
  const dir = await mkdtemp(join(tmpdir(), 'kiskadee-dropdown-panel-'));
  try {
    const palettes = Object.fromEntries(
      cases.map(([segment, colors]) => [
        segment,
        {
          ...(colors && { light: { onSubtle: { standard: colors } } }),
          dark: { onSubtle: { standard: fill('#000') } }
        }
      ])
    );
    const themes = Object.fromEntries(cases.map(([segment]) => [segment, ['light', 'dark']]));
    const maps = Object.fromEntries(
      cases.flatMap(([segment]) =>
        ['light', 'dark'].map((theme) => [
          `${segment}.${theme}`,
          `class-maps/${segment}.${theme}/dropdown.json`
        ])
      )
    );
    await writeFile(
      join(dir, 'manifest.json'),
      JSON.stringify({
        themes,
        components: { dropdown: { artifacts: { classMaps: { palettes: maps } } } }
      })
    );
    await writeFile(join(dir, 'global.kiskadee.json'), '{}');
    await writeFile(join(dir, 'core.kiskadee.json'), '{}');
    await publishComponentResources(dir, {
      components: { dropdown: { elements: { e1: { name: 'panel', palettes } } } }
    } as unknown as Schema);
    const read = async (path: string) => JSON.parse(await readFile(join(dir, path), 'utf8'));
    const metadata = await read('components/dropdown.kiskadee.json');
    expect(metadata.capabilities).not.toHaveProperty('panelFill');
    for (const [segment, , painted] of cases) {
      const light = await read(metadata.resources.palettes[`${segment}.light`]);
      const dark = await read(metadata.resources.palettes[`${segment}.dark`]);
      expect(light.capabilities?.panelFill, segment).toBe(painted ? true : undefined);
      expect(dark.capabilities?.panelFill, segment).toBe(true);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

it('publishes the authored Text default over stale metadata without changing foreground recipes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kiskadee-text-default-'));
  const write = async (path: string, value: unknown) => {
    await mkdir(dirname(join(dir, path)), { recursive: true });
    await writeFile(join(dir, path), typeof value === 'string' ? value : JSON.stringify(value));
  };
  const schema = {
    name: 'Text default',
    author: 'Kiskadee',
    version: [1, 0, 0],
    breakpoints: { 'bp:all': 0 },
    components: {
      text: {
        options: { emphasis: 'high' },
        elements: {
          e1: {
            name: 'foreground',
            foreground: { neutral: { family: 'neutral', profile: 'standard' } }
          }
        }
      }
    }
  } satisfies Schema;
  try {
    await write('manifest.json', {
      themes: {},
      components: {
        text: { artifacts: { metadata: 'components/previous-text.json' } }
      }
    });
    await write('global.kiskadee.json', { components: { text: { options: { emphasis: 'low' } } } });
    await write('components/previous-text.json', { options: { emphasis: 'medium' } });
    await write('core.kiskadee.json', {});
    await write('core.kiskadee.css', '');
    await publishComponentResources(dir, schema);
    const metadata = JSON.parse(await readFile(join(dir, 'components/text.kiskadee.json'), 'utf8'));
    expect(metadata.options).toEqual({ emphasis: 'high' });
    expect(metadata).not.toHaveProperty('foregrounds');
    expect(schema.components.text.elements.e1.foreground.neutral.profile).toBe('standard');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

it.each([false, true])('publishes lean resources (segment metadata: %s)', async (withSegments) => {
  const dir = await mkdtemp(join(tmpdir(), 'kiskadee-component-publication-'));
  const write = async (path: string, value: unknown) => {
    await mkdir(dirname(join(dir, path)), { recursive: true });
    await writeFile(join(dir, path), typeof value === 'string' ? value : JSON.stringify(value));
  };
  const read = async (path: string) => JSON.parse(await readFile(join(dir, path), 'utf8'));
  try {
    const core = { button: { e1: { s: { 'md:1': 'medium' } } } };
    const palette = { button: { e1: { c: { s: { s: { primary: { h: 'blue' } } } } } } };
    if (withSegments) await write('segments.json', { version: 1, segments: [] });
    await write('manifest.json', {
      ...(withSegments ? { segmentMetadata: 'segments.json' } : {}),
      themes: { default: ['light'] },
      components: {
        button: {
          scale: { 's:md:1': true },
          surfaceContexts: {
            'default.light': { onSubtle: { state: { primary: { high: { rest: true } } } } }
          },
          artifacts: {
            classMaps: {
              core: 'class-maps/core/button.json',
              palettes: { 'default.light': 'class-maps/default.light/button.json' }
            }
          }
        }
      }
    });
    await write('global.kiskadee.json', {
      density: { button: { c: 'sm:1', r: 'md:1', s: 'lg:1' } },
      components: {
        button: {
          options: { groupDivider: true },
          contentSurfaceContext: { default: { light: { onSubtle: { standard: {} } } } }
        },
        container: {
          contentSurfaceContext: {
            default: {
              light: { onSubtle: { standard: { neutral: { medium: { rest: 'onSubtle' } } } } }
            }
          }
        }
      }
    });
    await write('core.kiskadee.json', core);
    await write('core.kiskadee.css', '.medium{width:10px}');
    await write('default.light.kiskadee.json', palette);
    await write('default.light.kiskadee.css', '.blue{color:blue}');
    await write('class-maps/core/button.json', { component: 'button', classMap: core.button });
    await write('class-maps/default.light/button.json', {
      component: 'button',
      classMap: palette.button
    });
    const schema = {
      global: { density: { compact: 's:sm:1', regular: 's:md:1', spacious: 's:lg:1' } },
      components: {
        button: { elements: { e1: { scales: { boxWidth: { 's:md:1': 10 } } } } },
        container: { elements: { e1: { name: 'container' } } }
      }
    } as unknown as Schema;
    await publishComponentResources(dir, schema);
    const manifest = await read('manifest.json');
    expect(manifest.revision).toMatch(/^[0-9a-f]{64}$/);
    expect(manifest.components.button).toEqual({
      artifacts: { metadata: 'components/button.kiskadee.json' }
    });
    expect(manifest.components.container).toEqual({
      artifacts: { metadata: 'components/container.kiskadee.json' }
    });
    expect((await read('global.kiskadee.json')).components).toBeUndefined();
    expect((await read('global.kiskadee.json')).density).toEqual({
      c: 'sm:1',
      r: 'md:1',
      s: 'lg:1'
    });
    const metadata = await read('components/button.kiskadee.json');
    expect(metadata.sizeSupport).toEqual({ sizes: ['md:1'] });
    expect(metadata.density).toBeUndefined();
    expect(metadata.contentSurfaceContext).toBeUndefined();
    expect(metadata.capabilities).not.toHaveProperty('surfaceContexts');
    expect(metadata.capabilities.colorVariants.standard).toEqual({
      'default.light': { onSubtle: { primary: ['high'] } }
    });
    const descriptor = await read(metadata.resources.palettes['default.light']);
    expect(descriptor.formatVersion).toBe(5);
    expect(descriptor.config).toEqual({ sc: { s: { s: {} } } });
    expect(descriptor.capabilities.surfaceContexts['default.light']).toBeDefined();
    expect(descriptor.styles).toHaveLength(1);
    expect(metadata.resources.styles).toHaveLength(1);
    const containerMetadata = await read('components/container.kiskadee.json');
    expect(containerMetadata.component).toBe('container');
    const containerDescriptor = await read(containerMetadata.resources.palettes['default.light']);
    expect(containerDescriptor.config).toEqual({
      sc: { s: { s: { neutral: { m: { r: 's' } } } } }
    });
    await expect(readFile(join(dir, 'core.kiskadee.json'))).rejects.toMatchObject({
      code: 'ENOENT'
    });
    expect(await read('_debug/core.kiskadee.json')).toEqual(core);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

it('diagnoses declared missing segment metadata before modifying resources', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kiskadee-missing-segments-'));
  try {
    const manifest = JSON.stringify({ segmentMetadata: 'segments.json' });
    await writeFile(join(dir, 'manifest.json'), manifest);
    await expect(publishComponentResources(dir, {} as Schema)).rejects.toThrow(
      '[web-builder] Cannot read declared segment metadata segments.json'
    );
    expect(await readFile(join(dir, 'manifest.json'), 'utf8')).toBe(manifest);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
