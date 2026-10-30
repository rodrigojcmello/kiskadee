import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ClassNameByElementJSON, ComponentStyleKeyMap } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import {
  buildScopedToneMetadataKey,
  type ToneMetadataByPalette
} from '../phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys.ts';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap.ts';
import { persistBuildArtifacts } from '../phase-6-persist-build-artifacts/persistBuildArtifacts.ts';
import type { ButtonSelectionRestClassMapJSON } from './buttonSelectionArtifact.ts';
import { collectClassReferences, partitionComponentCss } from './partitionComponentCss.ts';

type ButtonMap = Record<string, ClassNameByElementJSON> & {
  selectionRest?: ButtonSelectionRestClassMapJSON;
};

function fixture() {
  const normalStates = ['rest', 'hover', 'focus', 'pressed', 'pending', 'disabled'] as const;
  const selectedStates = ['selected:rest', 'selected:hover', 'selected:focus', 'selected:pressed'];
  const shorten: Record<string, string> = {};
  const metadata: ToneMetadataByPalette = new Map();
  const palettes = (element: string, tone: 'high' | 'medium' = 'high') => {
    const scope = { componentName: 'button', elementName: element };
    const colors: Record<string, string[]> = {};
    for (const state of [...normalStates, ...selectedStates]) {
      const property = element === 'e1' ? 'boxColor' : 'textColor';
      const marker = element === 'e1' ? '--' : '==';
      const key = `${property}${state === 'rest' ? '' : `${marker}${state}`}__${element}-${state}`;
      const className = `${element}-${state.replace(':', '-')}`;
      shorten[key] = className;
      colors[state] = [key];
      const byTone = metadata.get('default.light.onSubtle') ?? new Map();
      byTone.set(buildScopedToneMetadataKey(scope, `neutral::${key}`), { tones: [tone] });
      metadata.set('default.light.onSubtle', byTone);
    }
    return { default: { light: { onSubtle: { neutral: colors } } } };
  };
  const effects = {
    rest: ['shadow__rest-shadow', 'borderRadiusRounded++s:md:1__4'],
    hover: ['shadow--hover__hover-shadow'],
    'selected:rest': ['shadow--selected:rest__selected-shadow'],
    'selected:hover': ['borderRadiusRounded--selected:hover++s:md:1__2']
  };
  Object.assign(shorten, {
    'shadow__rest-shadow': 'shadow-rest',
    'shadow--hover__hover-shadow': 'shadow-hover',
    'shadow--selected:rest__selected-shadow': 'shadow-selected',
    'borderRadiusRounded++s:md:1__4@@m': 'radius-rest',
    'borderRadiusRounded--selected:hover++s:md:1__2@@m': 'radius-selected',
    paddingTop__8: 'padding'
  });
  const elements = {
    e1: { effects, scales: { 's:md:1': ['paddingTop__8'] }, palettes: palettes('e1') },
    e2: { palettes: palettes('e2') },
    e3: { palettes: palettes('e3') },
    e4: { palettes: palettes('e4', 'medium') },
    e5: { palettes: palettes('e5') },
    e11: { palettes: palettes('e11') }
  };
  const styleKeys = {
    button: elements,
    card: { e1: { effects } }
  } as unknown as ComponentStyleKeyMap;
  return { styleKeys, shorten, metadata, elements };
}

describe('Button High Rest class projection', () => {
  it('reuses normal High palette/effect classes without any Selected rules or geometry', () => {
    const { styleKeys, shorten, metadata } = fixture();
    const output = generateClassNamesMapSplit(styleKeys, shorten, metadata);
    const core = output.core.button as ButtonMap;
    const palette = output.palettes['default.light'].button as ButtonMap;
    expect(core.selectionRest?.e1?.e).toEqual({
      h: { all: 'shadow-rest shadow-hover' },
      rr: { 'md:1': 'radius-rest' }
    });
    expect(core.e1.e?.h).toEqual({ all: 'shadow-rest shadow-hover shadow-selected' });
    expect(palette.e1.c?.s?.neutral.h).toContain('e1-selected-rest');
    for (const element of ['e1', 'e2', 'e3', 'e5'] as const) {
      const classes = palette.selectionRest?.[element]?.c?.s?.neutral.h;
      expect(classes?.split(' ')).toEqual([
        `${element}-rest`,
        `${element}-hover`,
        `${element}-focus`,
        `${element}-pressed`,
        `${element}-pending`,
        `${element}-disabled`
      ]);
      expect(classes).not.toContain('selected');
      expect(palette.selectionRest?.[element]).not.toHaveProperty('s');
      expect(palette.selectionRest?.[element]).not.toHaveProperty('d');
      expect(core.selectionRest?.[element]).not.toHaveProperty('l');
    }
    expect(palette.selectionRest?.e4?.c?.s?.neutral.m).toContain('e4-rest');
    expect(palette.selectionRest?.e4?.c?.s?.neutral.m).not.toContain('selected');
    expect(core.selectionRest).not.toHaveProperty('e11');
    expect(output.core.card).not.toHaveProperty('selectionRest');
    const projected = collectClassReferences([core.selectionRest, palette.selectionRest]);
    const ordinary = collectClassReferences([
      ...Object.entries(core)
        .filter(([key]) => key !== 'selectionRest')
        .map(([, value]) => value),
      ...Object.entries(palette)
        .filter(([key]) => key !== 'selectionRest')
        .map(([, value]) => value)
    ]);
    expect([...projected].every((className) => ordinary.has(className))).toBe(true);
    const css = '.shadow-rest{box-shadow:none}.e1-rest{background:#fff}';
    expect(partitionComponentCss(css, { button: core })).toEqual(
      partitionComponentCss(css, { button: { e1: core.e1 } })
    );
  });

  it('does not claim High when only Selected High is authored and preserves old components', () => {
    const { styleKeys, shorten, metadata, elements } = fixture();
    elements.e1.palettes.default.light.onSubtle.neutral = {
      'selected:rest': elements.e1.palettes.default.light.onSubtle.neutral['selected:rest']
    };
    const output = generateClassNamesMapSplit(styleKeys, shorten, metadata);
    const palette = output.palettes['default.light'].button as ButtonMap;
    expect(palette.selectionRest?.e1?.c).toBeUndefined();
    expect(palette.e1.c?.s?.neutral.h).toBe('e1-selected-rest');
    expect((output.core.card as ButtonMap).selectionRest).toBeUndefined();
  });

  it('persists the optional projection in core and palette resources without emitting duplicate CSS', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'kiskadee-selection-rest-'));
    try {
      const { styleKeys, shorten, metadata } = fixture();
      const output = generateClassNamesMapSplit(styleKeys, shorten, metadata);
      await persistBuildArtifacts(
        {
          coreCss: '.padding{padding-top:8px}',
          effectsCss: '.shadow-rest{box-shadow:none}',
          palettes: { 'default.light': '.e1-rest{background:#fff}' }
        },
        output,
        dir
      );
      const core = JSON.parse(
        await readFile(join(dir, 'class-maps/core/button.kiskadee.json'), 'utf8')
      );
      const palette = JSON.parse(
        await readFile(join(dir, 'class-maps/default.light/button.kiskadee.json'), 'utf8')
      );
      expect(core.classMap.selectionRest.e1.e.h.all).toBe('shadow-rest shadow-hover');
      expect(palette.classMap.selectionRest.e1.c.s.neutral.h).toContain('e1-rest');
      expect(await readFile(join(dir, 'default.light.kiskadee.css'), 'utf8')).toBe(
        '.e1-rest{background:#fff}'
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
