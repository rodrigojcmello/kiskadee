import { describe, expect, it } from 'vitest';
import { exactColor, referenceColor } from './fluent-2-microsoft.color.ts';

describe('Fluent strict color helper types', () => {
  it('keeps gradient roles outside the solid locator API', () => {
    referenceColor('primary', 'vivid');
    exactColor('button.primary', 50, 'component.button');

    const compileTimeOnly = () => {
      // @ts-expect-error Gradient roles cannot enter the strict Fluent solid-color resolver.
      referenceColor('primitive.blue.gradient', 'vivid');

      // @ts-expect-error Exact locators also reject gradient roles at authoring time.
      exactColor('button.primary.gradient', 50, 'component.button');

      // @ts-expect-error Exact locators require a registered Fluent evidence ID.
      exactColor('button.primary', 50, 'component.unknown');
    };

    expect(compileTimeOnly).toBeTypeOf('function');
  });
});
