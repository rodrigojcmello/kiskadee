import { describe, expect, it } from 'vitest';
import { schemaInteractionContractSchema } from './control-cursor.contract.zod.ts';
import { DEFAULT_CONTROL_CURSOR, resolveControlCursor } from './controlCursor.ts';

describe('control cursor platform policy', () => {
  it('defaults to pointer on Web and the platform cursor on native targets', () => {
    expect(resolveControlCursor()).toBe('pointer');
    expect(resolveControlCursor(undefined, 'native')).toBe('default');
    expect(DEFAULT_CONTROL_CURSOR).toEqual({ value: 'pointer', scope: 'web' });
  });
  it('supports an explicit cross-platform pointer preference and an arrow override', () => {
    expect(resolveControlCursor({ value: 'pointer', scope: 'all' }, 'native')).toBe('pointer');
    expect(resolveControlCursor({ value: 'default', scope: 'web' })).toBe('default');
  });
  it('allows omission but rejects partial or unknown cursor policies', () => {
    expect(schemaInteractionContractSchema.safeParse({}).success).toBe(true);
    for (const controlCursor of [
      { value: 'pointer' },
      { scope: 'web' },
      { value: 'grab', scope: 'all' },
      { value: 'pointer', scope: 'desktop' }
    ]) {
      expect(schemaInteractionContractSchema.safeParse({ controlCursor }).success).toBe(false);
    }
  });
});
