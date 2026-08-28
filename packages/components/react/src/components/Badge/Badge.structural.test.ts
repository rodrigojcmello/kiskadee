import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

describe('Badge structural CSS', () => {
  it('consumes nominal text geometry as required minimum-size tokens', () => {
    const css = sass.compile(new URL('./Badge.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const surfaceRule = css.match(/\.k-bdg-e1\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(surfaceRule).toContain('min-block-size: var(--k-bxh)');
    expect(surfaceRule).toContain('min-inline-size: var(--k-bxh)');
    expect(surfaceRule).not.toContain('var(--k-bxh,');
    expect(surfaceRule).not.toContain('--k-bxw');
  });

  it('clips only full-bleed artwork so the separation ring can extend beyond the viewport', () => {
    const css = sass.compile(new URL('./Badge.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const markRule = css.match(/\.k-bdg-e3\s*\{([^}]*)\}/)?.[1] ?? '';
    const artworkRule = css.match(/\.k-bdg-e3 > :not\(\.k-bdg-e6\)\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(markRule).not.toContain('overflow: hidden');
    expect(markRule).toContain('isolation: isolate');
    expect(artworkRule).toContain('border-radius: inherit');
    expect(artworkRule).toContain('overflow: hidden');
    expect(artworkRule).toContain('position: relative');
    expect(artworkRule).toContain('z-index: 1');
  });

  it('applies the emitted separation backing only to full-bleed Marks', () => {
    const css = sass.compile(new URL('./Badge.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const backingRule = css.match(/\.k-bdg-e3 > \.k-bdg-e6\s*\{([^}]*)\}/)?.[1] ?? '';
    const ringRule = css.match(/(?:^|\n)\.k-bdg-e6\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(backingRule).toContain('background-color: var(--k-bgc)');
    expect(backingRule).toContain('z-index: 0');
    expect(ringRule).not.toContain('background-color');
  });

  it('paints the separation ring outside the Badge viewport', () => {
    const css = sass.compile(new URL('./Badge.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const ringRule = css.match(/(?:^|\n)\.k-bdg-e6\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(ringRule).toContain('box-shadow: 0 0 0 var(--k-bdw) var(--k-bdc)');
    expect(ringRule).toContain('inset: 0');
    expect(ringRule).not.toContain('border-width');
    expect(ringRule).not.toContain('calc(-1 * var(--k-bdw))');
    expect(css).not.toContain('background-clip: padding-box');
  });
});
