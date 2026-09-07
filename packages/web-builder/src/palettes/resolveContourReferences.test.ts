import { contour, type ElementPalettes } from '@kiskadee/core';
import { validateSchemaContoursContract } from '@kiskadee/core/contour-contract';
import { describe, expect, it } from 'vitest';
import { schema } from '../../../presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import { resolveContourReferences } from './resolveContourReferences.ts';
import {
  type ElementPaletteSource,
  resolveElementPaletteSources
} from './resolveElementPaletteSources.ts';

describe('Fluent shared contour pipeline', () => {
  it('aligns neutral borders and vivid Card outlines with context-relative Separator medium', () => {
    expect(() => validateSchemaContoursContract(schema)).not.toThrow();
    const card = resolveElementPaletteSources(schema.components.card!.elements.e1!, schema.global!)
      .palettes!;
    const separator = resolveElementPaletteSources(
      schema.components.separator!.elements.e1!,
      schema.global!
    ).palettes!;
    for (const theme of ['light', 'dark', 'darker'] as const) {
      for (const context of ['onSubtle', 'onVivid'] as const) {
        expect(card.default?.[theme]?.[context]?.borderColor?.primary?.highest?.rest).toBe(
          '#ffffff26'
        );
        expect(
          schema.components.card!.elements.e1!.palettes!.default?.[theme]?.[context]?.borderColor
            ?.primary?.highest?.rest
        ).toBe(contour(`neutral.standard.${theme}.onVivid.medium`));
        const expected =
          context === 'onVivid' ? '#ffffff26' : theme === 'light' ? '#cdd1de' : '#656973';
        expect(separator.default?.[theme]?.[context]?.boxColor?.neutral?.medium?.rest).toBe(
          expected
        );
        for (const states of Object.values(
          card.default?.[theme]?.[context]?.borderColor?.neutral ?? {}
        ))
          expect(states?.rest).toBe(expected);
        expect(separator.default?.[theme]?.[context]?.boxColor?.neutral?.low?.rest).toBe(
          context === 'onVivid' ? '#ffffff14' : theme === 'light' ? '#00000014' : '#ffffff1f'
        );
      }
    }
    const result = convertElementSchemaToStyleKeys(schema);
    expect(JSON.stringify(result)).not.toContain('contour:');
  });
  it('resolves internal separator consumers through the same catalog', () => {
    for (const component of ['dropdown', 'bottomSheet'] as const) {
      const value = schema.components[component];
      let count = 0;
      function visit(node: unknown): void {
        if (!node || typeof node !== 'object') return;
        if ('separator' in node && typeof node.separator === 'object') {
          const result = resolveElementPaletteSources(node as ElementPaletteSource, schema.global!);
          expect(result.palettes?.default?.light?.onSubtle.boxColor?.neutral?.medium?.rest).toBe(
            '#cdd1de'
          );
          count++;
        }
        Object.values(node).forEach(visit);
      }
      visit(value);
      expect(count).toBeGreaterThan(0);
    }
  });
  it('keeps literal schemas unchanged and rejects missing reference coordinates', () => {
    const palettes: ElementPalettes = {
      default: { light: { onSubtle: { boxColor: { neutral: { medium: { rest: '#123456' } } } } } }
    };
    expect(resolveContourReferences(palettes, undefined)).toEqual(palettes);
    palettes.default!.light!.onSubtle.boxColor!.neutral!.medium!.rest = contour(
      'neutral.standard.light.onVivid.highest'
    );
    expect(() => resolveContourReferences(palettes, schema.global!.contours)).toThrow(
      'Cannot resolve contour'
    );
  });
});
