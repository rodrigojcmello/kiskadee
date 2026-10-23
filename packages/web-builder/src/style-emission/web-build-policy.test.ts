import { breakpoints } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { transformColorKeyToCss } from '../phase-4-convert-style-keys-to-css-rules/palettes/transformColorKeyToCss.ts';
import { transformScaleKeyToCss } from '../phase-4-convert-style-keys-to-css-rules/scales/transformScaleKeyToCss.ts';
import {
  DEFAULT_WEB_STYLE_EMISSION_POLICY,
  getSeparatorStyleEmissionPolicyIssues,
  resolveElementStyleEmissionPolicy
} from './web-build-policy.ts';

describe('TextField internal content emission', () => {
  it('publishes region paint without adding region layout insets', () => {
    const styleEmissionPolicy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'textField',
      'e8'
    );
    expect(
      transformScaleKeyToCss('borderWidth__1', breakpoints, 'edge', { styleEmissionPolicy })
    ).toBe('.edge { --k-bdw: 1px }');
    expect(styleEmissionPolicy.boxColorEmission).toBe('token');
    expect(styleEmissionPolicy.borderColorEmission).toBe('token');
    const background = transformColorKeyToCss('boxColor__#f2f2f2', 'surface', true, {
      styleEmissionPolicy
    });
    const separator = transformColorKeyToCss('borderColor__#616161', 'separator', true, {
      styleEmissionPolicy
    });
    expect(background).toContain('--k-bgc: #f2f2f2');
    expect(background).not.toContain('background:');
    expect(separator).toContain('--k-bdc: #616161');
    expect(separator).not.toContain('border-color:');
    expect(DEFAULT_WEB_STYLE_EMISSION_POLICY.components?.textField?.elements).not.toHaveProperty(
      'e11'
    );
  });
  it('publishes shell block spacing for the editing lane while preserving inline and input padding', () => {
    const control = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'textField',
      'e3'
    );
    const input = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'textField',
      'e4'
    );

    expect(
      transformScaleKeyToCss('paddingTop__8', breakpoints, 'top', {
        styleEmissionPolicy: control
      })
    ).toBe('.top { --k-pdt: 8px }');
    expect(
      transformScaleKeyToCss('paddingBottom__4', breakpoints, 'bottom', {
        styleEmissionPolicy: control
      })
    ).toBe('.bottom { --k-pdb: 4px }');
    expect(
      transformScaleKeyToCss('paddingLeft__12', breakpoints, 'start', {
        styleEmissionPolicy: control
      })
    ).toBe('.start { padding-left: 12px }');
    expect(
      transformScaleKeyToCss('paddingRight__12', breakpoints, 'end', {
        styleEmissionPolicy: control
      })
    ).toBe('.end { padding-right: 12px }');
    expect(
      transformScaleKeyToCss('paddingTop__10', breakpoints, 'inside', {
        styleEmissionPolicy: input
      })
    ).toBe('.inside { padding-top: 10px }');
  });
  it('emits gap variables without physical margins or padding', () => {
    const styleEmissionPolicy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'textField',
      'e8'
    );
    expect(
      transformScaleKeyToCss('paddingLeft__4', breakpoints, 'gap', { styleEmissionPolicy })
    ).toBe('.gap { --k-pdl: 4px }');
    expect(
      transformScaleKeyToCss('marginRight__4', breakpoints, 'space', { styleEmissionPolicy })
    ).toBe('.space { --k-mgr: 4px }');
  });
  it('publishes logical label offsets and insets without leftover physical declarations', () => {
    const label = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'textField',
      'e2'
    );
    const inline = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'textField',
      'e7'
    );
    for (const [key, variable, policy] of [
      ['marginLeft__4', '--k-mgl', label],
      ['paddingLeft__8', '--k-pdl', label],
      ['paddingRight__8', '--k-pdr', label],
      ['paddingRight__8', '--k-pdr', inline]
    ] as const) {
      expect(
        transformScaleKeyToCss(key, breakpoints, 'logical', { styleEmissionPolicy: policy })
      ).toBe(`.logical { ${variable}: ${key.endsWith('__4') ? 4 : 8}px }`);
    }
  });
  it('publishes region gaps and icon dimensions without physical layout declarations', () => {
    const region = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'textField',
      'e8'
    );
    const icon = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'textField',
      'e9'
    );
    for (const [key, variable, policy] of [
      ['paddingLeft__20', '--k-pdl', region],
      ['marginRight__20', '--k-mgr', region],
      ['boxWidth__20', '--k-bxw', icon],
      ['boxHeight__20', '--k-bxh', icon]
    ] as const) {
      expect(
        transformScaleKeyToCss(key, breakpoints, 'content', { styleEmissionPolicy: policy })
      ).toBe(`.content { ${variable}: 20px }`);
    }
    expect(
      resolveElementStyleEmissionPolicy(DEFAULT_WEB_STYLE_EMISSION_POLICY, 'textField', 'e10')
        .textColorEmission
    ).toBe('direct');
  });
});

describe('Button Web style-emission policy', () => {
  it('publishes icon dimensions as tokens for structural logical sizing', () => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'button',
      'e3'
    );

    expect(policy.boxWidthEmission).toBe('token');
    expect(policy.boxHeightEmission).toBe('token');
  });

  it('publishes divider dimensions as tokens while keeping its color atomic', () => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'button',
      'e6'
    );

    expect(policy.boxWidthEmission).toBe('token');
    expect(policy.boxHeightEmission).toBe('token');
    expect(policy.boxColorEmission).toBe('direct');
  });

  it('keeps border emission out of the disclosure slot', () => {
    const disclosurePolicy = DEFAULT_WEB_STYLE_EMISSION_POLICY.components?.button?.elements?.e5;

    expect(disclosurePolicy).not.toHaveProperty('borderWidthEmission');
    expect(disclosurePolicy).not.toHaveProperty('borderColorEmission');
  });

  it('publishes inline Badge relation spacing as logical structural tokens', () => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'button',
      'e7'
    );

    expect(policy.paddingLeftEmission).toBe('token');
    expect(policy.paddingRightEmission).toBe('token');
  });
});

describe('Badge and Chip Web style-emission policy', () => {
  it('publishes only the Badge text height as its structural minimum token', () => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'badge',
      'e1'
    );

    expect(policy.boxHeightEmission).toBe('token');
    expect(DEFAULT_WEB_STYLE_EMISSION_POLICY.components?.badge?.elements?.e1).not.toHaveProperty(
      'boxWidthEmission'
    );
  });

  it('publishes every owned icon viewport as structural tokens', () => {
    for (const [component, element] of [
      ['badge', 'e3'],
      ['badge', 'e4'],
      ['chip', 'e4'],
      ['chip', 'e6']
    ] as const) {
      const policy = resolveElementStyleEmissionPolicy(
        DEFAULT_WEB_STYLE_EMISSION_POLICY,
        component,
        element
      );
      expect(policy.boxWidthEmission).toBe('token');
      expect(policy.boxHeightEmission).toBe('token');
    }
  });

  it('publishes the Badge separation backing, ring width, and ring color as structural tokens', () => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'badge',
      'e6'
    );

    expect(policy.boxColorEmission).toBe('token');
    expect(policy.borderWidthEmission).toBe('token');
    expect(policy.borderColorEmission).toBe('token');
  });
});

describe('Tabs Web style-emission policy', () => {
  it('publishes Bridge icon dimensions as tokens without changing other variants', () => {
    const bridgePolicy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'tabs',
      'e4',
      'bridge'
    );
    const linePolicy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'tabs',
      'e4',
      'line'
    );

    expect(bridgePolicy.boxWidthEmission).toBe('token');
    expect(bridgePolicy.boxHeightEmission).toBe('token');
    expect(linePolicy.boxWidthEmission).toBe('direct');
    expect(linePolicy.boxHeightEmission).toBe('direct');
  });
});

describe('separator Web style-emission policy', () => {
  it('publishes Select divider thickness and extent without making the line interactive', () => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'select',
      'e12'
    );
    expect(policy.boxWidthEmission).toBe('token');
    expect(policy.boxHeightEmission).toBe('token');
    expect(policy.boxColorEmission).toBe('direct');
    expect(
      getSeparatorStyleEmissionPolicyIssues(
        {
          components: {
            select: {
              variants: {
                standard: {
                  modes: { outline: { elements: { e12: { separator: { 's:all': 'subtle' } } } } }
                }
              }
            }
          }
        },
        DEFAULT_WEB_STYLE_EMISSION_POLICY
      )
    ).toEqual([]);
  });

  it('preserves Select surface paint while publishing tokens for component-colored focus', () => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'select',
      'e3'
    );
    expect(policy.boxColorEmission).toBe('mirrored');
    expect(policy.borderColorEmission).toBe('mirrored');
    expect(policy.borderWidthEmission).toBe('mirrored');
  });

  it('shares explicit token thickness between Separator and Dropdown', () => {
    expect(
      resolveElementStyleEmissionPolicy(DEFAULT_WEB_STYLE_EMISSION_POLICY, 'separator', 'e1')
        .boxWidthEmission
    ).toBe('token');
    expect(
      resolveElementStyleEmissionPolicy(DEFAULT_WEB_STYLE_EMISSION_POLICY, 'dropdown', 'e7')
        .boxWidthEmission
    ).toBe('token');
  });

  it('mirrors Dropdown surface padding for free content and grouped collections', () => {
    expect(
      resolveElementStyleEmissionPolicy(DEFAULT_WEB_STYLE_EMISSION_POLICY, 'dropdown', 'e1')
        .paddingEmission
    ).toBe('mirrored');
  });

  it('publishes only Dropdown item inline paddings as structural tokens', () => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'dropdown',
      'e2'
    );

    expect(policy.paddingLeftEmission).toBe('token');
    expect(policy.paddingRightEmission).toBe('token');
    expect(policy.paddingEmission).toBe('direct');
    expect(policy.selectedBoxColorGateClass).toBe('k-ddn-sbg');
  });

  it.each(['e4', 'e5'])('publishes Dropdown %s edge insets as structural tokens', (element) => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'dropdown',
      element
    );

    expect(policy.paddingLeftEmission).toBe('token');
    expect(policy.paddingRightEmission).toBe('token');
    expect(policy.paddingEmission).toBe('direct');
  });

  it('publishes Dropdown trailing spacing as a structural token', () => {
    expect(
      resolveElementStyleEmissionPolicy(DEFAULT_WEB_STYLE_EMISSION_POLICY, 'dropdown', 'e6')
        .paddingLeftEmission
    ).toBe('token');
  });

  it('publishes both Dropdown end-text paddings as structural tokens', () => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'dropdown',
      'e8'
    );

    expect(policy.paddingLeftEmission).toBe('token');
    expect(policy.paddingRightEmission).toBe('token');
  });

  it('publishes the Dropdown checkmark gap as a structural token', () => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'dropdown',
      'e10'
    );

    expect(policy.boxHeightEmission).toBe('token');
    expect(policy.boxWidthEmission).toBe('token');
    expect(policy.paddingRightEmission).toBe('token');
  });

  it('publishes the Dropdown group-label complementary margin as a structural token', () => {
    expect(
      resolveElementStyleEmissionPolicy(DEFAULT_WEB_STYLE_EMISSION_POLICY, 'dropdown', 'e9')
        .marginLeftEmission
    ).toBe('token');
  });

  it('publishes the Dropdown scroll affordance icon dimensions as structural tokens', () => {
    const policy = resolveElementStyleEmissionPolicy(
      DEFAULT_WEB_STYLE_EMISSION_POLICY,
      'dropdown',
      'e11'
    );

    expect(policy.boxHeightEmission).toBe('token');
    expect(policy.boxWidthEmission).toBe('token');
  });

  it('fails when a recipe consumer has no explicit token policy', () => {
    const schema = {
      components: {
        separator: {
          elements: {
            e1: { separator: { 's:all': 'subtle' } }
          }
        },
        tabs: {
          variants: {
            segmented: {
              options: { separator: true }
            }
          }
        }
      }
    };

    expect(getSeparatorStyleEmissionPolicyIssues(schema, undefined)).toEqual([
      'components.separator.elements.e1.separator: requires explicit boxWidthEmission "token" in the Web style-emission policy'
    ]);
    expect(
      getSeparatorStyleEmissionPolicyIssues(schema, DEFAULT_WEB_STYLE_EMISSION_POLICY)
    ).toEqual([]);

    expect(
      getSeparatorStyleEmissionPolicyIssues(schema, {
        components: {
          separator: {
            elements: {
              e1: {}
            }
          }
        }
      })
    ).toEqual([
      'components.separator.elements.e1.separator: requires explicit boxWidthEmission "token" in the Web style-emission policy'
    ]);
  });
});

it('keeps Select positioner spacing token-only for collision middleware', () => {
  const policy = resolveElementStyleEmissionPolicy(
    DEFAULT_WEB_STYLE_EMISSION_POLICY,
    'select',
    'e13'
  );
  expect(policy.marginTopEmission).toBe('token');
  expect(policy.paddingEmission).toBe('token');
});
