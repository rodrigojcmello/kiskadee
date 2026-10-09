import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

describe('Fluent Light neutral CardAction feedback', () => {
  it('keeps hover and pressed visibly distinct but close to each Rest surface', () => {
    const channel = (hex: string) => Number.parseInt(hex.slice(1, 3), 16);
    for (const context of ['onSubtle', 'onVivid'] as const) {
      const states =
        schema.components.card!.elements.e1!.palettes!.default!.light![context]!.boxColor!.neutral!;
      const surfaces =
        schema.components.container!.elements.e1.palettes.default!.light![context]!.boxColor
          .neutral!;
      for (const emphasis of ['lowest', 'low', 'medium', 'high'] as const) {
        const rest = channel(surfaces[emphasis]!.rest as string);
        const hover = channel(states[emphasis]!.hover as string);
        const pressed = channel(states[emphasis]!.pressed as string);
        expect(rest).toBeGreaterThan(hover);
        expect(hover).toBeGreaterThan(pressed);
        // At most ten RGB levels from Rest avoids the previous large pressed jump.
        expect(rest - pressed).toBeLessThanOrEqual(10);
      }
    }
  });
});
