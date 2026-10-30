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
