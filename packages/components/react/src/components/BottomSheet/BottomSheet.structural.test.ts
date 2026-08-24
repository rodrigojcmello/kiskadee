import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

describe('BottomSheet structural CSS', () => {
  it('hides only the leading automatic group boundary on each page', () => {
    const css = sass.compile(new URL('./BottomSheet.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;

    expect(css).toContain('.k-bsh-x3 > .k-bsh-e12:first-child');
    expect(css).toMatch(/\.k-bsh-x3 > \.k-bsh-e12:first-child\s*\{[^}]*display: none/s);
  });
});
