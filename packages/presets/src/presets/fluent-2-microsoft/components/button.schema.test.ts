import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

const THEMES = ['light', 'dark', 'darker'] as const;
const INTENTS = ['primary', 'neutral', 'destructive', 'positive'] as const;
const EMPHASES = ['high', 'medium', 'low', 'lowest'] as const;

function requireButtonSurfaceElement() {
  const element = schema.components.button?.elements.e1;
  if (!element?.palettes) throw new Error('Fluent Button surface schema is missing');
  return { ...element, palettes: element.palettes };
}

function requireButtonContentElement() {
  const element = schema.components.button?.elements.e2;
  if (!element?.palettes) throw new Error('Fluent Button content schema is missing');
  return { ...element, palettes: element.palettes };
}

describe('Fluent 2 Button surface contexts', () => {
  it('preserves the approved default anchors', () => {
    const e1 = requireButtonSurfaceElement();
    const palettes = e1.palettes.default;

    expect(palettes?.light?.default.boxColor?.primary?.high?.rest).toBe('#0064b4');
    expect(palettes?.dark?.default.boxColor?.primary?.high?.rest).toBe('#0064b4');
    expect(palettes?.darker?.default.boxColor?.primary?.high?.rest).toBe('#005ba4');
  });

  it('publishes the complete inverse matrix for every Fluent theme', () => {
    const e1 = requireButtonSurfaceElement();
    const e2 = requireButtonContentElement();

    for (const theme of THEMES) {
      const surface = e1.palettes.default?.[theme]?.inverse;
      const content = e2.palettes.default?.[theme]?.inverse;
      expect(surface).toBeDefined();
      expect(content).toBeDefined();

      for (const intent of INTENTS) {
        for (const emphasis of EMPHASES) {
          expect(surface?.boxColor?.[intent]?.[emphasis]?.rest).toBeDefined();
          expect(surface?.borderColor?.[intent]?.[emphasis]?.rest).toBeDefined();
          expect(content?.textColor?.[intent]?.[emphasis]?.rest).toBeDefined();
        }
      }
    }
  });

  it('uses one physical inverse recipe independently from the global theme', () => {
    const e1 = requireButtonSurfaceElement();
    const e2 = requireButtonContentElement();

    expect(e1.palettes.default?.dark?.inverse).toEqual(e1.palettes.default?.light?.inverse);
    expect(e1.palettes.default?.darker?.inverse).toEqual(e1.palettes.default?.light?.inverse);
    expect(e2.palettes.default?.dark?.inverse).toEqual(e2.palettes.default?.light?.inverse);
    expect(e2.palettes.default?.darker?.inverse).toEqual(e2.palettes.default?.light?.inverse);
  });

  it('adapts the official Primary inverted state rhythm without duplicate focus colors', () => {
    const e1 = requireButtonSurfaceElement();
    const e2 = requireButtonContentElement();
    const surface = e1.palettes.default?.light?.inverse;
    const content = e2.palettes.default?.light?.inverse;

    expect(surface?.boxColor?.primary?.high).toEqual({
      rest: '#ffffff',
      hover: '#e1efff',
      pressed: '#a4cfff',
      disabled: '#ffffff1a',
      selected: { rest: '#c1deff' }
    });
    expect(content?.textColor?.primary?.high).toEqual({
      rest: '#0064b4',
      hover: { ref: '#0059a1' },
      pressed: { ref: '#0d477e' },
      disabled: { ref: '#ffffff66' },
      selected: { rest: { ref: '#045091' } }
    });
    expect(surface?.boxColor?.primary?.high).not.toHaveProperty('focus');
    expect(content?.textColor?.primary?.high).not.toHaveProperty('focus');
  });

  it('keeps inverse lower emphases static and surface-relative', () => {
    const e1 = requireButtonSurfaceElement();
    const surface = e1.palettes.default?.light?.inverse;

    expect(surface?.boxColor?.primary?.medium).toMatchObject({
      rest: '#ffffff47',
      hover: '#ffffff5c',
      pressed: '#ffffff70',
      disabled: '#ffffff1a',
      selected: { rest: '#ffffff5c' }
    });
    expect(surface?.boxColor?.primary?.low).toMatchObject({
      rest: '#ffffff00',
      hover: '#0000001a',
      pressed: '#0000004d',
      disabled: '#ffffff1a',
      selected: { rest: '#00000033' }
    });
    expect(surface?.boxColor?.primary?.lowest).not.toHaveProperty('disabled');
    expect(surface?.borderColor?.primary?.low).toEqual({
      rest: '#ffffff',
      disabled: '#ffffff00'
    });
  });
});
