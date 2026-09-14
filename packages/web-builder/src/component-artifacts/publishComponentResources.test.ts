import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { Schema } from '@kiskadee/core';
import { expect, it } from 'vitest';
import { publishComponentResources } from './publishComponentResources.ts';

it('publishes a lean index, sparse support and selected-palette resources, retaining aggregates only for build inspection', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kiskadee-component-publication-'));
  const write = async (path: string, value: unknown) => {
    await mkdir(dirname(join(dir, path)), { recursive: true });
    await writeFile(join(dir, path), typeof value === 'string' ? value : JSON.stringify(value));
  };
  const read = async (path: string) => JSON.parse(await readFile(join(dir, path), 'utf8'));
  try {
    const core = { button: { e1: { s: { 'md:1': 'medium' } } } };
    const palette = { button: { e1: { c: { s: { primary: { h: 'blue' } } } } } };
    await write('manifest.json', {
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
          contentSurfaceContext: { default: { light: { onSubtle: {} } } }
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
      components: { button: { elements: { e1: { scales: { boxWidth: { 's:md:1': 10 } } } } } }
    } as unknown as Schema;
    await publishComponentResources(dir, schema);
    const manifest = await read('manifest.json');
    expect(manifest.revision).toMatch(/^[0-9a-f]{64}$/);
    expect(manifest.components.button).toEqual({
      artifacts: { metadata: 'components/button.kiskadee.json' }
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
    const descriptor = await read(metadata.resources.palettes['default.light']);
    expect(descriptor.config.contentSurfaceContext.default.light).toEqual({ onSubtle: {} });
    expect(descriptor.capabilities.surfaceContexts['default.light']).toBeDefined();
    expect(descriptor.styles).toHaveLength(1);
    expect(metadata.resources.styles).toHaveLength(1);
    await expect(readFile(join(dir, 'core.kiskadee.json'))).rejects.toMatchObject({
      code: 'ENOENT'
    });
    expect(await read('_debug/core.kiskadee.json')).toEqual(core);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
