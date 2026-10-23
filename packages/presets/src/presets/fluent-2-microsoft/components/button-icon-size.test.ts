import { describe, expect, it } from 'vitest';
import { schema } from '../fluent-2-microsoft.schema.ts';

describe('Fluent Small icon adaptation', () => {
  it('fits its nominal 24 px height without changing the vertical inset recipe', () => {
    const elements = schema.components.button!.elements;
    const catalog = schema.global!.iconSizes!;
    const iconSize = elements.e3!.iconSize as Record<string, keyof typeof catalog>;
    const iconHeight = catalog[iconSize['s:sm:1']!]!;
    const root = elements.e1!.scales!;
    const insets = root.paddingTop as Record<string, number>;
    const reference = root._boxHeight as Record<string, number>;
    // Authored padding includes the border compensation applied by the Builder.
    expect(iconHeight).toBe(16);
    expect(iconHeight + 2 * insets['s:sm:1']!).toBe(reference['s:sm:1']);
  });
});
