import { describe, expect, it } from 'vitest';
import {
  DEFAULT_WEB_STYLE_EMISSION_POLICY,
  getSeparatorStyleEmissionPolicyIssues,
  resolveElementStyleEmissionPolicy
} from './web-build-policy.ts';

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
