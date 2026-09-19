import { describe, expect, it } from 'vitest';
import { createStrictPresetColorResolver } from '../../utils/presetColor.ts';
import { referenceColor } from './fluent-2-microsoft.color.ts';
import { fluent2MicrosoftColorEvidence } from './fluent-2-microsoft.color-evidence.ts';
import { schemaColors } from './fluent-2-microsoft.colors.ts';
import { createFluent2MicrosoftSchema, schema } from './fluent-2-microsoft.schema.ts';

const c = createStrictPresetColorResolver<
  'default' | 'teams',
  typeof fluent2MicrosoftColorEvidence
>({
  colors: schemaColors,
  exactEvidence: fluent2MicrosoftColorEvidence
});

describe('Fluent Teams shared palette', () => {
  it('remaps identity while preserving semantic families', () => {
    for (const theme of ['l', 'd'] as const) {
      for (const role of ['primary'] as const) {
        expect(c.resolve('teams', theme, referenceColor(role, 'vivid'))).not.toBe(
          c.resolve('default', theme, referenceColor(role, 'vivid'))
        );
      }
      for (const role of ['neutral', 'redLike', 'greenLike', 'purpleLike', 'yellowLike'] as const) {
        expect(c.resolve('teams', theme, referenceColor(role, 'vivid'))).toBe(
          c.resolve('default', theme, referenceColor(role, 'vivid'))
        );
      }
    }
  });

  it('publishes every existing segment map using the same recipes with Teams resolution', () => {
    const teams = createFluent2MicrosoftSchema({
      resolve: (_segment, theme, locator) => c.resolve('teams', theme, locator)
    });
    let checked = 0;
    function visit(actual: unknown, template: unknown) {
      if (!template || typeof template !== 'object' || Array.isArray(template)) return;
      const a = actual as Record<string, unknown>;
      for (const [key, value] of Object.entries(template)) {
        if (key === 'colors') continue;
        if (
          (key === 'palettes' ||
            key === 'contentSurfaceContext' ||
            key === 'canonicalSurfaces' ||
            key === 'border') &&
          value &&
          typeof value === 'object' &&
          'default' in value
        ) {
          expect((a[key] as Record<string, unknown>).teams).toEqual(value.default);
          checked++;
        } else visit(a[key], value);
      }
    }
    visit(schema, teams);
    expect(checked).toBeGreaterThan(30);
    expect(Object.keys(schema.colors!.globalSemanticsBySegment!)).toEqual(['default', 'teams']);
  });
});
