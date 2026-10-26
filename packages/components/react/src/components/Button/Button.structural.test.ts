import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

describe('Button structural CSS', () => {
  it('anchors a passive indicator to the real border box without reserving layout space', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname).css;
    const host = css.match(/\.k-btn-e1k\s*\{([^}]*)\}/)?.[1];
    const indicator = css.match(/\.k-btn > \.k-btn-e11\s*\{([^}]*)\}/)?.[1];
    const outside = css.match(/\.k-btn > \.k-btn-e11a\s*\{([^}]*)\}/)?.[1];
    expect(host).toContain('overflow: visible');
    expect(host).not.toMatch(/(?:padding|margin|height|block-size):/);
    expect(indicator).toContain('position: absolute');
    expect(indicator).toContain('inset-inline: calc(var(--k-bdw) * -1)');
    expect(indicator).toContain('margin-inline: auto');
    expect(indicator).toContain('pointer-events: none');
    expect(indicator).toContain('inline-size: var(--k-bxw)');
    expect(indicator).toContain(
      'max-inline-size: max(0px, 100% + var(--k-bdw) * 2 - max(var(--k-mgl), var(--k-mgr)) * 2)'
    );
    expect(indicator).toContain('block-size: var(--k-bxh)');
    expect(indicator).toContain('border-radius: var(--k-bdr)');
    expect(indicator).toContain('inset-block-end: calc(var(--k-mgb) - var(--k-bdw))');
    expect(outside).toContain(
      'inset-block-end: calc((var(--k-bdw) + var(--k-mgt) + var(--k-bxh)) * -1)'
    );
  });

  it('clips feedback on an independent viewport without overriding progress, Badge or focus geometry', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname).css;
    const feedback = sass.compile(
      new URL(
        './effects/activation-feedback/ButtonActivationFeedback.structural.scss',
        import.meta.url
      ).pathname
    ).css;
    const viewport = css.match(/\.k-btn > \.k-btn-x6\s*\{([^}]*)\}/)?.[1];
    expect(viewport).toContain('inset: calc(var(--k-bdw) * -1)');
    expect(viewport).toContain('border-radius: inherit');
    expect(viewport).toContain('overflow: var(--k-af-overflow)');
    expect(viewport).toContain('clip-path: var(--k-af-clip)');
    expect(viewport).toContain('position: absolute');
    expect(css).toContain('.k-btn-x3 > .k-btn.k-btn-e1a:not(.k-btn-e1k)');
    expect(css).toContain(':not(:is(.k-btn-x1, .k-btn-x4, .k-btn-x6, .k-btn-e11))');
    expect(feedback).toContain('.k-btn-e1a:not(.k-btn-e1k):focus-visible');
    expect(feedback).toContain('.k-btn-e1a:not(.k-btn-e1k).-f.-k.-a');
    expect(feedback).toContain('.k-btn-e1a > .k-btn-x6::after');
    expect(feedback).toContain(':not(:is(.k-btn-x1, .k-btn-x4, .k-btn-x6, .k-btn-e11))');
    expect(feedback).not.toContain('.k-btn-e1a::after');
  });

  it('aligns overlays to borderless connected seams and ignores decoration in disclosure-only content', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname).css;
    const startEdge = css.match(
      /\.k-btn-x3a > \.k-btn \+ \.k-btn-e6a \+ \.k-btn > :is\(\.k-btn-e11, \.k-btn-x6\)\s*\{([^}]*)\}/
    )?.[1];
    const endEdge = css.match(
      /\.k-btn-x3a > \.k-btn:has\(\+ \.k-btn-e6a \+ \.k-btn\) > :is\(\.k-btn-e11, \.k-btn-x6\)\s*\{([^}]*)\}/
    )?.[1];
    expect(startEdge).toContain('inset-inline-start: 0');
    expect(endEdge).toContain('inset-inline-end: 0');
    const oneSeamBudget = css.match(
      /\.k-btn-x3a > \.k-btn \+ \.k-btn-e6a \+ \.k-btn > \.k-btn-e11,[^{]+\{([^}]*)\}/
    )?.[1];
    const twoSeamBudget = css.match(
      /\.k-btn-x3a > \.k-btn \+ \.k-btn-e6a \+ \.k-btn:has\(\+ \.k-btn-e6a \+ \.k-btn\) > \.k-btn-e11\s*\{([^}]*)\}/
    )?.[1];
    expect(oneSeamBudget).toContain(
      'max-inline-size: max(0px, 100% + var(--k-bdw) - max(var(--k-mgl), var(--k-mgr)) * 2)'
    );
    expect(twoSeamBudget).toContain(
      'max-inline-size: max(0px, 100% - max(var(--k-mgl), var(--k-mgr)) * 2)'
    );
    expect(css).toMatch(
      /\.k-btn:not\(:has\(> :not\(:is\(\.k-btn-e5, \.k-btn-x1, \.k-btn-x4, \.k-btn-x6, \.k-btn-e11\)\)\)\) > \.k-btn-e5\s*\{[^}]*margin-inline-start: 0;[^}]*padding-inline-start: 0;/
    );
    expect(css).not.toContain('.k-btn-e5:only-child');
  });

  it('normalizes intrinsic media and direct font glyphs using the authored icon viewport', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname).css;
    const slot = css.match(/^\.k-btn-e3\s*\{([^}]*)\}/m)?.[1];
    expect(slot).toContain('font-size: var(--k-bxh)');
    expect(slot).toContain('line-height: 1');
    expect(css).toMatch(
      /\.k-btn-e3 > picture > img\s*\{[^}]*block-size: 100%[^}]*inline-size: 100%/
    );
    expect(css).toMatch(/\.k-btn-e3 > picture > img\s*\{[^}]*object-fit: contain/);
    expect(css).toMatch(/\.k-btn-e3 > i\s*\{[^}]*font-size: inherit/);
  });

  it('anchors every external Badge corner using the host radius and logical axes', () => {
    const css = sass.compile(new URL('./Button.structural.scss', import.meta.url).pathname).css;
    for (const block of ['start', 'end']) {
      for (const inline of ['start', 'end']) {
        const selector = `.k-btn-x4-block-${block}-inline-${inline}`;
        const rule = css.slice(css.indexOf(`${selector} {`)).split('}')[0];
        expect(rule).toContain(`inset-block-${block}: calc(var(--k-bdr, 0px)`);
        expect(rule).toContain(`inset-inline-${inline}: calc(var(--k-bdr, 0px)`);
        expect(css).toContain(`${selector}:dir(rtl)`);
      }
    }
  });

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
