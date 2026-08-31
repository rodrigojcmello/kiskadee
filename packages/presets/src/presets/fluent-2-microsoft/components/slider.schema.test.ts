import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

function requireSliderElements() {
  const elements = schema.components.slider?.variants?.standard?.modes?.base?.elements;
  if (!elements) throw new Error('Fluent Slider base elements are missing');
  return elements;
}

describe('Fluent 2 Slider color provenance', () => {
  it('freezes the approved Fluent-to-tonal adaptations', () => {
    const elements = requireSliderElements();
    const text = elements.e2?.palettes?.default?.light?.onSubtle.textColor;
    const track = elements.e8?.palettes?.default?.light?.onSubtle.boxColor;
    const active = elements.e9?.palettes?.default?.light?.onSubtle.boxColor;
    const thumb = elements.e10?.palettes?.default?.light?.onSubtle;

    expect(text?.neutral?.medium).toMatchObject({
      rest: '#21242d',
      disabled: { ref: '#b6bac6' }
    });
    expect(track?.neutral?.medium).toMatchObject({
      rest: '#5d616b',
      disabled: { ref: '#ffffff00' }
    });
    expect(active?.primary?.medium).toEqual({
      rest: '#0064b4',
      hover: { ref: '#0059a1' },
      focus: { ref: '#0064b4' },
      pressed: { ref: '#045091' },
      disabled: { ref: '#b6bac6' }
    });
    expect(thumb?.borderColor?.neutral?.medium).toMatchObject({
      rest: '#cdd1de',
      disabled: { ref: '#dce0ed' }
    });
  });

  it('keeps optional indicator opacity on physical dark caps', () => {
    const optional = requireSliderElements().e20?.palettes?.default?.light?.onSubtle.textColor;

    expect(optional?.neutral?.medium).toEqual({
      rest: '#0000004d',
      hover: { ref: '#0000004d' },
      focus: { ref: '#0000004d' },
      pressed: { ref: '#0000004d' },
      disabled: { ref: '#0000002e' }
    });
  });
});
