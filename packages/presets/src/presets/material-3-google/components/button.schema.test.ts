import { validateButtonComponentContract } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema } from '../material-3-google.schema.ts';

describe('Material 3 Button divider scope', () => {
  it('keeps connected-divider authoring absent until the preset is reviewed', () => {
    const button = schema.components.button;
    const options = button?.options ?? {};

    expect(options).not.toHaveProperty('groupDivider');
    expect(options).not.toHaveProperty('disclosureDivider');
    expect(button?.elements.e6).toBeUndefined();
    expect(button?.elements.e5?.scales).not.toHaveProperty('borderWidth');
    expect(validateButtonComponentContract(button)).toEqual([]);
  });
});
