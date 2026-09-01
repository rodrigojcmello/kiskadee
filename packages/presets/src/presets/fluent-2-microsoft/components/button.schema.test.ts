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

function requireButtonIconElement() {
  const element = schema.components.button?.elements.e3;
  if (!element?.palettes) throw new Error('Fluent Button icon schema is missing');
  return { ...element, palettes: element.palettes };
}

function requireButtonDividerElement() {
  const element = schema.components.button?.elements.e6;
  if (!element?.palettes) throw new Error('Fluent Button divider schema is missing');
  return { ...element, palettes: element.palettes };
}

function requireButtonBadgeRelationElement() {
  const element = schema.components.button?.elements.e7;
  if (!element?.scales) throw new Error('Fluent Button Badge relation schema is missing');
  return element;
}

function omitPending(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(omitPending);
  if (typeof value !== 'object' || value === null) return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== 'pending')
      .map(([key, child]) => [key, omitPending(child)])
  );
}

describe('Fluent 2 Button surface contexts', () => {
  it('publishes logical icon composition defaults', () => {
    expect(schema.components.button?.options).toEqual({
      groupDivider: true,
      disclosureDivider: false,
      iconLayout: 'inline',
      iconPlacement: 'leading',
      iconSurfaceCorners: 'edge',
      iconTreatment: 'plain'
    });
  });

  it('publishes a Rest-only divider matching the Button icon viewport', () => {
    const divider = requireButtonDividerElement();

    expect(divider.scales).toEqual({
      boxWidth: {
        's:sm:1': 1,
        's:md:1': 1,
        's:lg:1': 1
      },
      boxHeight: {
        's:sm:1': 20,
        's:md:1': { 'bp:all': 24, 'bp:lg:1': 20 },
        's:lg:1': 24
      }
    });

    for (const theme of THEMES) {
      for (const context of ['onSubtle', 'onVivid'] as const) {
        expect(divider.palettes.default?.[theme]?.[context]?.boxColor).toEqual({
          neutral: {
            medium: {
              rest: theme === 'light' ? '#dce0ed' : theme === 'dark' ? '#4b4e58' : '#2e313a'
            }
          }
        });
      }
    }
  });

  it('authors the inline Badge relation independently from icon spacing', () => {
    expect(requireButtonBadgeRelationElement().scales).toEqual({
      paddingLeft: {
        's:sm:1': 4,
        's:md:1': 6,
        's:lg:1': 6
      },
      paddingRight: {
        's:sm:1': 4,
        's:md:1': 6,
        's:lg:1': 6
      }
    });
  });

  it('preserves the three official sizes and uses large geometry for the responsive mobile default', () => {
    const e1 = requireButtonSurfaceElement();
    const e2 = requireButtonContentElement();
    const e3 = requireButtonIconElement();

    expect(e1.scales).toMatchObject({
      paddingTop: {
        's:sm:1': 4,
        's:md:1': { 'bp:all': 9, 'bp:lg:1': 6 },
        's:lg:1': 9
      },
      paddingBottom: {
        's:sm:1': 4,
        's:md:1': { 'bp:all': 9, 'bp:lg:1': 6 },
        's:lg:1': 9
      },
      paddingLeft: {
        's:sm:1': 8,
        's:md:1': { 'bp:all': 16, 'bp:lg:1': 12 },
        's:lg:1': 16
      },
      paddingRight: {
        's:sm:1': 8,
        's:md:1': { 'bp:all': 16, 'bp:lg:1': 12 },
        's:lg:1': 16
      }
    });
    expect(e2.typography).toEqual({
      's:sm:1': 'caption-medium',
      's:md:1': { 'bp:all': 'label-large', 'bp:lg:1': 'body-medium-strong' },
      's:lg:1': 'label-large'
    });
    expect(schema.global?.typography?.profiles).toMatchObject({
      'caption-medium': {
        decorations: { textFont: 'body', textWeight: 'normal' },
        scales: { textSize: 12, textHeight: 16 }
      },
      'body-medium-strong': {
        decorations: { textFont: 'body', textWeight: 'semiBold' },
        scales: { textSize: 14, textHeight: 20 }
      },
      'label-large': {
        decorations: { textFont: 'body', textWeight: 'semiBold' },
        scales: { textSize: 16, textHeight: 22 }
      }
    });
    expect(e3.iconSize).toEqual({
      's:sm:1': 's:md:1',
      's:md:1': { 'bp:all': 's:lg:1', 'bp:lg:1': 's:md:1' },
      's:lg:1': 's:lg:1'
    });
    expect(e3.scales).toMatchObject({
      paddingRight: {
        's:sm:1': 4,
        's:md:1': 6,
        's:lg:1': 6
      }
    });
  });

  it('preserves the approved default anchors', () => {
    const e1 = requireButtonSurfaceElement();
    const palettes = e1.palettes.default;

    expect(palettes?.light?.onSubtle.boxColor?.primary?.high?.rest).toBe('#0064b4');
    expect(palettes?.dark?.onSubtle.boxColor?.primary?.high?.rest).toBe('#0064b4');
    expect(palettes?.darker?.onSubtle.boxColor?.primary?.high?.rest).toBe('#005ba4');
  });

  it('keeps icon colors synchronized with Rest while leaving pending spinners undimmed', () => {
    const e2 = requireButtonContentElement();
    const e3 = requireButtonIconElement();

    expect(e3.palettes).toEqual(omitPending(e2.palettes));
  });

  it('publishes the complete onVivid matrix for every Fluent theme', () => {
    const e1 = requireButtonSurfaceElement();
    const e2 = requireButtonContentElement();

    for (const theme of THEMES) {
      const surface = e1.palettes.default?.[theme]?.onVivid;
      const content = e2.palettes.default?.[theme]?.onVivid;
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

  it('customizes Light onVivid surface hierarchy while preserving enabled recipes elsewhere', () => {
    const e1 = requireButtonSurfaceElement();
    const e2 = requireButtonContentElement();

    expect(e1.palettes.default?.dark?.onVivid).toEqual(e1.palettes.default?.darker?.onVivid);
    expect(e2.palettes.default?.dark?.onVivid).toEqual(e2.palettes.default?.darker?.onVivid);

    for (const intent of INTENTS) {
      for (const emphasis of ['high', 'lowest'] as const) {
        for (const state of ['rest', 'hover', 'pressed', 'selected'] as const) {
          expect(
            e1.palettes.default?.light?.onVivid?.boxColor?.[intent]?.[emphasis]?.[state]
          ).toEqual(e1.palettes.default?.dark?.onVivid?.boxColor?.[intent]?.[emphasis]?.[state]);
        }
        expect(e1.palettes.default?.light?.onVivid?.borderColor?.[intent]?.[emphasis]).toEqual(
          e1.palettes.default?.dark?.onVivid?.borderColor?.[intent]?.[emphasis]
        );
      }
      for (const emphasis of ['high', 'low', 'lowest'] as const) {
        expect(e2.palettes.default?.light?.onVivid?.textColor?.[intent]?.[emphasis]).toEqual(
          e2.palettes.default?.dark?.onVivid?.textColor?.[intent]?.[emphasis]
        );
      }
      expect(e1.palettes.default?.light?.onVivid?.boxColor?.[intent]?.low?.hover).toBe('#ffffff14');
      expect(e1.palettes.default?.dark?.onVivid?.boxColor?.[intent]?.low?.hover).toBe('#0000001a');
      expect(e1.palettes.default?.light?.onVivid?.borderColor?.[intent]?.low?.rest).toBe(
        '#ffffff4d'
      );
      expect(e1.palettes.default?.dark?.onVivid?.borderColor?.[intent]?.low?.rest).toBe('#ffffff');
    }
  });

  it('adapts the official Primary inverted state rhythm without duplicate focus colors', () => {
    const e1 = requireButtonSurfaceElement();
    const e2 = requireButtonContentElement();
    const surface = e1.palettes.default?.light?.onVivid;
    const content = e2.palettes.default?.light?.onVivid;

    expect(surface?.boxColor?.primary?.high).toEqual({
      rest: '#ffffff',
      hover: '#e1efff',
      pressed: '#a4cfff',
      pending: '#ffffff99',
      disabled: '#ffffff0a',
      selected: { rest: '#a4cfff' }
    });
    expect(content?.textColor?.primary?.high).toEqual({
      rest: 'fg:blue.standard.light.onSubtle.medium',
      pending: { parentState: 'fg:blue.standard.light.onSubtle.medium.pending' },
      hover: { parentState: 'fg:blue.standard.light.onSubtle.medium.hover' },
      pressed: { parentState: 'fg:blue.standard.light.onSubtle.medium.pressed' },
      disabled: { parentState: 'fg:neutral.deep.light.onVivid.medium.disabled' },
      selected: {
        rest: { parentState: 'fg:blue.standard.light.onSubtle.medium.pressed' }
      }
    });
    expect(surface?.boxColor?.primary?.high).not.toHaveProperty('focus');
    expect(content?.textColor?.primary?.high).not.toHaveProperty('focus');
  });

  it('keeps onVivid lower emphases role-aware with a theme-adjusted white Low border', () => {
    const e1 = requireButtonSurfaceElement();
    const e2 = requireButtonContentElement();
    const surface = e1.palettes.default?.light?.onVivid;
    const content = e2.palettes.default?.light?.onVivid;

    expect(surface?.boxColor?.primary?.medium).toMatchObject({
      rest: '#ffffff24',
      hover: '#ffffff1a',
      pressed: '#ffffff12',
      disabled: '#ffffff0a',
      selected: { rest: '#ffffff12' }
    });
    expect(surface?.boxColor?.primary?.low).toMatchObject({
      rest: '#ffffff00',
      hover: '#ffffff14',
      pressed: '#ffffff08',
      disabled: '#ffffff0a',
      selected: { rest: '#ffffff08' }
    });
    expect(surface?.boxColor?.primary?.lowest).not.toHaveProperty('disabled');
    expect(surface?.borderColor?.primary?.low).toEqual({
      rest: '#ffffff4d',
      pending: '#ffffff2e',
      pressed: '#ffffff12',
      selected: { rest: '#ffffff12' },
      disabled: '#ffffff12'
    });
    expect(content?.textColor?.primary?.medium?.rest).toBe('fg:blue.deep.light.onVivid.medium');
    expect(content?.textColor?.primary?.low?.rest).toBe('fg:blue.deep.light.onVivid.medium');
    expect(content?.textColor?.primary?.lowest?.rest).toBe('fg:blue.deep.light.onVivid.medium');
  });

  it('preserves each intent family across every onVivid emphasis', () => {
    const e1 = requireButtonSurfaceElement();
    const e2 = requireButtonContentElement();
    const surface = e1.palettes.default?.light?.onVivid;
    const content = e2.palettes.default?.light?.onVivid;

    expect({
      primary: surface?.boxColor?.primary?.medium?.rest,
      neutral: surface?.boxColor?.neutral?.medium?.rest,
      destructive: surface?.boxColor?.destructive?.medium?.rest,
      positive: surface?.boxColor?.positive?.medium?.rest
    }).toEqual({
      primary: '#ffffff24',
      neutral: '#ffffff24',
      destructive: '#ffffff24',
      positive: '#ffffff24'
    });

    expect({
      primary: content?.textColor?.primary?.low?.rest,
      neutral: content?.textColor?.neutral?.low?.rest,
      destructive: content?.textColor?.destructive?.low?.rest,
      positive: content?.textColor?.positive?.low?.rest
    }).toEqual({
      primary: 'fg:blue.deep.light.onVivid.medium',
      neutral: 'fg:neutral.deep.light.onVivid.medium',
      destructive: 'fg:red.deep.light.onVivid.medium',
      positive: 'fg:green.deep.light.onVivid.medium'
    });

    for (const intent of INTENTS) {
      for (const emphasis of ['high', 'medium', 'low'] as const) {
        expect(surface?.boxColor?.[intent]?.[emphasis]?.disabled).toBe('#ffffff0a');
        expect(e1.palettes.default?.dark?.onVivid?.boxColor?.[intent]?.[emphasis]?.disabled).toBe(
          '#ffffff1a'
        );
      }
      expect(surface?.borderColor?.[intent]?.low?.rest).toBe('#ffffff4d');
      expect(content?.textColor?.[intent]?.medium?.rest).toBe(
        content?.textColor?.[intent]?.low?.rest
      );
      expect(content?.textColor?.[intent]?.lowest?.rest).toBe(
        content?.textColor?.[intent]?.low?.rest
      );
    }
  });

  it('authors canonical Button textColor exclusively through global foreground references', () => {
    const e2 = requireButtonContentElement();
    const e3 = requireButtonIconElement();
    const e4 = schema.components.button?.elements.e4;

    const assertForegroundOnly = (value: unknown, path: string): void => {
      if (typeof value === 'string') {
        expect(value, path).toMatch(/^fg:/);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((child, index) => {
          assertForegroundOnly(child, `${path}.${index}`);
        });
        return;
      }
      if (typeof value !== 'object' || value === null) return;
      if ('parentState' in value) {
        expect(value, path).toEqual({ parentState: expect.stringMatching(/^fg:/) });
        return;
      }
      for (const [key, child] of Object.entries(value)) {
        assertForegroundOnly(child, `${path}.${key}`);
      }
    };

    assertForegroundOnly(e2.palettes, 'button.e2.palettes');
    assertForegroundOnly(e3.palettes, 'button.e3.palettes');
    for (const [theme, contexts] of Object.entries(e4?.palettes?.default ?? {})) {
      for (const [context, palette] of Object.entries(contexts ?? {})) {
        assertForegroundOnly(
          palette?.textColor,
          `button.e4.palettes.default.${theme}.${context}.textColor`
        );
      }
    }
  });
});
