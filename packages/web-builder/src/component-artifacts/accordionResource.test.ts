import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Schema } from '@kiskadee/core';
import { expect, it } from 'vitest';
import { createFluent2MicrosoftAccordionSchema } from '../../../presets/src/presets/fluent-2-microsoft/components/accordion.schema.ts';
import {
  DEFAULT_WEB_STYLE_EMISSION_POLICY,
  resolveElementStyleEmissionPolicy
} from '../style-emission/web-build-policy.ts';
import { publishComponentResources } from './publishComponentResources.ts';

it('publishes Accordion coverage without preset-owned Motion or fake palette support', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kiskadee-accordion-'));
  const write = (file: string, value: unknown) => writeFile(join(dir, file), JSON.stringify(value));
  const accordion = createFluent2MicrosoftAccordionSchema();
  const timing = {
    enterDurationMs: 180,
    exitDurationMs: 120,
    enterEasing: 'ease-out',
    exitEasing: 'ease-in'
  };
  try {
    await mkdir(join(dir, 'class-maps'), { recursive: true });
    await write('manifest.json', {
      themes: { default: ['light', 'dark'] },
      components: {
        accordion: {
          scale: { 's:md:1': true },
          artifacts: { classMaps: { core: 'class-maps/accordion.json' } }
        }
      }
    });
    await write('class-maps/accordion.json', {
      component: 'accordion',
      classMap: { e3: { s: { 'md:1': 'pad' } } }
    });
    await write('global.kiskadee.json', {
      components: {
        dropdown: {
          effects: { presence: { profile: 'grow-height', profiles: { 'grow-height': timing } } }
        }
      }
    });
    await write('core.kiskadee.json', { accordion: { e3: { s: { 'md:1': 'pad' } } } });
    await writeFile(join(dir, 'core.kiskadee.css'), '.pad{--k-pdl:16px}');
    await publishComponentResources(dir, { components: { accordion } } as Schema);
    const resource = JSON.parse(
      await readFile(join(dir, 'components/accordion.kiskadee.json'), 'utf8')
    );
    expect(resource.options).toEqual({
      themes: ['light'],
      emphases: ['lowest', 'low', 'medium', 'high'],
      divider: true,
      indicatorTransition: 'none'
    });
    expect(resource.effects?.presence).toBeUndefined();
    expect(resource.resources.palettes).toEqual({});
    expect(resource.resources.styles).toHaveLength(1);
    expect(resource.sizeSupport.sizes).toEqual(['md:1']);
    expect(
      resolveElementStyleEmissionPolicy(DEFAULT_WEB_STYLE_EMISSION_POLICY, 'accordion', 'e3')
        .paddingEmission
    ).toBe('token');
    expect(
      resolveElementStyleEmissionPolicy(DEFAULT_WEB_STYLE_EMISSION_POLICY, 'accordion', 'e3')
        .marginRightEmission
    ).toBe('token');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
