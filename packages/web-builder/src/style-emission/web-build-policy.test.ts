import { describe, expect, it } from 'vitest';
import {
  DEFAULT_WEB_STYLE_EMISSION_POLICY,
  getSeparatorStyleEmissionPolicyIssues,
  resolveElementStyleEmissionPolicy
} from './web-build-policy.ts';

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
