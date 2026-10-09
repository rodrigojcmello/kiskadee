import { validateAccordionComponentContract, validateSchemaPresenceContract } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { createFluent2MicrosoftAccordionSchema } from './fluent-2-microsoft/components/accordion.schema.ts';
import { schema as fluent } from './fluent-2-microsoft/fluent-2-microsoft.schema.ts';

describe('Accordion contract', () => {
  it('advertises exactly the neutral Card coverage backed by Container surfaces', () => {
    const emphases = fluent.components.accordion!.options.emphases;
    expect(fluent.components.card!.surfaceSource).toBe('container');
    for (const context of ['onSubtle', 'onVivid'] as const) {
      const card =
        fluent.components.card!.elements.e1!.palettes!.default!.light![context]!.boxColor!.neutral!;
      const container =
        fluent.components.container!.elements.e1.palettes.default!.light![context]!.boxColor
          .neutral!;
      expect([...emphases].sort()).toEqual(Object.keys(card).sort());
      for (const emphasis of emphases)
        expect(container[emphasis]?.rest).toEqual(expect.any(String));
    }
  });
  it('accepts the narrow composition schema', () =>
    expect(validateAccordionComponentContract(createFluent2MicrosoftAccordionSchema())).toEqual(
      []
    ));
  it('validates every indicator mode and rejects missing or unknown defaults', () => {
    const schema = createFluent2MicrosoftAccordionSchema();
    for (const indicatorTransition of ['rotate', 'crossfade', 'none'] as const) {
      schema.options.indicatorTransition = indicatorTransition;
      expect(validateAccordionComponentContract(schema)).toEqual([]);
    }
    Object.assign(schema.options, { indicatorTransition: 'spin' });
    expect(validateAccordionComponentContract(schema).length).toBeGreaterThan(0);
    Reflect.deleteProperty(schema.options, 'indicatorTransition');
    expect(validateAccordionComponentContract(schema).length).toBeGreaterThan(0);
  });
  it('requires one boolean divider default and rejects invalid emphasis coverage', () => {
    const schema = createFluent2MicrosoftAccordionSchema();
    Object.assign(schema.options, { divider: { low: true } });
    expect(validateAccordionComponentContract(schema).length).toBeGreaterThan(0);
    Object.assign(schema.options, { divider: false, emphases: ['medium', 'medium'] });
    expect(validateAccordionComponentContract(schema).length).toBeGreaterThan(0);
    Object.assign(schema.options, { emphases: ['lowest', 'medium'] });
    expect(validateAccordionComponentContract(schema)).toEqual([]);
  });
  it('rejects surface and root-spacing re-authorship', () => {
    const schema = createFluent2MicrosoftAccordionSchema();
    Object.assign(schema.elements.e1, { scales: { paddingLeft: 16 } });
    Object.assign(schema.elements.e2, { palettes: {} });
    expect(validateAccordionComponentContract(schema)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('e1.scales'),
        expect.stringContaining('e2.palettes')
      ])
    );
  });
  it('requires its own declared global height profile', () => {
    expect(() =>
      validateSchemaPresenceContract({
        components: { accordion: { effects: { presence: { profile: 'grow-height' } } } }
      })
    ).toThrow('requires global grow-height');
    expect(() =>
      validateSchemaPresenceContract({
        components: { accordion: { effects: { presence: { profile: 'fade-translate' } } } }
      })
    ).toThrow('expected grow-height');
    expect(() =>
      validateSchemaPresenceContract({
        global: {
          effects: {
            presence: {
              profiles: {
                'grow-height': {
                  enterDurationMs: 180,
                  exitDurationMs: 120,
                  enterEasing: 'ease-out',
                  exitEasing: 'ease-in'
                }
              }
            }
          }
        },
        components: { accordion: { effects: { presence: { profile: 'grow-height' } } } }
      })
    ).not.toThrow();
  });
});
