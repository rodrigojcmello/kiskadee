import type { ElementForeground, SchemaForegrounds } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { expandElementForeground } from './compileForegrounds.ts';

const emphases = {
  medium: { rest: '#333333' },
  low: { rest: '#555555' },
  lowest: { rest: '#777777' }
} as const;

const foregrounds = {
  profiles: {
    neutral: {
      palettes: {
        default: {
          light: { onSubtle: emphases, onVivid: emphases },
          dark: { onSubtle: emphases }
        }
      }
    },
    red: {
      palettes: {
        default: {
          light: { onSubtle: emphases, onVivid: emphases },
          dark: { onSubtle: emphases }
        }
      }
    }
  }
} as const satisfies SchemaForegrounds;

describe('expandElementForeground', () => {
  it('projects profile values into the local textColor intent', () => {
    expect(
      expandElementForeground({ neutral: 'neutral' } satisfies ElementForeground, foregrounds)
    ).toEqual({
      default: {
        light: {
          onSubtle: { textColor: { neutral: emphases } },
          onVivid: { textColor: { neutral: emphases } }
        },
        dark: {
          onSubtle: { textColor: { neutral: emphases } }
        }
      }
    });
  });

  it('keeps multiple named color families independent in the same color channel', () => {
    expect(
      expandElementForeground(
        { neutral: 'neutral', red: 'red' } satisfies ElementForeground,
        foregrounds
      )
    ).toEqual({
      default: {
        light: {
          onSubtle: { textColor: { neutral: emphases, red: emphases } },
          onVivid: { textColor: { neutral: emphases, red: emphases } }
        },
        dark: {
          onSubtle: { textColor: { neutral: emphases, red: emphases } }
        }
      }
    });
  });

  it('fails defensively when a profile reference is unknown', () => {
    expect(() => expandElementForeground({ neutral: 'missing' }, foregrounds)).toThrow(
      '[web-builder] Foreground profile "missing" is not defined.'
    );
  });
});
