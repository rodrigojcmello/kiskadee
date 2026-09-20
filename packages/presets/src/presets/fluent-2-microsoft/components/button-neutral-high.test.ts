import { expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

it('lightens only Neutral High Light/onSubtle interaction states in both segments', () => {
  for (const segment of ['default', 'teams'] as const) {
    const palettes = schema.components.button!.elements.e1!.palettes![segment]!;
    const high = palettes.light!.onSubtle!.boxColor!.neutral!.high!;
    const channel = (value: unknown) => {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
      return Number.parseInt(String(value).slice(1, 3), 16);
    };
    expect(channel(high.hover)).toBeGreaterThan(channel(high.rest));
    expect(channel(high.pressed)).toBeGreaterThan(channel(high.hover));
    expect(high.selected!.rest).toBe(high.pressed);
    expect(high.focus).toBeUndefined();
    for (const theme of ['dark', 'darker'] as const) {
      const state = palettes[theme]!.onSubtle!.boxColor!.neutral!.high!;
      expect(state.selected!.rest).toBe(state.pressed);
    }
  }
});
