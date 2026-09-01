import type { ElementPalettes } from '@kiskadee/core';
import { schema } from '@kiskadee/presets/src/presets/fluent-2-microsoft/index.ts';
import { describe, expect, it } from 'vitest';
import { resolveElementPaletteSources } from '../palettes/resolveElementPaletteSources.ts';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';

function resolveButtonElement(elementName: 'e2' | 'e3' | 'e4') {
  const element = schema.components.button?.elements[elementName];
  if (!element?.palettes || !schema.global?.foregrounds) {
    throw new Error(`Expected Fluent Button ${elementName} palettes and global foregrounds.`);
  }
  const result = resolveElementPaletteSources(
    { palettes: element.palettes as ElementPalettes },
    { foregrounds: schema.global.foregrounds }
  );
  if (!result.palettes) throw new Error(`Expected resolved Fluent Button ${elementName} palettes.`);
  return result.palettes;
}

describe('Fluent Button global foreground pipeline', () => {
  it('resolves canonical label coordinates while preserving parent-state projection', () => {
    const e2 = resolveButtonElement('e2');
    const lightOnVivid = e2.default?.light?.onVivid?.textColor;

    expect(lightOnVivid?.primary?.high).toEqual({
      rest: '#0064b4',
      hover: { ref: '#0059a1' },
      pressed: { ref: '#0d477e' },
      pending: { ref: '#0064b4b3' },
      disabled: { ref: '#ffffff66' },
      selected: { rest: { ref: '#0d477e' } }
    });
    expect({
      primary: lightOnVivid?.primary?.medium?.rest,
      neutral: lightOnVivid?.neutral?.medium?.rest,
      destructive: lightOnVivid?.destructive?.medium?.rest,
      positive: lightOnVivid?.positive?.medium?.rest
    }).toEqual({
      primary: '#d3e7ff',
      neutral: '#d6dbe7',
      destructive: '#ffdbd7',
      positive: '#d4edd2'
    });
    expect(e2.default?.light?.onSubtle?.textColor?.destructive?.medium?.rest).toBe('#811819');
    expect(e2.default?.dark?.onSubtle?.textColor?.neutral?.high?.rest).toBe('#000000');
  });

  it('keeps icon Pending absent and resolves the icon-region label independently', () => {
    const e3 = resolveButtonElement('e3');
    const e4 = resolveButtonElement('e4');

    expect(e3.default?.light?.onVivid?.textColor?.primary?.high).not.toHaveProperty('pending');
    expect(e4.default?.dark?.onVivid?.textColor?.neutral?.medium?.rest).toBe('#21242d');
  });

  it('does not let an fg token reach Style Key generation', () => {
    const { styleKeys } = convertElementSchemaToStyleKeys(schema);
    const serialized = JSON.stringify(styleKeys.button);

    expect(serialized).not.toContain('fg:');
    expect(serialized).not.toContain('parentState');
    expect(serialized).toContain('textColor__#0064b4');
    expect(serialized).toContain('textColor==hover__#0059a1');
  });
});
