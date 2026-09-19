import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

describe('Fluent Low directional border', () => {
  it('publishes a stronger bottom only for Low and removes its accent when disabled', () => {
    for (const segment of ['default', 'teams'] as const)
      for (const theme of ['light', 'dark', 'darker'] as const)
        for (const context of ['onSubtle', 'onVivid'] as const) {
          const palette =
            schema.components.button!.elements.e1!.palettes![segment]![theme]![context]!;
          for (const intent of ['primary', 'neutral', 'destructive', 'positive'] as const) {
            const base = palette.borderColor![intent]!.low!;
            const bottom = palette.borderBottomColor![intent]!.low!;
            expect(bottom.rest).not.toBe(base.rest);
            expect(bottom.disabled).toBe(base.disabled);
            expect(bottom.pending).not.toBe(bottom.rest);
            for (const emphasis of ['lowest', 'medium', 'high'] as const)
              expect(palette.borderBottomColor![intent]![emphasis]).toBeUndefined();
          }
        }
  });
});
