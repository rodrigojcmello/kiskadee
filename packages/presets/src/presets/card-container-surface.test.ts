import {
  validateContainerComponentContract,
  validateSchemaComponentContracts
} from '@kiskadee/core';
import { expect, it } from 'vitest';
import { schema as carbon } from './carbon-ibm/carbon-ibm.schema.ts';
import { schema as elegant } from './elegant/elegant.schema.ts';
import { schema as fluent } from './fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { schema as ios } from './ios-27-apple/ios-27-apple.schema.ts';
import { schema as material } from './material-3-google/material-3-google.schema.ts';
import { schema as sandbox } from './sandbox/sandbox.schema.ts';
import { schema as sandbox2 } from './sandbox-2/sandbox-2.schema.ts';
import { schema as sandbox3 } from './sandbox-3/sandbox-3.schema.ts';

type StateMap = Record<string, unknown>;
type BoxColor = Record<string, Record<string, StateMap>>;
type Palette = { boxColor?: BoxColor; borderColor?: BoxColor };
type Palettes = Record<string, Record<string, Record<string, Palette>>>;
type Contexts = Record<
  string,
  Record<string, Record<string, Record<string, Record<string, StateMap>>>>
>;

for (const [name, schema] of Object.entries({
  carbon,
  elegant,
  fluent,
  ios,
  material,
  sandbox,
  sandbox2,
  sandbox3
})) {
  it(`${name} sources every authored Card Rest surface and output from Container`, () => {
    const card = schema.components.card!;
    const container = schema.components.container!;
    expect(card.surfaceSource).toBe('container');
    if (card.options) expect(card.options).not.toHaveProperty('canonicalSurfaces');
    expect(validateContainerComponentContract(container)).toEqual([]);
    expect(() => validateSchemaComponentContracts(schema)).not.toThrow();

    const cardPalettes = card.elements.e1?.palettes as unknown as Palettes;
    const containerPalettes = container.elements.e1.palettes as unknown as Palettes;
    const containerContexts = container.contentSurfaceContext as unknown as Contexts;
    for (const [segment, themes] of Object.entries(cardPalettes))
      for (const [theme, contexts] of Object.entries(themes))
        for (const [context, palette] of Object.entries(contexts))
          for (const [intent, emphases] of Object.entries(palette.boxColor ?? {}))
            for (const [emphasis, states] of Object.entries(emphases)) {
              expect(states).not.toHaveProperty('rest');
              expect(
                containerPalettes[segment]?.[theme]?.[context]?.boxColor?.[intent]?.[emphasis]?.rest
              ).toEqual(expect.any(String));
              expect(
                containerContexts[segment]?.[theme]?.[context]?.[intent]?.[emphasis]?.rest
              ).toEqual(expect.any(String));
            }
  });
}

it('keeps Card-only descendant context changes for selected and disabled states', () => {
  expect(
    ios.components.card?.contentSurfaceContext?.default?.light?.onSubtle?.neutral?.lowest?.selected
  ).toBe('onVivid');
  expect(
    ios.components.container?.contentSurfaceContext?.default?.light?.onSubtle?.neutral?.lowest?.rest
  ).toBe('onSubtle');
  expect(
    carbon.components.card?.contentSurfaceContext?.default?.light?.onSubtle?.primary?.highest
      ?.disabled
  ).toBe('onSubtle');
  expect(
    carbon.components.container?.contentSurfaceContext?.default?.light?.onSubtle?.primary?.highest
      ?.rest
  ).toBe('onVivid');
});
