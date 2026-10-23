import { withAlpha } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema as carbon } from './presets/carbon-ibm/carbon-ibm.schema.ts';
import { schema as apple } from './presets/ios-27-apple/ios-27-apple.schema.ts';
import { schema as material } from './presets/material-3-google/material-3-google.schema.ts';

describe.each([carbon, apple, material])('$name foreground hierarchy', (schema) => {
  it('publishes one neutral recipe and retains independent chromatic profiles', () => {
    const profiles = schema.global?.foregrounds?.profiles;
    expect(Object.keys(profiles?.neutral ?? {})).toEqual(['standard']);
    expect(profiles?.blue?.standard).toBeDefined();
    expect(profiles?.blue?.deep).toBeDefined();
    expect(schema.components.text?.options.emphasis).toBe('high');

    for (const family of Object.values(profiles ?? {})) {
      for (const profile of Object.values(family)) {
        if (!profile) continue;
        for (const segment of Object.values(profile.palettes)) {
          for (const theme of Object.values(segment ?? {})) {
            for (const context of Object.values(theme ?? {})) {
              expect(Object.keys(context).sort()).toEqual(['high', 'low', 'lowest', 'medium']);
              expect(context.low.rest).not.toBe(context.medium.rest);
              expect(context.low.rest).not.toBe(context.lowest.rest);
            }
          }
        }
      }
    }
  });
});

it('preserves Material terminal and pending colors while inserting the intermediate opacity', () => {
  const foreground =
    material.global?.foregrounds?.profiles?.blue?.standard?.palettes?.default?.light?.onSubtle;
  expect(foreground).toBeDefined();
  if (!foreground) return;
  const base = foreground.high.rest;
  if (typeof base !== 'string') throw new Error('Expected a solid Material foreground');
  expect(foreground.high.pending).toBe(withAlpha(base, 70));
  expect(foreground.high.disabled).toBe(withAlpha(base, 38));
  expect(foreground.medium.rest).toBe(withAlpha(base, 68));
  expect(foreground.medium.disabled).toBe(withAlpha(base, 38));
  expect(foreground.low.rest).toBe(withAlpha(base, 53));
  expect(foreground.low.disabled).toBe(withAlpha(base, 38));
  expect(foreground.lowest.rest).toBe(withAlpha(base, 38));
});

it('preserves the Carbon link interaction map on High rather than moving it to a weaker color', () => {
  const foreground =
    carbon.global?.foregrounds?.profiles?.blue?.standard?.palettes?.default?.light?.onSubtle;
  expect(foreground?.high.hover).toBeDefined();
  expect(foreground?.high.hover).not.toBe(foreground?.high.rest);
  expect(foreground?.medium.hover).toBeUndefined();
  expect(foreground?.low.hover).toBeUndefined();
  expect(foreground?.low.disabled).toBe(foreground?.high.disabled);
});

it('retains Apple menu and sheet foreground strengths independently of the Text default', () => {
  for (const component of [apple.components.dropdown, apple.components.bottomSheet]) {
    const colors = JSON.stringify(component);
    expect(colors).toContain('fg:neutral.standard.light.onSubtle.high');
    expect(colors).toContain('fg:neutral.standard.light.onSubtle.medium');
    expect(colors).not.toContain('fg:neutral.standard.light.onSubtle.low"');
    expect(colors).toContain('"parentState":"fg:neutral.standard.light.onSubtle.lowest"');
  }
});
