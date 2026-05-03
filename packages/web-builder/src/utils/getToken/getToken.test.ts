import { describe, expect, it } from 'vitest';
import { getToken } from './getToken.ts';

describe('getToken', () => {
  it('should return "a" for index 0', () => {
    expect(getToken(0)).toBe('a');
  });

  it('should return "z" for index 25', () => {
    expect(getToken(25)).toBe('z');
  });

  it('should return "aa" for index 26', () => {
    expect(getToken(26)).toBe('aa');
  });

  it('should return "ab" for index 27', () => {
    expect(getToken(27)).toBe('ab');
  });

  it('should return "zz" for index 701', () => {
    expect(getToken(701)).toBe('zz');
  });

  it('should return "aaa" for index 702', () => {
    expect(getToken(702)).toBe('aaa');
  });
});
