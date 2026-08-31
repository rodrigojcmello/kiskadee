import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

function requireSwitchElements() {
  const elements = schema.components.switch?.variants?.standard?.modes?.base?.elements;
  if (!elements) throw new Error('Fluent Switch base elements are missing');
  return elements;
}

describe('Fluent 2 Switch color provenance', () => {
  it('freezes functional Brand and polarity anchors', () => {
    const elements = requireSwitchElements();
    const track = elements.e2?.palettes?.default?.light?.onSubtle;
    const thumb = elements.e3?.palettes?.default?.light?.onSubtle;

    expect(track?.boxColor?.neutral?.medium?.selected).toEqual({
      rest: { ref: '#045091' },
      hover: { ref: '#123f6b' },
      focus: { ref: '#045091' },
      pressed: { ref: '#142e49' }
    });
    expect(track?.boxColor?.polarity?.medium?.selected?.rest).toEqual({ ref: '#107c10' });
    expect(thumb?.boxColor?.polarity?.medium?.rest).toBe('#c50f1f');
  });

  it('freezes the evidenced neutral stops and physical on-primary caps', () => {
    const elements = requireSwitchElements();
    const track = elements.e2?.palettes?.default?.light?.onSubtle;
    const thumb = elements.e3?.palettes?.default?.light?.onSubtle;
    const label = elements.e4?.palettes?.default?.light?.onSubtle;

    expect(track?.borderColor?.neutral?.medium).toMatchObject({
      rest: '#616161',
      hover: { ref: '#585858' },
      disabled: { ref: '#d1d1d1' }
    });
    expect(thumb?.boxColor?.neutral?.medium).toMatchObject({
      rest: '#616161',
      hover: { ref: '#464646' },
      disabled: { ref: '#8f939e' }
    });
    expect(label?.textColor?.neutral).toMatchObject({
      medium: { rest: '#21242d', disabled: { ref: '#8f939e' } },
      low: { rest: '#ffffff', disabled: { ref: '#ffffff61' } }
    });
    expect(track?.boxColor?.neutral?.low).toMatchObject({
      rest: '#ffffff47',
      hover: { ref: '#ffffff5c' },
      pressed: { ref: '#ffffff70' },
      disabled: { ref: '#ffffff1f' }
    });
  });
});
