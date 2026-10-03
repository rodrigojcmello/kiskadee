import { validateLayoutComponentContract } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { createLayoutSchema } from '../utils/createLayoutSchema.ts';
import { schema as carbon } from './carbon-ibm/carbon-ibm.schema.ts';
import { schema as elegant } from './elegant/elegant.schema.ts';
import { schema as fluent } from './fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { schema as ios } from './ios-27-apple/ios-27-apple.schema.ts';
import { schema as material } from './material-3-google/material-3-google.schema.ts';
import { schema as sandbox } from './sandbox/sandbox.schema.ts';
import { schema as sandbox2 } from './sandbox-2/sandbox-2.schema.ts';
import { schema as sandbox3 } from './sandbox-3/sandbox-3.schema.ts';

const expectedSpacing = {
  's:sm:5': 2,
  's:sm:4': 4,
  's:sm:3': 6,
  's:sm:2': 8,
  's:sm:1': 12,
  's:md:1': 16,
  's:lg:1': 24,
  's:lg:2': 32,
  's:lg:3': 40,
  's:lg:4': 48,
  's:lg:5': 64
};

describe('Shared Kiskadee Layout calibration', () => {
  it.each(
    Object.entries({ carbon, elegant, fluent, ios, material, sandbox, sandbox2, sandbox3 })
  )('%s publishes the complete common frame and flow spacing contract', (_name, schema) => {
    const layout = schema.components.layout;
    expect(validateLayoutComponentContract(layout)).toEqual([]);
    for (const element of Object.values(layout!.elements)) {
      for (const scale of Object.values(element.scales)) expect(scale).toEqual(expectedSpacing);
    }
    expect(layout).toEqual(createLayoutSchema());
  });

  it('keeps property, slot and preset authoring independent when a returned scale is changed', () => {
    const first = createLayoutSchema();
    const second = createLayoutSchema();
    first.elements.e1.scales.paddingTop['s:md:1'] = 20;
    expect(first.elements.e1.scales.marginTop['s:md:1']).toBe(16);
    expect(first.elements.e2.scales.paddingTop['s:md:1']).toBe(16);
    expect(second.elements.e1.scales.paddingTop['s:md:1']).toBe(16);
  });
});
