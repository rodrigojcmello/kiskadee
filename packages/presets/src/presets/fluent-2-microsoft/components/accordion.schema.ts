import type { AccordionComponent } from '@kiskadee/core';

/** Kiskadee composition of Fluent surfaces with Windows-style medium emphasis. */
export function createFluent2MicrosoftAccordionSchema(): AccordionComponent {
  return {
    options: {
      themes: ['light'],
      emphases: ['lowest', 'low', 'medium', 'high'],
      divider: true,
      indicatorTransition: 'rotate'
    },
    effects: { presence: { profile: 'grow-height' } },
    elements: {
      e1: { name: 'root' },
      e2: { name: 'item' },
      e3: {
        name: 'trigger',
        scales: {
          paddingTop: { 's:md:1': 16 },
          paddingRight: { 's:md:1': 16 },
          paddingBottom: { 's:md:1': 16 },
          paddingLeft: { 's:md:1': 16 }
        }
      },
      e4: { name: 'label', typography: { 's:all': 'body-medium' } },
      e5: {
        name: 'indicator',
        scales: { boxWidth: { 's:md:1': 20 }, boxHeight: { 's:md:1': 20 } }
      },
      e6: { name: 'panel' }
    }
  };
}
