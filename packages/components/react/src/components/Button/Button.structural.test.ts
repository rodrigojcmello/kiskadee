import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

describe('Button structural CSS', () => {
  it('keeps the authored group divider above Button interaction surfaces', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const dividerRule = css.match(/\.k-btn-e6a\s*\{([^}]*)\}/)?.[1];

    expect(dividerRule).toContain('z-index: 4');
    expect(css).not.toContain('.k-btn:hover + .k-btn-e6a::before');
    expect(css).not.toContain('.k-btn-e6a:has(+ .k-btn:hover)::before');
  });

  it('raises Hover only for the border-overlap fallback branch', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;

    expect(css).toContain('.k-btn-x3:not(.k-btn-x3a) > .k-btn:hover');
    expect(css).toContain('.k-btn-x3:not(.k-btn-x3a) > .k-btn.-h.-a');
  });
});
