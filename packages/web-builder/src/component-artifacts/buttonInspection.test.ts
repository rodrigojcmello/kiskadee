import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  type ClassNameByElementJSON,
  type ElementHeightReference,
  type Schema,
  validateButtonComponentContract
} from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { compileDensityClassMaps, resolveSchemaDensityMaps } from '../density/compileDensity.ts';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import { mapStyleKeyUsage } from '../phase-2-map-style-key-usage/mapStyleKeyUsage.ts';
import { shortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { generateCssSplit } from '../phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap.ts';
import { buildComponentScale } from '../phase-7-publish-metadata/publishMetadata.ts';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy.ts';
import type { ComponentResourceArtifact } from './componentResources.ts';
import {
  buildButtonLayoutSupport,
  buildSizeSupport,
  publishComponentResources
} from './publishComponentResources.ts';

function fixture(height?: ElementHeightReference): Schema {
  return {
    name: 'Button inspection test',
    author: 'Kiskadee',
    version: [1, 0, 0],
    breakpoints: { 'bp:all': 0 },
    global: {
      density: { compact: 's:sm:1', regular: 's:md:1', spacious: 's:lg:5' }
    },
    components: {
      button: {
        elements: {
          e1: {
            name: 'button',
            scales: {
              paddingTop: { 's:md:1': 4 },
              borderWidth: 1,
              ...(height === undefined ? {} : { _boxHeight: height })
            }
          }
        }
      }
    }
  };
}

async function compile(schema: Schema) {
  const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys(
    schema,
    DEFAULT_WEB_STYLE_EMISSION_POLICY
  );
  const usage = mapStyleKeyUsage(styleKeys, {
    webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
  });
  const classes = shortenCssClassNames(usage);
  const css = await generateCssSplit(styleKeys, classes, {
    forceState: true,
    webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
  });
  const maps = generateClassNamesMapSplit(styleKeys, classes, toneMetadataByPalette, {
    webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
  });
  const density = resolveSchemaDensityMaps(schema);
  const aliases = compileDensityClassMaps(maps.core, density);
  return { styleKeys, usage, classes, css, maps, density, aliases };
}

describe('Button reference-height inspection', () => {
  it('generates independent stacked geometry, typography and icon viewports through the normal pipeline', async () => {
    const schema = fixture(32);
    schema.global!.iconSizes = { 's:md:1': 20, 's:lg:1': 24 };
    schema.global!.typography = {
      profiles: {
        'caption-medium': {
          decorations: { textFont: 'body', textWeight: 'normal' },
          scales: { textSize: 12, textHeight: 16 }
        }
      }
    };
    Object.assign(schema.components.button!.elements, {
      e8: {
        name: 'button-stacked',
        scales: {
          paddingTop: { 's:md:1': 8 },
          paddingRight: { 's:md:1': 12 },
          paddingBottom: { 's:md:1': 8 },
          paddingLeft: { 's:md:1': 12 },
          borderWidth: { 's:md:1': 1 },
          borderRadius: { rounded: 4, square: 0 },
          _boxHeight: { 's:md:1': 60 }
        }
      },
      e9: {
        name: 'button-stacked-label',
        typography: { 's:md:1': 'caption-medium' },
        scales: { marginTop: { 's:md:1': 4 } }
      },
      e10: {
        name: 'button-stacked-icon',
        iconSize: { 's:md:1': 's:lg:1' }
      }
    });
    const { css, maps } = await compile(schema);
    const elements = maps.core.button as Record<string, { s?: Record<string, string> }>;
    for (const element of ['e1', 'e8', 'e9', 'e10']) {
      expect(elements[element]?.s?.['md:1']).toBeTruthy();
    }
    expect(elements.e8?.s?.['md:1']).not.toBe(elements.e1?.s?.['md:1']);
    expect(css.coreCss).toContain('--k-bxh: 24px');
    expect(css.coreCss).toContain('--k-bxw: 24px');
    expect(css.coreCss).toContain('margin-top: 4px');
    expect(css.coreCss).toContain('line-height: 1.333333');
    expect(JSON.stringify({ css, maps })).not.toContain('_boxHeight');
  });

  it('distinguishes emitted responsive radius classes from complete stacked radius support', async () => {
    const schema = fixture();
    delete schema.global!.density;
    schema.breakpoints['bp:lg:1'] = 1152;
    schema.global!.iconSizes = { 's:md:1': 20 };
    schema.global!.typography = {
      profiles: {
        'caption-medium': {
          decorations: { textFont: 'body', textWeight: 'normal' },
          scales: { textSize: 12, textHeight: 16 }
        }
      }
    };
    Object.assign(schema.components.button!.elements, {
      e8: {
        name: 'button-stacked',
        scales: {
          paddingTop: 8,
          paddingRight: 12,
          paddingBottom: 8,
          paddingLeft: 12,
          borderWidth: 1,
          borderRadius: {
            rounded: 4,
            pill: { 's:md:1': { 'bp:lg:1': 28 } },
            square: 0
          }
        }
      },
      e9: {
        name: 'button-stacked-label',
        typography: { 's:md:1': 'caption-medium' },
        scales: { marginTop: 4 }
      },
      e10: {
        name: 'button-stacked-icon',
        iconSize: { 's:md:1': 's:md:1' }
      }
    });
    expect(validateButtonComponentContract(schema.components.button)).toEqual([]);
    const { css, maps } = await compile(schema);
    const e8 = (maps.core.button as Record<string, ClassNameByElementJSON>).e8;
    expect(e8.rr?.all).toBeTruthy();
    expect(e8.rs?.all).toBeTruthy();
    expect(e8.rp?.['md:1']).toBeTruthy();
    expect(css.coreCss).toContain('border-radius: 0px');
    expect(css.coreCss).toContain('border-radius: 28px');
    expect(css.coreCss).toContain('@media (min-width: 1152px)');
    expect(buildButtonLayoutSupport(schema.components.button, ['md:1'])).toEqual({
      stacked: {
        sizes: ['md:1'],
        sizesByRadius: { rounded: ['md:1'], pill: [], square: ['md:1'] }
      }
    });
  });

  it.each<ElementHeightReference | undefined>([
    undefined,
    997,
    { 's:sm:1': 24, 's:md:1': 32, 's:lg:5': 997 }
  ])('publishes %j only as optional inspection metadata', async (height) => {
    const schema = fixture(height);
    const snapshot = structuredClone(schema);
    const baseline = await compile(fixture());
    const result = await compile(schema);

    // Exercise compensation, atomic identities, CSS, class maps and adaptive-size lowering.
    expect(result).toEqual(baseline);
    expect(result.css.coreCss).toContain('max(0px');
    expect(JSON.stringify(result)).not.toContain('_boxHeight');
    expect(JSON.stringify(result)).not.toContain('997');
    expect(buildComponentScale(schema, 'button')).toEqual({ 's:md:1': true });
    expect(buildSizeSupport(schema.components.button)).toEqual({ sizes: ['md:1'] });

    const dir = await mkdtemp(join(tmpdir(), 'kiskadee-button-inspection-'));
    try {
      const write = (file: string, value: unknown) =>
        writeFile(join(dir, file), typeof value === 'string' ? value : JSON.stringify(value));
      await mkdir(join(dir, 'class-maps/core'), { recursive: true });
      await mkdir(join(dir, 'components'), { recursive: true });
      await write('manifest.json', {
        themes: {},
        components: {
          button: {
            scale: buildComponentScale(schema, 'button'),
            artifacts: {
              metadata: 'components/previous-button.json',
              classMaps: { core: 'class-maps/core/button.json' }
            }
          }
        }
      });
      await write('global.kiskadee.json', {
        components: {
          button: { inspection: { elements: { e1: { scales: { _boxHeight: 999 } } } } }
        }
      });
      await write('components/previous-button.json', {
        inspection: { elements: { e1: { scales: { _boxHeight: 998 } } } }
      });
      await write('core.kiskadee.json', result.maps.core);
      await write('core.kiskadee.css', result.css.coreCss);
      await write('class-maps/core/button.json', {
        component: 'button',
        classMap: result.maps.core.button
      });

      await publishComponentResources(dir, schema);

      const metadata = JSON.parse(
        await readFile(join(dir, 'components/button.kiskadee.json'), 'utf8')
      ) as ComponentResourceArtifact;
      expect(metadata.sizeSupport).toEqual({ sizes: ['md:1'] });
      expect(metadata.capabilities?.scale).toEqual({ 's:md:1': true });
      if (height === undefined) expect(metadata).not.toHaveProperty('inspection');
      else {
        expect(metadata.inspection).toEqual({
          elements: { e1: { scales: { _boxHeight: height } } }
        });
        expect(typeof metadata.inspection?.elements.e1?.scales._boxHeight).toBe(typeof height);
      }
      const publishedMap = await readFile(join(dir, metadata.resources.core!), 'utf8');
      expect(JSON.parse(publishedMap).classMap).toEqual(baseline.maps.core.button);
      expect(publishedMap).not.toMatch(/_boxHeight|997|lg:5/);
      for (const style of metadata.resources.styles) {
        const css = await readFile(join(dir, style.path), 'utf8');
        expect(css).not.toMatch(/_boxHeight|997/);
      }
      expect(schema).toEqual(snapshot);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it.each([
    { normal: undefined, stacked: undefined },
    { normal: 32, stacked: undefined },
    { normal: undefined, stacked: { 's:md:1': 60, 's:lg:5': 997 } },
    { normal: { 's:md:1': 32 }, stacked: 60 }
  ])('publishes independent ordinary and stacked references: %j', async ({ normal, stacked }) => {
    const schema = fixture(normal);
    schema.components.button!.elements.e8 = {
      name: 'button-stacked',
      scales: {
        paddingTop: { 's:md:1': 8 },
        paddingRight: { 's:md:1': 12 },
        paddingBottom: { 's:md:1': 8 },
        paddingLeft: { 's:md:1': 12 },
        borderWidth: { 's:md:1': 1 },
        borderRadius: { rounded: 4, square: 0 },
        ...(stacked === undefined ? {} : { _boxHeight: stacked })
      }
    };
    const snapshot = structuredClone(schema);
    const baseline = structuredClone(schema);
    delete baseline.components.button!.elements.e1!.scales!._boxHeight;
    delete baseline.components.button!.elements.e8!.scales._boxHeight;
    const result = await compile(schema);
    expect(result).toEqual(await compile(baseline));
    expect(buildComponentScale(schema, 'button')).toEqual({ 's:md:1': true });
    expect(buildSizeSupport(schema.components.button)).toEqual({ sizes: ['md:1'] });
    expect(JSON.stringify(result)).not.toMatch(/_boxHeight|997/);

    const dir = await mkdtemp(join(tmpdir(), 'kiskadee-stacked-inspection-'));
    try {
      const write = (file: string, value: unknown) =>
        writeFile(join(dir, file), typeof value === 'string' ? value : JSON.stringify(value));
      await write('manifest.json', { themes: {}, components: { button: {} } });
      await write('global.kiskadee.json', {
        components: {
          button: {
            inspection: {
              elements: {
                e1: { scales: { _boxHeight: 999 } },
                e8: { scales: { _boxHeight: 998 } }
              }
            }
          }
        }
      });
      await write('core.kiskadee.json', result.maps.core);
      await write('core.kiskadee.css', result.css.coreCss);
      await publishComponentResources(dir, schema);
      const metadata = JSON.parse(
        await readFile(join(dir, 'components/button.kiskadee.json'), 'utf8')
      ) as ComponentResourceArtifact;
      const elements = {
        ...(normal === undefined ? {} : { e1: { scales: { _boxHeight: normal } } }),
        ...(stacked === undefined ? {} : { e8: { scales: { _boxHeight: stacked } } })
      };
      if (Object.keys(elements).length === 0) expect(metadata).not.toHaveProperty('inspection');
      else expect(metadata.inspection).toEqual({ elements });
      expect(schema).toEqual(snapshot);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('does not infer a rendered size from a metadata-only fixed-size reference', () => {
    const schema = fixture();
    schema.components.button!.elements.e1!.scales = { _boxHeight: { 's:lg:5': 997 } };

    expect(buildComponentScale(schema, 'button')).toBeUndefined();
    expect(buildSizeSupport(schema.components.button)).toEqual({ sizes: [] });
    const { styleKeys } = convertElementSchemaToStyleKeys(
      schema,
      DEFAULT_WEB_STYLE_EMISSION_POLICY
    );
    expect(styleKeys.button).toEqual({ e1: {} });
  });
});
