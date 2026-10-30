import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  type ButtonSelectionEmphasis,
  type ClassNameByElementJSON,
  fg,
  resolveSupportedSize,
  type Schema,
  type SystemButtonIntent,
  validateButtonComponentContract
} from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { resolveSchemaDensityMaps } from '../density/compileDensity.ts';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import { mapStyleKeyUsage } from '../phase-2-map-style-key-usage/mapStyleKeyUsage.ts';
import { shortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { generateCssSplit } from '../phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap.ts';
import {
  buildComponentScale,
  buildComponentSurfaceContexts
} from '../phase-7-publish-metadata/publishMetadata.ts';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy.ts';
import type { ComponentResourceArtifact } from './componentResources.ts';
import {
  buildButtonIndicatorSupport,
  buildSizeSupport,
  publishComponentResources
} from './publishComponentResources.ts';

function fixture(): Schema {
  const palette = (high: string, medium: string) => ({
    default: {
      light: {
        onSubtle: {
          boxColor: {
            neutral: {
              high: { selected: { rest: { ref: high } } },
              medium: { selected: { rest: { ref: medium } } }
            }
          }
        },
        onVivid: {
          boxColor: {
            neutral: {
              high: { selected: { rest: { ref: '#ffffff' } } },
              medium: { selected: { rest: { ref: '#ffffff' } } }
            }
          }
        }
      }
    }
  });
  return {
    name: 'Button indicator',
    version: [1, 0, 0],
    author: 'Kiskadee',
    breakpoints: { 'bp:all': 0 },
    components: {
      button: {
        elements: {
          e1: { name: 'button', scales: { borderWidth: 1, paddingTop: { 's:md:1': 4 } } },
          e11: {
            name: 'button-indicator',
            scales: {
              boxWidth: { 's:md:1': 20, 's:lg:2': 40 },
              boxHeight: 3,
              marginTop: 2,
              marginBottom: 2,
              marginLeft: 4,
              marginRight: 4,
              borderRadius: { rounded: 2, pill: 2, square: 0 }
            },
            palettes: palette('#0067b8', '#0067b8')
          }
        }
      }
    }
  };
}

function addOutsideRecipe(schema: Schema): void {
  const outside = structuredClone(schema.components.button!.elements.e11!);
  outside.name = 'button-indicator-outside';
  outside.palettes.default!.light!.onSubtle.boxColor.neutral!.high!.selected!.rest = {
    ref: '#111111'
  };
  schema.components.button!.elements.e12 = outside;
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
  return { styleKeys, usage, css, maps };
}

describe('Button indicator publication', () => {
  it.each([
    { representation: 'scalar', element: 'e11' },
    { representation: 's:all', element: 'e11' },
    { representation: 'scalar', element: 'e12' },
    { representation: 's:all', element: 'e12' }
  ] as const)('keeps invariant $representation $element coverage at Medium', async ({
    representation,
    element
  }) => {
    const schema = fixture();
    const button = schema.components.button!;
    if (element === 'e12') {
      addOutsideRecipe(schema);
      delete button.elements.e11;
    }
    const shared = (value: number) => (representation === 'scalar' ? value : { 's:all': value });
    Object.assign(button.elements.e1!.scales!, {
      borderWidth: shared(1),
      paddingTop: shared(4)
    });
    Object.assign(button.elements[element]!.scales, {
      boxWidth: shared(20),
      boxHeight: shared(3),
      marginTop: shared(2),
      marginBottom: shared(2),
      marginLeft: shared(4),
      marginRight: shared(4),
      borderRadius: { rounded: shared(2), pill: shared(2), square: shared(0) }
    });
    schema.global = { density: { regular: 's:md:1' } };
    expect(validateButtonComponentContract(button)).toEqual([]);
    expect(resolveSchemaDensityMaps(schema)).toEqual({ button: { r: 'md:1' } });

    const result = await compile(schema);
    const dir = await mkdtemp(join(tmpdir(), 'kiskadee-invariant-button-indicator-'));
    try {
      const write = (file: string, value: unknown) =>
        writeFile(join(dir, file), typeof value === 'string' ? value : JSON.stringify(value));
      await write('manifest.json', { themes: { default: ['light'] }, components: { button: {} } });
      await write('global.kiskadee.json', {});
      await write('core.kiskadee.json', result.maps.core);
      await write('core.kiskadee.css', result.css.coreCss);
      await write('default.light.kiskadee.json', result.maps.palettes['default.light']);
      await write('default.light.kiskadee.css', result.css.palettes['default.light']);
      await publishComponentResources(dir, schema);
      const published = JSON.parse(
        await readFile(join(dir, 'components/button.kiskadee.json'), 'utf8')
      ) as ComponentResourceArtifact;
      expect(published.sizeSupport).toEqual({ sizes: [] });
      expect(resolveSupportedSize('lg:2', published.sizeSupport.sizes!)).toBe('md:1');
      const covered = { rounded: ['md:1'], pill: ['md:1'], square: ['md:1'] };
      const empty = { rounded: [], pill: [], square: [] };
      expect(published.indicator).toEqual(
        element === 'e11'
          ? { sizesByRadius: covered }
          : { sizesByRadius: empty, outsideSizesByRadius: covered }
      );
      const geometry = result.maps.core.button as Record<string, ClassNameByElementJSON>;
      const paint = result.maps.palettes['default.light']!.button as Record<
        string,
        ClassNameByElementJSON
      >;
      expect(geometry.e1?.s?.all).toBeTruthy();
      expect(geometry[element]?.s?.all).toBeTruthy();
      for (const radius of ['rr', 'rp', 'rs'] as const) {
        const className = geometry[element]?.[radius]?.all;
        expect(className).toBeTruthy();
        expect(result.css.coreCss).toContain(`.${className}`);
      }
      expect(paint[element]?.c?.s?.neutral?.m).toBeTruthy();
      expect(paint[element]?.c?.v?.neutral?.m).toBeTruthy();
      expect(geometry[element === 'e11' ? 'e12' : 'e11']).toBeUndefined();
      expect(paint[element === 'e11' ? 'e12' : 'e11']).toBeUndefined();
      expect(published.resources.styles.length).toBeGreaterThan(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it.each([
    'e11',
    'e12'
  ] as const)('does not promote %s-only sizes or incomplete radii into an invariant Button', (element) => {
    const schema = fixture();
    const button = schema.components.button!;
    button.elements.e1!.scales!.paddingTop = 4;
    if (element === 'e12') {
      addOutsideRecipe(schema);
      delete button.elements.e11;
    }
    const scales = button.elements[element]!.scales;
    scales.boxWidth = { 's:lg:2': 40 };
    const componentSizes = buildSizeSupport(button, ['e11', 'e12']).sizes!;
    expect(componentSizes).toEqual([]);
    expect(buildComponentScale(schema, 'button')).toBeUndefined();
    const selectedSupport = () => {
      const support = buildButtonIndicatorSupport(button, componentSizes);
      return element === 'e11' ? support?.sizesByRadius : support?.outsideSizesByRadius;
    };
    expect(selectedSupport()).toEqual({ rounded: [], pill: [], square: [] });
    scales.boxWidth = 20;
    scales.borderRadius.rounded = { 's:lg:2': 2 };
    scales.borderRadius.pill = { 's:md:1': { 'bp:sm:1': 2 } };
    expect(selectedSupport()).toEqual({ rounded: [], pill: [], square: ['md:1'] });
    expect(buildSizeSupport(button, ['e11', 'e12'])).toEqual({ sizes: [] });
  });

  it('publishes selection intent faithfully without adding paint classes or retaining a stale default', async () => {
    const schema = fixture();
    const result = await compile(schema);
    schema.components.button!.options = { selectionIntent: 'primary' };
    const withSelectionIntent = await compile(schema);
    expect(withSelectionIntent.styleKeys).toEqual(result.styleKeys);
    expect(withSelectionIntent.css).toEqual(result.css);
    expect(withSelectionIntent.maps).toEqual(result.maps);
    const dir = await mkdtemp(join(tmpdir(), 'kiskadee-button-selection-intent-'));
    try {
      const write = (file: string, value: unknown) =>
        writeFile(join(dir, file), typeof value === 'string' ? value : JSON.stringify(value));
      await write('manifest.json', { themes: { default: ['light'] }, components: { button: {} } });
      await write('global.kiskadee.json', {
        components: { button: { options: { selectionIntent: 'destructive' } } }
      });
      for (const selectionIntent of [
        'primary',
        'neutral',
        undefined,
        'support',
        'destructive',
        'positive'
      ] satisfies Array<SystemButtonIntent | undefined>) {
        schema.components.button!.options =
          selectionIntent === undefined ? {} : { selectionIntent };
        await write('core.kiskadee.json', result.maps.core);
        await write('core.kiskadee.css', result.css.coreCss);
        await write('default.light.kiskadee.json', result.maps.palettes['default.light']);
        await write('default.light.kiskadee.css', result.css.palettes['default.light']);
        await publishComponentResources(dir, schema);
        const published = JSON.parse(
          await readFile(join(dir, 'components/button.kiskadee.json'), 'utf8')
        );
        if (selectionIntent === undefined)
          expect(published).not.toHaveProperty('options.selectionIntent');
        else expect(published).toHaveProperty('options.selectionIntent', selectionIntent);
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it.each<ButtonSelectionEmphasis | undefined>([
    undefined,
    'lowest',
    'low',
    'medium',
    'high'
  ])('publishes selection emphasis %j and removes stale capability when absent', async (selectionEmphasis) => {
    const schema = fixture();
    addOutsideRecipe(schema);
    if (selectionEmphasis !== undefined) schema.components.button!.options = { selectionEmphasis };
    const result = await compile(schema);
    const dir = await mkdtemp(join(tmpdir(), 'kiskadee-button-indicator-'));
    try {
      const write = (file: string, value: unknown) =>
        writeFile(join(dir, file), typeof value === 'string' ? value : JSON.stringify(value));
      await write('manifest.json', { themes: { default: ['light'] }, components: { button: {} } });
      await write('global.kiskadee.json', {
        components: {
          button: {
            options: { indicatorScope: 'all' },
            indicator: { sizesByRadius: { rounded: ['stale'] } }
          }
        }
      });
      await write('core.kiskadee.json', result.maps.core);
      await write('core.kiskadee.css', result.css.coreCss);
      await write('default.light.kiskadee.json', result.maps.palettes['default.light']);
      await write('default.light.kiskadee.css', result.css.palettes['default.light']);
      await publishComponentResources(dir, schema);
      const read = async () =>
        JSON.parse(
          await readFile(join(dir, 'components/button.kiskadee.json'), 'utf8')
        ) as ComponentResourceArtifact;
      const published = await read();
      expect(published).not.toHaveProperty('options.indicatorScope');
      if (selectionEmphasis === undefined)
        expect(published).not.toHaveProperty('options.selectionEmphasis');
      else expect(published).toHaveProperty('options.selectionEmphasis', selectionEmphasis);
      expect(published.indicator?.sizesByRadius).toEqual({
        rounded: ['md:1'],
        pill: ['md:1'],
        square: ['md:1']
      });
      expect(published.indicator?.outsideSizesByRadius).toEqual(published.indicator?.sizesByRadius);
      expect(published.sizeSupport).toEqual({ sizes: ['md:1'] });
      expect(published.resources.styles.length).toBeGreaterThan(0);
      delete schema.components.button!.elements.e11;
      delete schema.components.button!.elements.e12;
      await write('manifest.json', { themes: { default: ['light'] }, components: { button: {} } });
      await write('global.kiskadee.json', { components: { button: published } });
      await write('core.kiskadee.json', result.maps.core);
      await write('core.kiskadee.css', result.css.coreCss);
      await write('default.light.kiskadee.json', result.maps.palettes['default.light']);
      await write('default.light.kiskadee.css', result.css.palettes['default.light']);
      await publishComponentResources(dir, schema);
      expect(await read()).not.toHaveProperty('indicator');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
  it('publishes common token geometry and ordinary surface-context color buckets', async () => {
    const { css, maps } = await compile(fixture());
    const geometry = (maps.core.button as Record<string, ClassNameByElementJSON>).e11!;
    const paint = (maps.palettes['default.light']!.button as Record<string, ClassNameByElementJSON>)
      .e11!;
    expect(geometry.s?.['md:1']).toBeTruthy();
    expect(geometry.rr?.all).toBeTruthy();
    expect(geometry.rp?.all).toBeTruthy();
    expect(geometry.rs?.all).toBeTruthy();
    expect(geometry.c).toBeUndefined();
    expect(paint.c?.s?.neutral?.h).toBeTruthy();
    expect(paint.c?.v?.neutral?.h).toBeTruthy();
    expect(paint.c?.s?.neutral?.h).not.toEqual(paint.c?.v?.neutral?.h);
    expect(paint.c?.s?.neutral?.h).toEqual(paint.c?.s?.neutral?.m);
    expect(paint).not.toHaveProperty('placements');
    expect(geometry).not.toHaveProperty('placements');
    for (const variable of [
      '--k-bxh',
      '--k-bxw',
      '--k-mgt',
      '--k-mgb',
      '--k-mgl',
      '--k-mgr',
      '--k-bdr'
    ])
      expect(css.coreCss).toContain(variable);
    expect(css.coreCss).not.toMatch(
      /(?:[;{]\s*)(?:width|height|margin-top|margin-bottom|margin-left|margin-right|border-radius):/
    );
    expect(css.coreCss).toContain('--k-bxw: 20px');
    expect(css.coreCss).not.toMatch(/--k-bxw:\s*(?:calc|min|max|clamp)\(/);
    expect(css.palettes['default.light']).toContain('.-a.-s');
    expect(css.palettes['default.light']).toContain('@scope');
    expect(css.palettes['default.light']).not.toContain(':hover');
  });

  it.each([
    'e11',
    'e12'
  ] as const)('supports only the %s recipe without inventing the other position', async (element) => {
    const schema = fixture();
    addOutsideRecipe(schema);
    delete schema.components.button!.elements[element === 'e11' ? 'e12' : 'e11'];
    const { maps } = await compile(schema);
    const paint = maps.palettes['default.light']!.button as Record<string, ClassNameByElementJSON>;
    expect(paint[element]?.c?.s?.neutral?.h).toBeTruthy();
    expect(paint[element === 'e11' ? 'e12' : 'e11']).toBeUndefined();
    const support = buildButtonIndicatorSupport(schema.components.button, ['md:1']);
    const covered = { rounded: ['md:1'], pill: ['md:1'], square: ['md:1'] };
    const empty = { rounded: [], pill: [], square: [] };
    expect(support?.sizesByRadius).toEqual(element === 'e11' ? covered : empty);
    expect(support?.outsideSizesByRadius).toEqual(element === 'e12' ? covered : undefined);
    expect(buildSizeSupport(schema.components.button, ['e11', 'e12'])).toEqual({ sizes: ['md:1'] });
    expect(buildComponentScale(schema, 'button')).toEqual({ 's:md:1': true });
  });

  it('publishes independent inside/outside paint and complete horizontal/stacked coverage', async () => {
    const schema = fixture();
    addOutsideRecipe(schema);
    const button = schema.components.button!;
    button.elements.e11!.scales.boxWidth = { 's:md:1': 20 };
    button.elements.e12!.scales.boxWidth = { 's:lg:1': 30 };
    const { maps } = await compile(schema);
    const paint = maps.palettes['default.light']!.button as Record<string, ClassNameByElementJSON>;
    expect(paint.e11?.c?.s?.neutral?.h).not.toEqual(paint.e12?.c?.s?.neutral?.h);
    Object.assign(button.elements, {
      e8: {
        name: 'button-stacked',
        scales: {
          paddingTop: 4,
          paddingRight: 4,
          paddingBottom: 4,
          paddingLeft: 4,
          borderWidth: 1,
          borderRadius: { rounded: 4, square: 0 }
        }
      },
      e9: {
        name: 'button-stacked-label',
        typography: { 's:all': 'caption-medium' },
        scales: { marginTop: 4 }
      },
      e10: { name: 'button-stacked-icon', iconSize: { 's:all': 's:md:1' } }
    });
    const coverage = (size: string) => ({ rounded: [size], pill: [size], square: [size] });
    const stackedCoverage = (size: string) => ({ rounded: [size], pill: [], square: [size] });
    expect(buildButtonIndicatorSupport(button, ['md:1', 'lg:1'])).toEqual({
      sizesByRadius: coverage('md:1'),
      stackedSizesByRadius: stackedCoverage('md:1'),
      outsideSizesByRadius: coverage('lg:1'),
      stackedOutsideSizesByRadius: stackedCoverage('lg:1')
    });
    button.elements.e12!.scales.borderRadius.pill = { 's:lg:1': { 'bp:sm:1': 2 } };
    const support = buildButtonIndicatorSupport(button, ['md:1', 'lg:1']);
    expect(support?.sizesByRadius.pill).toEqual(['md:1']);
    expect(support?.stackedSizesByRadius?.pill).toEqual([]);
    expect(support?.outsideSizesByRadius?.pill).toEqual([]);
    expect(support?.stackedOutsideSizesByRadius?.pill).toEqual([]);
  });

  it('limits complete geometry coverage to existing Button sizes and the active radius baseline', () => {
    const schema = fixture();
    const button = schema.components.button!;
    const sizes = buildSizeSupport(button, ['e11']);
    expect(sizes).toEqual({ sizes: ['md:1'] });
    expect(buildComponentScale(schema, 'button')).toEqual({ 's:md:1': true });
    expect(buildButtonIndicatorSupport(button, sizes.sizes!)).toEqual({
      sizesByRadius: { rounded: ['md:1'], pill: ['md:1'], square: ['md:1'] }
    });
    const scales = button.elements.e11!.scales;
    scales.borderRadius.rounded = { 's:md:1': { 'bp:sm:1': 2 } };
    scales.borderRadius.pill = { 's:md:1': { 'bp:all': 2, 'bp:sm:1': 3 } };
    expect(buildButtonIndicatorSupport(button, ['md:1'])?.sizesByRadius).toEqual({
      rounded: [],
      pill: ['md:1'],
      square: ['md:1']
    });
    delete button.elements.e1!.scales!.borderWidth;
    expect(buildButtonIndicatorSupport(button, ['md:1'])?.sizesByRadius).toEqual({
      rounded: [],
      pill: [],
      square: []
    });
    delete button.elements.e11;
    expect(buildButtonIndicatorSupport(button, ['md:1'])).toBeUndefined();
  });

  it('uses the actual horizontal or stacked border geometry independently', () => {
    const button = fixture().components.button!;
    button.elements.e1!.scales!.borderWidth = { 's:md:1': 1 };
    button.elements.e11!.scales.boxWidth = 20;
    Object.assign(button.elements, {
      e8: {
        name: 'button-stacked',
        scales: {
          paddingTop: 4,
          paddingRight: 4,
          paddingBottom: 4,
          paddingLeft: 4,
          borderWidth: { 's:lg:1': 2 },
          borderRadius: { rounded: 4, square: 0 }
        }
      },
      e9: {
        name: 'button-stacked-label',
        typography: { 's:all': 'caption-medium' },
        scales: { marginTop: 4 }
      },
      e10: { name: 'button-stacked-icon', iconSize: { 's:all': 's:md:1' } }
    });
    const componentSizes = ['md:1', 'lg:1'];
    const all = (sizes: string[]) => ({ rounded: sizes, pill: sizes, square: sizes });
    const stacked = (sizes: string[]) => ({ rounded: sizes, pill: [], square: sizes });
    expect(buildButtonIndicatorSupport(button, componentSizes)).toEqual({
      sizesByRadius: all(['md:1']),
      stackedSizesByRadius: stacked(['lg:1'])
    });
    delete button.elements.e1!.scales!.borderWidth;
    expect(buildButtonIndicatorSupport(button, componentSizes)).toEqual({
      sizesByRadius: all([]),
      stackedSizesByRadius: stacked(['lg:1'])
    });
    button.elements.e1!.scales!.borderWidth = 1;
    (button.elements.e8!.scales as any).borderWidth = undefined;
    expect(buildButtonIndicatorSupport(button, componentSizes)).toEqual({
      sizesByRadius: all(componentSizes),
      stackedSizesByRadius: all([])
    });
  });

  it.each([
    'marginLeft',
    'marginRight'
  ] as const)('requires baseline %s for indicator support', (property) => {
    const button = fixture().components.button!;
    const scales = button.elements.e11!.scales;
    const empty = { rounded: [], pill: [], square: [] };
    (scales as any)[property] = undefined;
    expect(buildButtonIndicatorSupport(button, ['md:1'])?.sizesByRadius).toEqual(empty);
    scales[property] = { 's:md:1': { 'bp:sm:1': 4 } };
    expect(buildButtonIndicatorSupport(button, ['md:1'])?.sizesByRadius).toEqual(empty);
    scales[property] = { 's:md:1': { 'bp:all': 0, 'bp:sm:1': 4 } };
    expect(buildButtonIndicatorSupport(button, ['md:1'])?.sizesByRadius).toEqual({
      rounded: ['md:1'],
      pill: ['md:1'],
      square: ['md:1']
    });
  });

  it.each([
    'e11',
    'e12'
  ] as const)('resolves foreground parent references only in the authorized %s palette', async (element) => {
    const schema = fixture();
    if (element === 'e12') {
      addOutsideRecipe(schema);
      delete schema.components.button!.elements.e11;
    }
    schema.global = {
      foregrounds: {
        profiles: {
          neutral: {
            standard: {
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      high: { rest: '#ffffff' },
                      medium: { rest: '#888888' },
                      low: { rest: '#777777' },
                      lowest: { rest: '#555555' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    const value = fg.parentState('neutral.standard.light.onSubtle.high');
    schema.components.button!.elements[element]!.palettes.default!.light!.onSubtle.boxColor.neutral!
      .high!.selected!.rest = value;
    expect((await compile(schema)).css.palettes['default.light']).toContain('#fff');
    expect(
      buildComponentSurfaceContexts(schema, 'button')?.['default.light']?.onSubtle?.state?.neutral
        ?.high?.selected
    ).toBe(true);
    schema.components.button!.elements.e1!.palettes = {
      default: {
        light: {
          onSubtle: {
            boxColor: { neutral: { high: { rest: fg('neutral.standard.light.onSubtle.high') } } }
          }
        }
      }
    };
    expect(() =>
      convertElementSchemaToStyleKeys(schema, DEFAULT_WEB_STYLE_EMISSION_POLICY)
    ).toThrow('outside textColor');
  });

  it('preserves components without the optional anatomy', async () => {
    const schema = fixture();
    delete schema.components.button!.elements.e11;
    const { maps } = await compile(schema);
    expect((maps.core.button as Record<string, ClassNameByElementJSON>).e11).toBeUndefined();
    expect(maps.palettes).toEqual({});
  });
});
