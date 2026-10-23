import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ElementHeightReference, Schema } from '@kiskadee/core';
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
import { buildSizeSupport, publishComponentResources } from './publishComponentResources.ts';

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
        expect(typeof metadata.inspection?.elements.e1.scales._boxHeight).toBe(typeof height);
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
