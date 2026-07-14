import { describe, expect, it } from 'vitest';
import { extractCssClassName } from '../extractCssClassName.ts';

describe('extractCssClassName', () => {
  it('should extract simple class name', () => {
    const css = '.my-class { color: red; }';
    expect(extractCssClassName(css)).toBe('my-class');
  });

  it('should extract class name ignoring pseudo selectors like :hover', () => {
    const css = '.shadow--hover__[4,4,4,"#00000080"]:hover { box-shadow: 4px 4px 4px #00000080; }';
    expect(extractCssClassName(css)).toBe('shadow--hover__[4,4,4,"#00000080"]');
  });

  it('should extract class name inside @media block', () => {
    const css = '@media (max-width: 600px) { .my-class__test:hover { color: red; } }';
    expect(extractCssClassName(css)).toBe('my-class__test');
  });

  it('should return null for empty input', () => {
    expect(extractCssClassName('')).toBeNull();
  });

  it('should return null if no class found', () => {
    const css = 'body { margin: 0; }';
    expect(extractCssClassName(css)).toBeNull();
  });

  it('should correctly extract class with multiple special characters', () => {
    const css = '.a-b__c[d=e]:focus { }';
    expect(extractCssClassName(css)).toBe('a-b__c[d=e]');
  });

  it('should extract class name when no pseudo selector or space after', () => {
    const css = '.className{font-size: 12px;}';
    expect(extractCssClassName(css)).toBe('className');
  });

  it('should extract class name when followed by whitespace', () => {
    const css = '.className \n { font-weight: bold; }';
    expect(extractCssClassName(css)).toBe('className');
  });
});
