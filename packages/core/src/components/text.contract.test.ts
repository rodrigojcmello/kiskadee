import { describe, expect, it } from 'vitest';
import { textForegroundValues } from '../foreground.ts';
import { validateTextComponentContract } from './text.ts';

describe('Text component contract', () => {
  it('accepts neutral plus every canonical chromatic foreground reference on e1', () => {
    const foreground = Object.fromEntries(
      textForegroundValues.map((value) => {
        const deep = value.endsWith('-deep');
        return [
          value,
          {
            family: deep ? value.slice(0, -'-deep'.length) : value,
            profile: deep ? 'deep' : 'standard'
          }
        ];
      })
    );

    expect(
      validateTextComponentContract({
        elements: {
          e1: {
            name: 'foreground',
            foreground
          }
        }
      })
    ).toEqual([]);
  });

  it('rejects extra elements, authored palettes, semantic intents, and black', () => {
    const issues = validateTextComponentContract({
      elements: {
        e1: {
          name: 'foreground',
          foreground: {
            neutral: { family: 'neutral', profile: 'standard' },
            primary: { family: 'primary', profile: 'standard' },
            destructive: { family: 'destructive', profile: 'standard' },
            black: { family: 'black', profile: 'standard' }
          },
          palettes: {}
        },
        e2: { name: 'extra' }
      }
    });

    expect(issues).toContain('components.text.elements.e2: unrecognized key');
    expect(issues).toContain('components.text.elements.e1.palettes: unrecognized key');
    expect(issues).toContain('components.text.elements.e1.foreground.primary: unrecognized key');
    expect(issues).toContain(
      'components.text.elements.e1.foreground.destructive: unrecognized key'
    );
    expect(issues).toContain('components.text.elements.e1.foreground.black: unrecognized key');
  });

  it('keeps neutral mandatory even when chromatic foregrounds are published', () => {
    expect(
      validateTextComponentContract({
        elements: {
          e1: {
            name: 'foreground',
            foreground: { blue: { family: 'blue', profile: 'standard' } }
          }
        }
      })
    ).toContain('components.text.elements.e1.foreground.neutral: required reference');
  });
});
