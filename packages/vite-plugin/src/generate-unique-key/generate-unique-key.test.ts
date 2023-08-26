import { generateUniqueKey } from './generate-unique-key';

describe('generateUniqueKey', () => {
  it('should return "a" for an empty string', () => {
    expect(generateUniqueKey()).toBe('a');
  });

  it('should return "ab" for "ac"', () => {
    expect(generateUniqueKey('ab')).toBe('ac');
  });

  it('should return "ba" for "bb"', () => {
    expect(generateUniqueKey('ba')).toBe('bb');
  });

  it('should return "aaa" for "zz"', () => {
    expect(generateUniqueKey('zz')).toBe('aaa');
  });

  it('should return "abaa" for "abz"', () => {
    expect(generateUniqueKey('abz')).toBe('aca');
  });

  it('should return "aaa" for "zz"', () => {
    expect(generateUniqueKey('zz')).toBe('aaa');
  });

  it('should return "aaaa" for "zzz"', () => {
    expect(generateUniqueKey('zzz')).toBe('aaaa');
  });

  it('should return "aaaaa" for "zzzz"', () => {
    expect(generateUniqueKey('zzzz')).toBe('aaaaa');
  });

  it('should return "aaca" for "aabz"', () => {
    expect(generateUniqueKey('aabz')).toBe('aaca');
  });

  it('should return "aabzba" for "aabzaz"', () => {
    expect(generateUniqueKey('aabzaz')).toBe('aabzba');
  });

  it('should return "azcaa" for "azbzz"', () => {
    expect(generateUniqueKey('azbzz')).toBe('azcaa');
  });
});
