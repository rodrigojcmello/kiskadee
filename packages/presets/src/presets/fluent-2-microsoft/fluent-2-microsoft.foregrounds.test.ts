import { parseForegroundReferenceToken } from '@kiskadee/core';
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
              expect(Object.keys(profile.palettes[segment]![theme]![context]!).sort()).toEqual(
                [...strengths].sort()
              );
            }
          }
        }
      }
    }
  });

  it('preserves the old neutral anchors and authors an intermediate Low independently per track', () => {
    const neutral = catalog.profiles.neutral!.standard.palettes.default!;
    expect(strengths.map((strength) => neutral.light!.onSubtle[strength].rest)).toEqual([
      '#252525',
      '#616161',
      '#9b9b9b',
      '#d1d1d1'
    ]);
    expect(strengths.map((strength) => neutral.dark!.onSubtle[strength].rest)).toEqual([
      '#ffffff',
      '#b4b4b4',
      '#828282',
      '#5a5a5a'
    ]);
    expect(neutral.light!.onVivid!.low.rest).toBe('#ffffff75');
    expect(catalog.profiles.blue!.standard.palettes.default!.light!.onSubtle.low.rest).toBe(
      '#0064b475'
    );
    expect(catalog.profiles.blue!.deep!.palettes.default!.light!.onVivid!.low.rest).toBe(
      '#d2e8ff94'
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
      const { family, profile, theme, surfaceContext, emphasis, state } = coordinate;
      for (const segment of ['default', 'teams'] as const) {
        expect(
          catalog.profiles[family]?.[profile]?.palettes[segment]?.[theme]?.[surfaceContext]?.[
            emphasis
          ]?.[state],
          `${segment}: ${token}`
        ).toBeDefined();
      }
    }
  });
});
