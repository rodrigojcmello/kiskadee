import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  type Breakpoints,
  breakpoints,
  type ClassNameByElementJSON,
  type ComponentStyleKeyMap,
  elementSizeValues,
  layoutColumnCssVariables,
  type Schema,
  type StyleKeyByElement
} from '@kiskadee/core';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import {
  collectClassReferences,
  partitionComponentCss
} from '../component-artifacts/partitionComponentCss.ts';
import { publishComponentResources } from '../component-artifacts/publishComponentResources.ts';
import { convertElementScalesToStyleKeys } from '../phase-1-convert-schema-to-style-keys/scales/convertElementScalesToStyleKeys.ts';
import { mapStyleKeyUsage } from '../phase-2-map-style-key-usage/mapStyleKeyUsage.ts';
import { shortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { generateCssSplit } from '../phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap.ts';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy.ts';
import { compileLayoutArtifacts } from './compileLayoutArtifacts.ts';

const ladder = Object.fromEntries(elementSizeValues.map((size, index) => [size, (index + 1) * 2]));
const frameScales = Object.fromEntries(
  [
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft'
  ].map((name) => [name, ladder])
);
const flowScales = { paddingTop: ladder, paddingLeft: ladder };
const element = (scales: StyleKeyByElement['scales']): StyleKeyByElement => ({
  decorations: [],
  effects: {},
  palettes: {},
  scales
});

function fixture(includeOtherComponent = false, includeAll = false) {
  const frame = convertElementScalesToStyleKeys(frameScales);
  if (includeAll) frame['s:all'] = ['paddingTop__1'];
  const styleKeys: ComponentStyleKeyMap = {
    layout: { e1: element(frame), e2: element(convertElementScalesToStyleKeys(flowScales)) },
    ...(includeOtherComponent
      ? { dropdown: { e4: element({ 's:md:1': ['paddingLeft__12'] }) } }
      : {})
  };
  const policyOptions = { webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY };
  const usage = mapStyleKeyUsage(styleKeys, policyOptions);
  const shortenMap = shortenCssClassNames(usage, { prefix: 'fixture-' });
  const maps = generateClassNamesMapSplit(styleKeys, shortenMap, new Map(), policyOptions);
  const layout = maps.core.layout as Record<'e1' | 'e2', ClassNameByElementJSON>;
  const dropdown = maps.core.dropdown as Record<string, ClassNameByElementJSON> | undefined;
  const compile = (overrides?: Breakpoints) =>
    compileLayoutArtifacts({
      styleKeys,
      coreClassMap: maps.core,
      shortenMap,
      breakpoints: overrides,
      classNamePrefix: 'fixture'
    });
  const generateCss = () => generateCssSplit(styleKeys, shortenMap, policyOptions);
  return { styleKeys, shortenMap, maps, layout, dropdown, compile, generateCss };
}

describe('Layout artifacts', () => {
  it('reuses exact token identities across elements and components without duplicate rules', async () => {
    const { shortenMap, layout, dropdown, compile, generateCss } = fixture(true);
    compile({ 'bp:all': 0 });
    const expected = shortenMap['paddingLeft__12@@t'];
    expect(layout.e1.sp!.pl!['md:1']).toBe(expected);
    expect(layout.e2.sp!.pl!['md:1']).toBe(expected);
    expect(dropdown!.e4!.s!['md:1']).toBe(expected);
    const css = await generateCss();
    let matchingRules = 0;
    postcss.parse(css.coreCss).walkRules(`.${expected}`, () => {
      matchingRules++;
    });
    expect(matchingRules).toBe(1);
    postcss.parse(css.coreCss).walkDecls((decl) => {
      expect(decl.prop).toMatch(/^--k-(?:pd[trbl]|mg[trbl])$/);
    });
  });

  it('keeps all + chosen size per property independent for padding, margin and gap', () => {
    const { shortenMap, layout, compile } = fixture(false, true);
    compile({ 'bp:all': 0 });
    const frame = layout.e1;
    const flow = layout.e2;
    expect(frame.s).toBeUndefined();
    expect(flow.s).toBeUndefined();
    expect(frame.sp!.pt).toEqual(
      expect.objectContaining({
        all: shortenMap['paddingTop__1@@t'],
        'md:1': shortenMap['paddingTop__12@@t']
      })
    );
    expect(frame.sp!.mt!['sm:1']).toBe(shortenMap['marginTop__10@@t']);
    expect(flow.sp!.pt!['lg:1']).toBe(shortenMap['paddingTop__14@@t']);
    expect(Object.keys(flow.sp!)).toEqual(['pt', 'pl']);
    expect(frame.sp!.pt!['md:1']!.split(' ')).toHaveLength(1);
    expect(
      collectClassReferences({
        padding: frame.sp!.pt!['md:1'],
        margin: frame.sp!.mt!['sm:1'],
        gap: flow.sp!.pt!['lg:1']
      }).size
    ).toBe(3);
  });

  it('uses authored breakpoint thresholds in ascending CSS order without publishing pixels', () => {
    const { layout, compile } = fixture();
    const css = compile({ 'bp:lg:1': 700, 'bp:all': 0, 'bp:sm:1': 900 });
    const columns = layout.e2.gc!;
    expect(Object.keys(columns)).toEqual(['bp:all', 'bp:lg:1', 'bp:sm:1']);
    expect(columns).toEqual({
      'bp:all': 'fixture-lc0',
      'bp:lg:1': 'fixture-lc1',
      'bp:sm:1': 'fixture-lc2'
    });
    expect(css.indexOf('(min-width:700px)')).toBeLessThan(css.indexOf('(min-width:900px)'));
    expect(css).not.toContain('min-width:320px');
    expect(css).toContain(
      `.${columns['bp:all']}{grid-template-columns:repeat(var(--k-lyt-gc-all),minmax(0,1fr))}`
    );
    expect(JSON.stringify(columns)).not.toMatch(/700|900|px|min-width/);
    expect(collectClassReferences(columns).size).toBe(3);
    const rules: string[] = [];
    postcss.parse(css).walkRules((rule) => {
      rules.push(rule.selector);
    });
    expect(rules).toEqual(Object.values(columns).map((className) => `.${className}`));
  });

  it('falls back to Core breakpoints and emits one variable consumer for each breakpoint', () => {
    const { layout, compile } = fixture();
    const css = compile();
    expect(Object.keys(layout.e2.gc!)).toHaveLength(Object.keys(breakpoints).length);
    expect(css).toContain(`min-width:${breakpoints['bp:lg:2']}px`);
    expect(Object.values(layout.e2.gc!)).toHaveLength(11);
    for (const [breakpoint, variable] of Object.entries(layoutColumnCssVariables)) {
      const className = layout.e2.gc![breakpoint as keyof typeof layoutColumnCssVariables];
      expect(className).toMatch(/^fixture-lc\d+$/);
      expect(css).toContain(
        `.${className}{grid-template-columns:repeat(var(${variable}),minmax(0,1fr))}`
      );
    }
    const next = fixture();
    next.compile({ 'bp:md:1': 600 });
    expect(Object.keys(next.layout.e2.gc!)).toEqual(['bp:all', 'bp:md:1']);
  });

  it('fails when a published spacing identity is absent or a breakpoint is invalid', () => {
    const { shortenMap, compile } = fixture();
    delete shortenMap['paddingTop__2@@t'];
    expect(() => compile()).toThrow('missing class for paddingTop__2@@t');
    expect(() => fixture().compile({ 'bp:all': 1 })).toThrow('bp:all must remain 0');
    expect(() => fixture().compile({ 'bp:md:1': Number.NaN })).toThrow(
      'invalid breakpoint threshold'
    );
    expect(() => fixture().compile({ 'bp:custom': 600 } as Breakpoints)).toThrow(
      'unsupported breakpoint bp:custom'
    );
    const invalidPolicy = fixture();
    expect(() =>
      compileLayoutArtifacts({
        styleKeys: invalidPolicy.styleKeys,
        coreClassMap: invalidPolicy.maps.core,
        shortenMap: invalidPolicy.shortenMap,
        webStyleEmissionPolicy: {}
      })
    ).toThrow('spacing must use token-only emission');
    expect(compileLayoutArtifacts({ styleKeys: {}, coreClassMap: {}, shortenMap: {} })).toBe('');
  });

  it('keeps responsive CSS attached to Layout through the ordinary component partition', async () => {
    const { maps, layout, compile, generateCss } = fixture();
    const columnCss = compile({ 'bp:all': 0, 'bp:md:1': 600 });
    const css = (await generateCss()).coreCss + columnCss;
    const partitions = partitionComponentCss(css, maps.core);
    expect(partitions.every((part) => part.consumers.includes('layout'))).toBe(true);
    const published = partitions.map((part) => part.css).join('');
    const breakpointClass = layout.e2.gc!['bp:md:1']!;
    const root = postcss.parse(published);
    let media: string | undefined;
    root.walkRules(`.${breakpointClass}`, (rule) => {
      expect(rule.nodes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            prop: 'grid-template-columns',
            value: 'repeat(var(--k-lyt-gc-md1),minmax(0,1fr))'
          })
        ])
      );
      media = rule.parent?.type === 'atrule' ? rule.parent.params : undefined;
    });
    expect(media).toBe('(min-width:600px)');
  });

  it('publishes complete scale-only resources without a palette or viewport evaluation', async () => {
    const { maps, compile, generateCss } = fixture();
    const css = (await generateCss()).coreCss + compile({ 'bp:all': 0, 'bp:md:1': 640 });
    const dir = await mkdtemp(join(tmpdir(), 'kiskadee-layout-publication-'));
    const write = async (path: string, value: unknown) => {
      await mkdir(dirname(join(dir, path)), { recursive: true });
      await writeFile(join(dir, path), typeof value === 'string' ? value : JSON.stringify(value));
    };
    try {
      await write('manifest.json', {
        themes: {},
        components: {
          layout: { artifacts: { classMaps: { core: 'class-maps/core/layout.json' } } }
        }
      });
      await write('global.kiskadee.json', {});
      await write('core.kiskadee.json', maps.core);
      await write('core.kiskadee.css', css);
      await write('class-maps/core/layout.json', {
        component: 'layout',
        classMap: maps.core.layout
      });
      await publishComponentResources(dir, {
        components: {
          layout: {
            elements: {
              e1: { name: 'frame', scales: frameScales },
              e2: { name: 'flow', scales: flowScales }
            }
          }
        }
      } as unknown as Schema);
      const metadata = JSON.parse(
        await readFile(join(dir, 'components/layout.kiskadee.json'), 'utf8')
      );
      expect(metadata.resources.palettes).toEqual({});
      expect(metadata.resources.core).toBe('class-maps/core/layout.json');
      expect(metadata.sizeSupport.sizes).toHaveLength(11);
      expect(metadata.resources.styles.length).toBeGreaterThan(0);
      const published = (
        await Promise.all(
          metadata.resources.styles.map((resource: { path: string }) =>
            readFile(join(dir, resource.path), 'utf8')
          )
        )
      ).join('');
      expect(published).toContain('min-width:640px');
      expect(published).toContain(
        'grid-template-columns:repeat(var(--k-lyt-gc-md1),minmax(0,1fr))'
      );
      expect(published).toContain(
        'grid-template-columns:repeat(var(--k-lyt-gc-all),minmax(0,1fr))'
      );
      expect(published).not.toMatch(/repeat\(\d+,/);
      expect(published).toContain('--k-mgt:');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
