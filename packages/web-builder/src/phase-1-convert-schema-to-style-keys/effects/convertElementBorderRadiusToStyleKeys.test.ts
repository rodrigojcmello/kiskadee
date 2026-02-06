import type { BorderRadiusEffectSchema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { convertElementBorderRadiusToStyleKeys } from './convertElementBorderRadiusToStyleKeys';

describe('convertElementBorderRadiusToStyleKeys', () => {
  it('generates style keys for basic numeric states (rest, hover, pressed, focus, disabled, readOnly)', () => {
    const schema: BorderRadiusEffectSchema = {
      rounded: {
        rest: 20,
        hover: 24,
        pressed: 16,
        focus: 20,
        disabled: 12,
        readOnly: 18
      }
    };

    const result = convertElementBorderRadiusToStyleKeys(schema.rounded!, 'borderRadiusRounded');

    expect(result).toEqual({
      rest: ['borderRadiusRounded__20'],
      hover: ['borderRadiusRounded--hover__24'],
      pressed: ['borderRadiusRounded--pressed__16'],
      focus: ['borderRadiusRounded--focus__20'],
      disabled: ['borderRadiusRounded--disabled__12'],
      readOnly: ['borderRadiusRounded--readOnly__18']
    });
  });

  it('generates style keys for selected nested states', () => {
    const schema: BorderRadiusEffectSchema = {
      rounded: {
        rest: 20,
        selected: {
          rest: 0,
          hover: 4,
          pressed: 0,
          focus: 0
        }
      }
    };

    const result = convertElementBorderRadiusToStyleKeys(schema.rounded!, 'borderRadiusRounded');

    expect(result).toEqual({
      rest: ['borderRadiusRounded__20'],
      'selected:rest': ['borderRadiusRounded--selected:rest__0'],
      'selected:hover': ['borderRadiusRounded--selected:hover__4'],
      'selected:pressed': ['borderRadiusRounded--selected:pressed__0'],
      'selected:focus': ['borderRadiusRounded--selected:focus__0']
    });
  });

  it('generates responsive ++size keys for non-selected values', () => {
    const schema: BorderRadiusEffectSchema = {
      rounded: {
        rest: {
          's:sm:1': 20,
          's:md:1': 18
        }
      }
    };

    const result = convertElementBorderRadiusToStyleKeys(schema.rounded!, 'borderRadiusRounded');
    expect(result).toEqual({
      rest: ['borderRadiusRounded__20', 'borderRadiusRounded__18']
    });
  });

  it('generates non-responsive key (no ++s:all) for values using s:all', () => {
    const schema: BorderRadiusEffectSchema = {
      rounded: {
        rest: {
          's:all': 12
        }
      }
    };

    const result = convertElementBorderRadiusToStyleKeys(schema.rounded!, 'borderRadiusRounded');
    expect(result).toEqual({
      rest: ['borderRadiusRounded__12']
    });
  });

  it('generates responsive ++size keys for selected sub-map values with explicit state in key, stored under selected:hover', () => {
    const schema: BorderRadiusEffectSchema = {
      rounded: {
        selected: {
          hover: {
            's:lg:1': 4
          }
        }
      }
    };

    const result = convertElementBorderRadiusToStyleKeys(schema.rounded!, 'borderRadiusRounded');

    expect(result).toEqual({
      'selected:hover': ['borderRadiusRounded--selected:hover__4']
    });
  });
});
