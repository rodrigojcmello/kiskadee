import { describe, expect, it } from 'vitest';
import { parseDensityScaleMap } from './density.contract.zod.ts';
import { resolveDensityScale } from './density.ts';

describe('density contract', () => {
  it('requires medium as a reference, independently of which density names it', () => {
    expect(parseDensityScaleMap({ regular: 's:md:1' })).toEqual({ regular: 's:md:1' });
    expect(parseDensityScaleMap({ regular: 's:md:1' })).toEqual({ regular: 's:md:1' });
    expect(() => parseDensityScaleMap({ compact: 's:sm:1', spacious: 's:lg:1' })).toThrow(
      'At least one density must reference s:md:1.'
    );
  });

  it('requires regular for a single density but permits medium in any branch', () => {
    for (const value of [{ compact: 's:md:1' }, { spacious: 's:md:1' }]) {
      expect(() => parseDensityScaleMap(value)).toThrow('A single density must be regular');
    }
    expect(
      parseDensityScaleMap({ compact: 's:md:1', regular: 's:lg:1', spacious: 's:lg:2' })
    ).toBeDefined();
    expect(resolveDensityScale('regular', { c: 'sm:1', r: 'md:1', s: 'lg:1' })).toBe('md:1');
    expect(resolveDensityScale('compact', { r: 'md:1' })).toBe('md:1');
  });

  it('rejects empty maps, unknown modes and public aliases in authored schemas', () => {
    for (const value of [{}, { default: 'adaptive' }, { compact: 'md' }]) {
      expect(() => parseDensityScaleMap(value)).toThrow();
    }
  });

  it('selects compiled references and keeps single-density components fixed', () => {
    expect(resolveDensityScale('adaptive', { c: 'sm:1', s: 'md:1' })).toBe('a');
    expect(resolveDensityScale('compact', { c: 'md:1', s: 'lg:1' })).toBe('md:1');
    expect(resolveDensityScale('spacious', { c: 'md:1' })).toBe('md:1');
    expect(resolveDensityScale('compact', { s: 'md:1' })).toBe('md:1');
  });
});
