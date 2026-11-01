import type { ClassNameByElementJSON, ComponentStyleKeyMap } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema as fluent } from '../../../presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { schema as material } from '../../../presets/src/presets/material-3-google/material-3-google.schema.ts';
import { compileDensityClassMaps, resolveSchemaDensityMaps } from '../density/compileDensity.ts';
import {
  buildScopedToneMetadataKey,
  type ToneMetadataByPalette
} from '../phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys.ts';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import { mapStyleKeyUsage } from '../phase-2-map-style-key-usage/mapStyleKeyUsage.ts';
import { shortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { generateCssSplit } from '../phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap.ts';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy.ts';
import {
  BUTTON_GROUP_BORDER_SUPPRESSION_STYLE_KEY,
  type ButtonGroupClassMapJSON,
  compileButtonGroupArtifact
} from './buttonGroupArtifact.ts';
import { collectClassReferences } from './partitionComponentCss.ts';

type ButtonMap = Record<string, ClassNameByElementJSON> & { group?: ButtonGroupClassMapJSON };

function fixture() {
  const metadata: ToneMetadataByPalette = new Map();
  const names: Record<string, string> = {
    [BUTTON_GROUP_BORDER_SUPPRESSION_STYLE_KEY]: 'border-off',
    borderStyle__solid: 'border-style',
    textAlign__center: 'text-align',
    borderWidth__1: 'border-width',
    paddingTop__8: 'padding',
    borderRadiusRounded__4: 'radius-rounded',
    borderRadiusPill__16: 'radius-pill',
    borderRadiusSquare__0: 'radius-square'
  };
  const states = ['rest', 'hover', 'pressed', 'disabled', 'selected:rest', 'selected:hover'];
  const palettes: Record<string, unknown> = {};
  let sequence = 0;
  for (const segment of ['default', 'brand']) {
    const themes: Record<string, unknown> = {};
    palettes[segment] = themes;
    for (const theme of ['light', 'dark']) {
      const contexts: Record<string, unknown> = {};
      themes[theme] = contexts;
      for (const context of ['onSubtle', 'onVivid']) {
        const colors: Record<string, string[]> = {};
        contexts[context] = { neutral: colors };
        const tones = new Map();
        metadata.set(`${segment}.${theme}.${context}`, tones);
        for (const state of states) {
          colors[state] = [];
          for (const tone of ['medium', 'high'] as const) {
            for (const property of [
              'boxColor',
              'borderColor',
              'borderTopColor',
              'borderRightColor',
              'borderBottomColor',
              'borderLeftColor'
            ]) {
              const key = `${property}--${state}__fixture-${sequence++}`;
              const name = `${segment}-${theme}-${context}-${tone}-${property}-${state.replace(':', '-')}`;
              names[key] = name;
              colors[state].push(key);
              tones.set(
                buildScopedToneMetadataKey(
                  { componentName: 'button', elementName: 'e1' },
                  `neutral::${key}`
                ),
                { tones: [tone] }
              );
            }
          }
        }
      }
    }
  }
  const element = {
    decorations: ['borderStyle__solid', 'textAlign__center'],
    scales: { 's:md:1': ['borderWidth__1', 'paddingTop__8'] },
    radiusScales: {
      rounded: { 's:md:1': ['borderRadiusRounded__4'] },
      pill: { 's:md:1': ['borderRadiusPill__16'] },
      square: { 's:all': ['borderRadiusSquare__0'] }
    },
    palettes
  };
  return { element, metadata, names };
}

function paintFixture(
  authored: Record<string, Record<string, string> | undefined>,
  options: { context?: 'onSubtle' | 'onVivid'; tone?: 'medium' | 'high'; semantic?: string } = {}
) {
  const metadata: ToneMetadataByPalette = new Map();
  const context = options.context ?? 'onVivid';
  const tone = options.tone ?? 'medium';
  const semantic = options.semantic ?? 'neutral';
  const palettes: Record<string, unknown> = {};
  for (const segment of ['default', 'brand']) {
    const themes: Record<string, unknown> = {};
    palettes[segment] = themes;
    for (const theme of ['light', 'dark']) {
      const states: Record<string, string[]> = {};
      const tones = new Map();
      metadata.set(`${segment}.${theme}.${context}`, tones);
      themes[theme] = { [context]: { [semantic]: states } };
      for (const [state, declarations] of Object.entries(authored)) {
        if (!declarations) continue;
        states[state] = Object.entries(declarations).map(([property, value]) => {
          const key = `${property}--${state}__${value}`;
          tones.set(
            buildScopedToneMetadataKey(
              { componentName: 'button', elementName: 'e1' },
              `${semantic}::${key}`
            ),
            { tones: [tone] }
          );
          return key;
        });
      }
    }
  }
  return compileButtonGroupArtifact(
    { palettes },
    { componentName: 'button', elementName: 'e1' },
    metadata,
    (key) => key,
    true
  )!;
}

describe('Button Group class projection', () => {
  it('publishes only perimeter geometry, without padding or unrelated decoration', () => {
    const { element, metadata, names } = fixture();
    const output = compileButtonGroupArtifact(
      element,
      { componentName: 'button', elementName: 'e1' },
      metadata,
      (key) => names[key]!,
      true
    )!;
    expect(output.core.frame).toEqual({
      d: 'border-style',
      s: { 'md:1': 'border-width' },
      rr: { 'md:1': 'radius-rounded' },
      rp: { 'md:1': 'radius-pill' },
      rs: { all: 'radius-square' }
    });
    expect(output.core.member).toEqual({ d: 'border-off' });
    expect(output.core.selectionRestMember).toEqual({ d: 'border-off' });
  });

  it('keeps strict Rest per-side perimeter colors and all independent member surface states', () => {
    const { element, metadata, names } = fixture();
    const output = compileButtonGroupArtifact(
      element,
      { componentName: 'button', elementName: 'e1' },
      metadata,
      (key) => names[key]!,
      true
    )!;
    for (const [bundle, group] of Object.entries(output.palettes)) {
      for (const context of ['s', 'v'] as const) {
        for (const tone of ['m', 'h'] as const) {
          const frame = group.frame?.c?.[context]?.neutral[tone]?.split(' ');
          expect(frame).toHaveLength(5);
          expect(frame?.every((name) => name.endsWith('-rest') && !name.includes('selected'))).toBe(
            true
          );
          expect(frame?.some((name) => name.includes('borderBottomColor'))).toBe(true);
          expect(frame?.some((name) => name.includes('borderLeftColor'))).toBe(true);
          const member = group.member?.c?.[context]?.neutral[tone];
          expect(member).toContain('boxColor-selected-hover');
          expect(member).toContain('boxColor-disabled');
          expect(member).not.toContain('border');
        }
        const high = group.selectionRestMember?.c?.[context]?.neutral.h;
        expect(high).toContain('boxColor-rest');
        expect(high).toContain('boxColor-hover');
        expect(high).not.toContain('selected');
        expect(high).not.toContain('border');
        expect(group.selectionRestMember?.c?.[context]?.neutral.m).toBeUndefined();
      }
      expect(bundle).toMatch(/^(default|brand)\.(light|dark)$/);
    }
    expect(
      [...collectClassReferences([output.core, output.palettes])].every((name) =>
        Object.values(names).includes(name)
      )
    ).toBe(true);
  });

  it('publishes palette-scoped omissions only for a fully transparent effective perimeter', () => {
    const output = paintFixture({
      rest: { borderColor: '#ffffff1a' },
      pressed: { borderColor: '#ffffff00' },
      'selected:rest': { borderColor: '#0000' },
      'selected:hover': { borderColor: '#00000000' }
    });
    expect(output.core).not.toHaveProperty('frameOmissions');
    for (const [bundle, group] of Object.entries(output.palettes)) {
      expect(bundle).toMatch(/^(default|brand)\.(light|dark)$/);
      expect(group.frameOmissions).toEqual({
        v: { neutral: { m: { pressed: true, selected: true } } }
      });
      expect(group.frame?.c?.v?.neutral.m).toBe('borderColor--rest__#ffffff1a');
      expect(group.member?.c?.v?.neutral.m).toBeUndefined();
    }
    const other = paintFixture(
      { rest: { borderColor: '#fff' }, pressed: { borderColor: '#fff0' } },
      {
        context: 'onSubtle',
        tone: 'high',
        semantic: 'primary'
      }
    );
    expect(other.palettes['brand.dark'].frameOmissions).toEqual({
      s: { primary: { h: { pressed: true } } }
    });
  });

  it('keeps specific Rest side paint when a state only clears the shorthand', () => {
    const output = paintFixture({
      rest: { borderColor: '#ffffff1a', borderBottomColor: '#ffffff80' },
      pressed: { borderColor: '#ffffff00' },
      'selected:rest': { borderColor: '#00000000' }
    });
    expect(Object.values(output.palettes).every((group) => !group.frameOmissions)).toBe(true);
    const allSides = paintFixture({
      rest: { borderColor: '#ffffff1a', borderBottomColor: '#ffffff80' },
      pressed: { borderColor: '#ffffff00', borderBottomColor: '#00000000' },
      'selected:rest': { borderColor: '#00000000', borderBottomColor: '#ffffff00' }
    });
    expect(allSides.palettes['default.light'].frameOmissions?.v?.neutral?.m).toEqual({
      pressed: true,
      selected: true
    });
  });

  it.each([
    'hover',
    'focus'
  ])('retains the frame when %s side paint can persist during Pressed', (interaction) => {
    const output = paintFixture({
      rest: { borderColor: '#ffffff1a' },
      [interaction]: { borderBottomColor: '#fff' },
      pressed: { borderColor: '#ffffff00' }
    });
    expect(Object.values(output.palettes).every((group) => !group.frameOmissions)).toBe(true);

    const reset = paintFixture({
      rest: { borderColor: '#ffffff1a' },
      [interaction]: { borderBottomColor: '#fff' },
      pressed: { borderColor: '#ffffff00', borderBottomColor: '#fff0' }
    });
    expect(reset.palettes['default.light'].frameOmissions?.v?.neutral?.m).toEqual({
      pressed: true
    });
  });

  it('checks a press without Focus even when Focus clears Hover side paint', () => {
    const output = paintFixture({
      rest: { borderColor: '#ffffff1a' },
      hover: { borderBottomColor: '#fff' },
      focus: { borderBottomColor: '#fff0' },
      pressed: { borderColor: '#ffffff00' }
    });
    expect(Object.values(output.palettes).every((group) => !group.frameOmissions)).toBe(true);
  });

  it.each([
    '#ffffff01',
    'var(--border)',
    'color-mix(in srgb, #fff 0%, transparent)',
    '{"type":"linear"}'
  ])('does not infer omission from a nontransparent or unresolved state paint (%s)', (value) => {
    const output = paintFixture({
      rest: { borderColor: '#ffffff1a' },
      pressed: { borderColor: value },
      'selected:rest': { borderColor: value }
    });
    expect(Object.values(output.palettes).every((group) => !group.frameOmissions)).toBe(true);
  });

  it('requires consistent Selected substates and accounts for base interaction deltas', () => {
    for (const declarations of [
      { hover: { borderColor: '#fff' } },
      { 'selected:hover': { borderColor: '#fff' } },
      { 'selected:pressed': { borderBottomColor: '#fff' } },
      { 'selected:focus': { borderLeftColor: 'var(--border)' } }
    ]) {
      const output = paintFixture({
        rest: { borderColor: '#ffffff1a' },
        pressed: { borderColor: '#ffffff00' },
        'selected:rest': { borderColor: '#00000000' },
        ...declarations
      });
      expect(output.palettes['default.light'].frameOmissions?.v?.neutral?.m).toEqual({
        pressed: true
      });
    }
    const reset = paintFixture({
      rest: { borderColor: '#ffffff1a' },
      hover: { borderColor: '#fff' },
      'selected:rest': { borderColor: '#00000000' },
      'selected:hover': { borderColor: '#00000000' }
    });
    expect(reset.palettes['default.light'].frameOmissions?.v?.neutral?.m).toEqual({
      selected: true
    });
  });

  it('omits metadata for missing state deltas or a perimeter already transparent at Rest', () => {
    for (const authored of [
      { rest: { borderColor: '#ffffff1a' } },
      {
        rest: { borderColor: '#ffffff00' },
        pressed: { borderColor: '#0000' },
        'selected:rest': { borderColor: '#00000000' }
      },
      { rest: { borderColor: 'var(--rest)' }, pressed: { borderColor: '#0000' } }
    ]) {
      const output = paintFixture(authored);
      expect(Object.values(output.palettes).every((group) => !group.frameOmissions)).toBe(true);
    }
  });

  it('publishes optional Group recipes through the ordinary component artifact', () => {
    const { element, metadata, names } = fixture();
    const styleKeys = {
      button: { e1: element, e6: { decorations: ['borderStyle__solid'] } },
      card: { e1: element }
    } as unknown as ComponentStyleKeyMap;
    const output = generateClassNamesMapSplit(styleKeys, names, metadata);
    const core = output.core.button as ButtonMap;
    const palette = output.palettes['brand.dark'].button as ButtonMap;
    expect(core.group?.frame?.s?.['md:1']).toBe('border-width');
    expect(palette.group?.frame?.c?.s?.neutral.m).toContain('borderBottomColor-rest');
    expect(palette.group?.member?.c?.v?.neutral.h).not.toContain('border');
    expect(output.core.card).not.toHaveProperty('group');
    expect(core.e1.s?.['md:1']).toContain('padding');
  });

  it('preserves the old artifact when the suppression utility has not been emitted', () => {
    const { element, metadata, names } = fixture();
    delete names[BUTTON_GROUP_BORDER_SUPPRESSION_STYLE_KEY];
    const output = generateClassNamesMapSplit(
      {
        button: { e1: element, e6: { decorations: ['borderStyle__solid'] } }
      } as unknown as ComponentStyleKeyMap,
      names,
      metadata
    );
    expect(output.core.button).not.toHaveProperty('group');
    expect(output.palettes['default.light'].button).not.toHaveProperty('group');
  });

  it('omits Group recipes without divider anatomy even if another component emitted suppression', () => {
    const { element, metadata, names } = fixture();
    const output = generateClassNamesMapSplit(
      { button: { e1: element } } as unknown as ComponentStyleKeyMap,
      names,
      metadata
    );
    expect(output.core.button).not.toHaveProperty('group');
    expect(output.palettes['default.light'].button).not.toHaveProperty('group');
  });

  it.each([
    ['Fluent', fluent],
    ['Material', material]
  ])('preserves native %s utilities and emits suppression once through the real pipeline', async (_name, schema) => {
    const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys(
      { ...schema, components: { button: schema.components.button } },
      DEFAULT_WEB_STYLE_EMISSION_POLICY
    );
    const hasGroup = Boolean(schema.components.button?.elements.e6);
    const additional = hasGroup ? [BUTTON_GROUP_BORDER_SUPPRESSION_STYLE_KEY] : [];
    const names = shortenCssClassNames(
      mapStyleKeyUsage(styleKeys, {
        webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY,
        additionalStyleKeys: additional
      })
    );
    const output = generateClassNamesMapSplit(styleKeys, names, toneMetadataByPalette, {
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
    });
    const core = output.core.button as ButtonMap;
    const off = names[BUTTON_GROUP_BORDER_SUPPRESSION_STYLE_KEY]!;
    if (hasGroup) {
      expect(core.group?.member?.d).toBe(off);
      expect(core.group?.frame?.s).toBeDefined();
    } else {
      expect(core).not.toHaveProperty('group');
    }
    const ordinary = collectClassReferences(core.e1);
    expect([...collectClassReferences(core.group?.frame)].every((name) => ordinary.has(name))).toBe(
      true
    );
    compileDensityClassMaps(output.core, resolveSchemaDensityMaps(schema));
    if (_name === 'Fluent') {
      for (const segment of ['default', 'teams']) {
        const palette = output.palettes[`${segment}.light`].button as ButtonMap;
        for (const intent of ['primary', 'neutral', 'destructive', 'positive']) {
          expect(palette.group?.frameOmissions?.v?.[intent]?.m).toEqual({
            pressed: true,
            selected: true
          });
          expect(palette.group?.frameOmissions?.s?.[intent]?.m).toBeUndefined();
          const dark = output.palettes[`${segment}.dark`].button as ButtonMap;
          expect(dark.group?.frameOmissions?.v?.[intent]?.m).toBeUndefined();
        }
      }
      expect(core.group?.frame?.s?.a).toBeTruthy();
      for (const radius of ['rr', 'rp', 'rs'] as const) {
        if (core.e1[radius]?.a) expect(core.group?.frame?.[radius]?.a).toBe(core.e1[radius]?.a);
      }
      const adaptiveRoot = new Set(core.e1.s?.a?.split(' '));
      expect(core.group?.frame?.s?.a?.split(' ').every((name) => adaptiveRoot.has(name))).toBe(
        true
      );
    }
    for (const palette of Object.values(output.palettes)) {
      const button = palette.button as ButtonMap;
      if (!hasGroup) expect(button).not.toHaveProperty('group');
      const normal = collectClassReferences(button.e1);
      expect([...collectClassReferences(button.group)].every((name) => normal.has(name))).toBe(
        true
      );
      for (const contexts of Object.values(button.group?.frame?.c ?? {})) {
        for (const emphasis of Object.values(contexts)) {
          for (const classes of Object.values(emphasis)) {
            expect(classes).not.toContain('--');
          }
        }
      }
    }
    const css = await generateCssSplit(styleKeys, names, {
      forceState: true,
      breakpoints: schema.breakpoints,
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY,
      additionalCoreStyleKeys: additional
    });
    if (hasGroup) {
      const suppressionRules = css.coreCss.match(new RegExp(`\\.${off}\\s*\\{[^}]*\\}`, 'g'));
      expect(suppressionRules).toHaveLength(1);
      expect(suppressionRules?.[0]).toMatch(/border-color:\s*(?:#0{4,8}|rgba?\()/);
    } else {
      expect(css).toEqual(
        await generateCssSplit(styleKeys, names, {
          forceState: true,
          breakpoints: schema.breakpoints,
          webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
        })
      );
    }
  });
});
