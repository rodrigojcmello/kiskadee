import { describe, expect, it } from 'vitest';
import { validateButtonComponentContract } from './button.ts';
import {
  createSliderFieldLabelElementStyleSchema,
  createSliderOptionalIndicatorElementStyleSchema,
  createSliderValueIndicatorElementStyleSchema
} from './slider.elements.zod.ts';
import {
  createSwitchLabelElementStyleSchema,
  createSwitchStateElementStyleSchema
} from './switch.elements.zod.ts';
import { createTabsLabelElementStyleSchema } from './tabs.elements.zod.ts';
import {
  createTextFieldInlineLabelElementStyleSchema,
  createTextFieldInputElementStyleSchema,
  createTextFieldLabelElementStyleSchema,
  createTextFieldMessageElementStyleSchema
} from './text-field.elements.zod.ts';

const typography = {
  's:all': 'body-medium'
};

describe('textual component element contracts', () => {
  it('accepts typography references in every textual element shape', () => {
    const elementSchemas = [
      createSwitchLabelElementStyleSchema(),
      createSwitchStateElementStyleSchema(),
      createSliderFieldLabelElementStyleSchema(),
      createSliderOptionalIndicatorElementStyleSchema(),
      createSliderValueIndicatorElementStyleSchema(),
      createTabsLabelElementStyleSchema(),
      createTextFieldLabelElementStyleSchema(),
      createTextFieldInlineLabelElementStyleSchema(),
      createTextFieldInputElementStyleSchema(),
      createTextFieldMessageElementStyleSchema()
    ];

    for (const schema of elementSchemas) {
      expect(schema.safeParse({ name: 'text', typography }).success).toBe(true);
    }

    expect(
      validateButtonComponentContract({
        elements: {
          e2: {
            name: 'label',
            typography
          }
        }
      })
    ).toEqual([]);
  });

  it('rejects legacy inline font and metric authorship in textual slots', () => {
    const legacyText = {
      name: 'text',
      decorations: {
        textFont: 'body',
        textWeight: 'normal'
      },
      scales: {
        textSize: 16,
        textHeight: 20
      }
    };

    expect(createSwitchLabelElementStyleSchema().safeParse(legacyText).success).toBe(false);
    expect(createSliderFieldLabelElementStyleSchema().safeParse(legacyText).success).toBe(false);
    expect(createTabsLabelElementStyleSchema().safeParse(legacyText).success).toBe(false);
    expect(createTextFieldInputElementStyleSchema().safeParse(legacyText).success).toBe(false);
    expect(
      validateButtonComponentContract({
        elements: {
          e2: legacyText
        }
      })
    ).not.toEqual([]);
  });
});
