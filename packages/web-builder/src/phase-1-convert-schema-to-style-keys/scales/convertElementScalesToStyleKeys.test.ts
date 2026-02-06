import type { StyleKeyByElement } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { convertElementScalesToStyleKeys } from './convertElementScalesToStyleKeys';

describe('convertElementScalesToStyleKeys', () => {
  it('should generate paddingTop 10 style key for numeric value', () => {
    const scale = { paddingTop: 10 };
    const result = convertElementScalesToStyleKeys(scale);
    expect(result).toEqual({
      's:all': ['paddingTop__10']
    });
  });

  it('should generate textSize 16 style key when provided as a direct number', () => {
    const scale = { textSize: 16 };
    const result = convertElementScalesToStyleKeys(scale);
    expect(result).toEqual({
      's:all': ['textSize__16']
    });
  });

  it('should generate textSize__14 style key when given as a size token without breakpoints', () => {
    const scale = { textSize: { 's:md:1': 14 } };
    const result = convertElementScalesToStyleKeys(scale);
    expect(result).toEqual({
      's:md:1': ['textSize__14']
    });
  });

  it('should generate default and breakpoint style keys for nested responsive overrides', () => {
    const scale = {
      textSize: { 's:md:1': { 'bp:all': 16, 'bp:lg:2': 10 } }
    };
    const result = convertElementScalesToStyleKeys(scale);
    expect(result).toEqual({
      's:md:1': ['textSize__16', 'textSize++s:md:1::bp:lg:2__10']
    });
  });

  it('should generate style keys for textSize, paddingBottom and marginTop together', () => {
    const scale = {
      textSize: {
        's:sm:1': { 'bp:all': 14, 'bp:lg:1': 12 },
        's:md:1': { 'bp:all': 16, 'bp:lg:1': 14 }
      },
      paddingBottom: { 's:md:1': { 'bp:sm:1': 10, 'bp:lg:2': 8 } },
      marginTop: 20
    };

    const expectedResult: StyleKeyByElement['scales'] = {
      's:all': ['marginTop__20'],
      's:sm:1': ['textSize__14', 'textSize++s:sm:1::bp:lg:1__12'],
      's:md:1': [
        'textSize__16',
        'textSize++s:md:1::bp:lg:1__14',
        'paddingBottom++s:md:1::bp:sm:1__10',
        'paddingBottom++s:md:1::bp:lg:2__8'
      ]
    };

    const result = convertElementScalesToStyleKeys(scale);

    expect(result).toEqual(expectedResult);
  });
});
