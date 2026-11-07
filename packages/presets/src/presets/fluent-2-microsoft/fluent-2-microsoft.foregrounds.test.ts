import { parseForegroundReferenceToken, resolveForegroundVariant, withAlpha } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema } from './fluent-2-microsoft.schema.ts';

const strengths = ['high', 'medium', 'low', 'lowest'] as const;
const catalog = schema.global!.foregrounds!;

describe('Fluent four-strength foreground migration', () => {
  it('publishes one neutral profile and four strengths across both segment matrices', () => {
    expect(Object.keys(catalog.profiles.neutral!)).toEqual(['standard']);
    expect(schema.components.text!.options.emphasis).toBe('high');
    for (const family of Object.values(catalog.profiles)) {
      for (const profile of Object.values(family)) {
        for (const segment of ['default', 'teams'] as const) {
          for (const theme of ['light', 'dark', 'darker'] as const) {
            for (const context of ['onSubtle', 'onVivid'] as const) {
              expect(
                Object.keys(profile.palettes[segment]![theme]![context]!.standard).sort()
              ).toEqual([...strengths].sort());
            }
          }
        }
      }
    }
  });

  it('preserves the old neutral anchors and authors an intermediate Low independently per track', () => {
    const neutral = catalog.profiles.neutral!.standard.palettes.default!;
    expect(strengths.map((strength) => neutral.light!.onSubtle.standard[strength].rest)).toEqual([
      '#252525',
      '#616161',
      '#9b9b9b',
      '#d1d1d1'
    ]);
    expect(strengths.map((strength) => neutral.dark!.onSubtle.standard[strength].rest)).toEqual([
      '#ffffff',
      '#b4b4b4',
      '#828282',
      '#5a5a5a'
    ]);
    expect(neutral.light!.onVivid!.standard.low.rest).toBe('#ffffff75');
    expect(
      catalog.profiles.blue!.standard.palettes.default!.light!.onSubtle.standard.low.rest
    ).toBe('#0064b475');
    expect(catalog.profiles.blue!.deep!.palettes.default!.light!.onVivid!.standard.low.rest).toBe(
      '#d3e7ff94'
    );
  });

  it('keeps every component foreground reference on an existing profile, strength and state', () => {
    const references: string[] = [];
    const visit = (value: unknown): void => {
      if (typeof value === 'string' && value.startsWith('fg:')) references.push(value);
      else if (value && typeof value === 'object') Object.values(value).forEach(visit);
    };
    visit(schema.components);
    expect(references.length).toBeGreaterThan(100);
    for (const token of references) {
      const coordinate = parseForegroundReferenceToken(token);
      expect(coordinate, token).toBeDefined();
      if (!coordinate) continue;
      const { family, profile, theme, surfaceContext, colorVariant, emphasis, state } = coordinate;
      for (const segment of ['default', 'teams'] as const) {
        const variants =
          catalog.profiles[family]?.[profile]?.palettes[segment]?.[theme]?.[surfaceContext];
        expect(
          variants && resolveForegroundVariant(variants, colorVariant)[emphasis]?.[state],
          `${segment}: ${token}`
        ).toBeDefined();
      }
    }
  });
});

it('authors only the three common-profile onVivid alternatives and preserves the emphasis hierarchy', () => {
  const expected = {
    default: { blue: '#40befe', red: '#fe8a80', green: '#5ecd59' },
    teams: { blue: '#b5a2f4', red: '#fe8a80', green: '#5ecd59' }
  };
  for (const segment of ['default', 'teams'] as const)
    for (const theme of ['light', 'dark', 'darker'] as const)
      for (const [family, profiles] of Object.entries(catalog.profiles)) {
        for (const [profile, entry] of Object.entries(profiles)) {
          const palette = entry.palettes[segment]![theme]!;
          expect(palette.onSubtle.alternative).toBeUndefined();
          if (profile === 'standard' && ['blue', 'red', 'green'].includes(family)) {
            const high = expected[segment][family as 'blue' | 'red' | 'green'];
            expect(palette.onVivid!.alternative).toEqual({
              high: { rest: high, pending: withAlpha(high, 70) },
              medium: { rest: `${high}c2` },
              low: { rest: `${high}94` },
              lowest: { rest: `${high}66` }
            });
          } else expect(palette.onVivid!.alternative).toBeUndefined();
        }
      }
});
