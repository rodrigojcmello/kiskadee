import { normalizeHexColor, type SolidColor, withAlpha } from '@kiskadee/core';
import type { PresetColorGetter } from '../../../utils/presetColor.ts';

export const MATERIAL_BUTTON_INTENTS = ['primary', 'neutral', 'destructive', 'positive'] as const;
export const MATERIAL_BUTTON_EMPHASES = ['high', 'medium', 'low', 'lowest'] as const;
type Intent = (typeof MATERIAL_BUTTON_INTENTS)[number];
type Emphasis = (typeof MATERIAL_BUTTON_EMPHASES)[number];
type ColorStates = {
  rest: SolidColor;
  hover?: SolidColor;
  focus?: SolidColor;
  pressed?: SolidColor;
  pending?: SolidColor;
  disabled?: SolidColor;
  selected?: { rest: SolidColor; hover?: SolidColor; focus?: SolidColor; pressed?: SolidColor };
};
type TextStates = {
  rest: SolidColor;
  pending?: { ref: SolidColor };
  disabled: { ref: SolidColor };
  selected?: { rest: { ref: SolidColor } };
};

// Resolve the Material state layer at build time; generated CSS needs no extra overlay element.
function stateLayer(base: SolidColor, foreground: SolidColor, percent: number): SolidColor {
  const background = normalizeHexColor(base);
  const overlay = normalizeHexColor(foreground);
  if (background.length !== 7 || overlay.length !== 7) {
    throw new Error('Material filled state layers require opaque tonal colors');
  }
  return (
    '#' +
    [1, 3, 5]
      .map((index) =>
        Math.round(
          Number.parseInt(background.slice(index, index + 2), 16) * (1 - percent / 100) +
            (Number.parseInt(overlay.slice(index, index + 2), 16) * percent) / 100
        )
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

// Figma: Hover 8%, Focus 10%. Pressed 12% is a static Kiskadee adaptation;
// the existing ripple remains the spatial activation feedback.
const STATE_LAYER = { hover: 8, focus: 10, pressed: 12 } as const;

export function createMaterialButtonIntent({
  c,
  segment,
  theme,
  surface,
  intent
}: {
  c: PresetColorGetter<'default' | 'dynamic' | 'purple'>;
  segment: 'default' | 'dynamic' | 'purple';
  theme: 'light' | 'dark';
  surface: 'onSubtle' | 'onVivid';
  intent: Intent;
}) {
  const role = `button.${intent}` as const;
  const scale = theme === 'light' ? 'l' : 'd';
  const inverse = surface === 'onVivid';
  const white = c(segment, 'l', 'primitive.black.v1', 0);
  const black = c(segment, 'l', 'primitive.black.v1', 100);
  const transparent = withAlpha(black, 0);
  const onSurface = inverse || theme === 'dark' ? white : black;
  const disabledBox = withAlpha(onSurface, 10);
  const disabledText = withAlpha(onSurface, 38);
  const foreground = c(segment, scale, role, theme === 'light' ? 65 : 85);
  const high = inverse
    ? white
    : theme === 'light'
      ? c.ref(segment, 'l', role, 'vivid')
      : c.ref(segment, 'd', role, 'vivid', intent === 'neutral' ? 0 : 6);
  const highText = inverse ? c(segment, 'l', role, 65) : theme === 'light' ? white : black;
  const medium = inverse
    ? withAlpha(c.ref(segment, 'l', role, 'subtle'), 14)
    : c.ref(segment, scale, role, 'subtle');
  const mediumText = inverse ? white : foreground;
  const layers = (base: SolidColor, ink: SolidColor) => ({
    rest: base,
    hover: stateLayer(base, ink, STATE_LAYER.hover),
    focus: stateLayer(base, ink, STATE_LAYER.focus),
    pressed: stateLayer(base, ink, STATE_LAYER.pressed)
  });
  const filled = layers(high, highText);
  const soft = inverse
    ? {
        rest: medium,
        hover: withAlpha(c.ref(segment, 'l', role, 'subtle'), 10),
        focus: withAlpha(c.ref(segment, 'l', role, 'subtle'), 12),
        pressed: withAlpha(c.ref(segment, 'l', role, 'subtle'), 7)
      }
    : layers(medium, mediumText);
  const unfilled = {
    rest: transparent,
    hover: withAlpha(mediumText, STATE_LAYER.hover),
    focus: withAlpha(mediumText, STATE_LAYER.focus),
    pressed: withAlpha(mediumText, STATE_LAYER.pressed)
  };
  const boxColor: Record<Emphasis, ColorStates> = {
    high: {
      ...filled,
      pending: withAlpha(high, 60),
      disabled: disabledBox,
      selected: { ...filled, rest: stateLayer(high, highText, 4) }
    },
    medium: {
      ...soft,
      pending: withAlpha(medium, inverse ? 11 : 60),
      disabled: disabledBox,
      selected: filled
    },
    low: { ...unfilled, disabled: disabledBox, selected: filled },
    lowest: { ...unfilled, disabled: disabledBox, selected: filled }
  };
  const borderColor: Record<Emphasis, ColorStates> = {
    high: { rest: transparent },
    medium: { rest: transparent },
    low: {
      rest: withAlpha(mediumText, inverse ? 40 : 35),
      pending: withAlpha(mediumText, 20),
      disabled: withAlpha(onSurface, 12),
      selected: { rest: transparent }
    },
    lowest: { rest: transparent }
  };
  const text = (rest: SolidColor): TextStates => ({
    rest,
    pending: { ref: withAlpha(rest, 70) },
    disabled: { ref: disabledText },
    // A parent-selected reference overrides the unselected text without self-state selectors.
    ...(rest !== highText ? { selected: { rest: { ref: highText } } } : {})
  });
  const textColor: Record<Emphasis, TextStates> = {
    high: text(highText),
    medium: text(mediumText),
    low: text(mediumText),
    lowest: text(mediumText)
  };
  return { boxColor, borderColor, textColor };
}
