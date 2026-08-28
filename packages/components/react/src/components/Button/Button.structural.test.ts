import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

describe('Button structural CSS', () => {
  it('keeps inline Badge relations neutral in the Button block axis', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const relationRule = css.match(/\.k-btn-e7\s*\{([^}]*)\}/)?.[1] ?? '';
    const inlineStartRule = css.match(/\.k-btn-e7-inline-start\s*\{([^}]*)\}/)?.[1] ?? '';
    const inlineEndRule = css.match(/\.k-btn-e7-inline-end\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(relationRule).toContain('align-items: center');
    expect(relationRule).toContain('align-self: center');
    expect(relationRule).toContain('block-size: 0');
    expect(relationRule).toContain('display: inline-flex');
    expect(relationRule).toContain('flex: none');
    expect(relationRule).toContain('min-block-size: 0');
    expect(relationRule).toContain('overflow: visible');
    expect(relationRule).toContain('pointer-events: none');
    expect(relationRule).not.toContain('position: absolute');
    expect(relationRule).not.toContain('max-block-size');
    expect(relationRule).not.toContain('inline-size: 0');
    expect(inlineStartRule).toContain('padding-inline-end: var(--k-pdr)');
    expect(inlineEndRule).toContain('padding-inline-start: var(--k-pdl)');
  });

  it('removes the empty balancing track from edge-icon Buttons with an inline Badge', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const leadingRule =
      css.match(
        /\.k-btn-e1e\.k-btn-e1f:has\(> \.k-btn-e3\):has\(> \.k-btn-x5\):not\(:has\(> \.k-btn-e5\)\)\s*\{([^}]*)\}/
      )?.[1] ?? '';
    const trailingRule =
      css.match(
        /\.k-btn-e1e\.k-btn-e1g:has\(> \.k-btn-e3\):has\(> \.k-btn-x5\):not\(:has\(> \.k-btn-e5\)\)\s*\{([^}]*)\}/
      )?.[1] ?? '';

    expect(leadingRule).toContain('grid-template-columns: max-content max-content');
    expect(trailingRule).toContain('grid-template-columns: max-content max-content');
  });

  it('keeps the authored group divider above Button interaction surfaces', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;
    const dividerRule = css.match(/\.k-btn-e6a\s*\{([^}]*)\}/)?.[1];

    expect(dividerRule).toContain('z-index: 4');
    expect(css).not.toContain('.k-btn:hover + .k-btn-e6a:has(+ .k-btn)::before');
    expect(css).not.toContain('.k-btn-e6a:has(+ .k-btn:hover)::before');
    expect(css).not.toContain('.k-btn.-p.-a + .k-btn-e6a:has(+ .k-btn)::before');
    expect(css).not.toContain('.k-btn-e6a:has(+ .k-btn.-p.-a)::before');
  });

  it('raises interactive surfaces above sibling overlap while keeping the divider authoritative', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;

    expect(css).toContain('.k-btn-x3 > .k-btn:hover');
    expect(css).toContain('.k-btn-x3 > .k-btn:active');
    expect(css).toContain('.k-btn-x3 > .k-btn.-h.-a');
    expect(css).toContain('.k-btn-x3 > .k-btn.-p.-a');
    expect(css).toContain('.k-btn-x3 > .k-btn.-s.-a');
    expect(css).not.toContain('.k-btn-x3:not(.k-btn-x3a) > .k-btn:hover');

    const interactiveRule = css.match(/\.k-btn-x3 > \.k-btn:hover,[^{]+\{([^}]*)\}/)?.[1];
    const focusRule = css.match(/\.k-btn-x3 > \.k-btn:focus-visible,[^{]+\{([^}]*)\}/)?.[1];
    const dividerRule = css.match(/\.k-btn-e6a\s*\{([^}]*)\}/)?.[1];

    expect(interactiveRule).toContain('z-index: 2');
    expect(focusRule).toContain('z-index: 3');
    expect(dividerRule).toContain('z-index: 4');
  });

  it('compensates each side by half the projected divider thickness', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname, {
      style: 'expanded'
    }).css;

    expect(css).toContain('margin-inline-start: calc(var(--k-bxw) * -0.5)');
    expect(css).toContain('margin-inline-end: calc(var(--k-bxw) * -0.5)');
    expect(css).toContain('padding-inline-start: var(--k-pdl)');
    expect(css).toContain('padding-inline-end: var(--k-pdr)');
    expect(css).not.toContain('margin-inline-start: calc(var(--k-bxw) * -1)');
    expect(css).not.toContain('margin-inline-end: calc(var(--k-bxw) * -1)');
    expect(css).not.toContain('padding-inline-start: calc(var(--k-pdl) + var(--k-bxw))');
    expect(css).not.toContain('padding-inline-end: calc(var(--k-pdr) + var(--k-bxw))');
  });
});
