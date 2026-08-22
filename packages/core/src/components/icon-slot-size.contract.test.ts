import { describe, expect, it } from 'vitest';
import { validateSliderComponentContract } from './slider.contract.zod.ts';
import { validateSwitchComponentContract } from './switch.contract.zod.ts';
import { validateTabsComponentContract } from './tabs.contract.zod.ts';

const iconSize = { 's:md:1': 's:md:1' } as const;

describe('schema-owned icon slot sizes', () => {
  it('requires iconSize and rejects box geometry on Switch e6', () => {
    const missing = validateSwitchComponentContract({
      variants: { standard: { modes: { base: { elements: { e6: { name: 'icon' } } } } } }
    });
    const legacy = validateSwitchComponentContract({
      variants: {
        standard: {
          modes: {
            base: {
              elements: {
                e6: {
                  name: 'icon',
                  iconSize,
                  scales: { boxWidth: { 's:md:1': 16 }, boxHeight: { 's:md:1': 16 } }
                }
              }
            }
          }
        }
      }
    });

    expect(missing.some((issue) => issue.includes('e6.iconSize'))).toBe(true);
    expect(legacy.some((issue) => issue.includes('e6') && issue.includes('scales'))).toBe(true);
  });

  it('requires iconSize and rejects box geometry on Tabs e4', () => {
    const missing = validateTabsComponentContract({
      variants: { line: { elements: { e4: { name: 'icon' } } } }
    });
    const legacy = validateTabsComponentContract({
      variants: {
        line: {
          elements: {
            e4: {
              name: 'icon',
              iconSize,
              scales: { boxWidth: { 's:md:1': 16 }, boxHeight: { 's:md:1': 16 } }
            }
          }
        }
      }
    });

    expect(missing.some((issue) => issue.includes('e4.iconSize'))).toBe(true);
    expect(legacy.some((issue) => issue.includes('e4') && issue.includes('scales'))).toBe(true);
  });

  it('requires iconSize and rejects box geometry on Slider e6 and e19', () => {
    const missing = validateSliderComponentContract({
      variants: {
        standard: {
          modes: {
            base: { elements: { e6: { name: 'endpoint icon' }, e19: { name: 'thumb icon' } } }
          }
        }
      }
    });
    const legacy = validateSliderComponentContract({
      variants: {
        standard: {
          modes: {
            base: {
              elements: {
                e6: { name: 'endpoint icon', iconSize, scales: { boxWidth: 16 } },
                e19: { name: 'thumb icon', iconSize, scales: { boxHeight: 16 } }
              }
            }
          }
        }
      }
    });

    expect(missing.some((issue) => issue.includes('e6.iconSize'))).toBe(true);
    expect(missing.some((issue) => issue.includes('e19.iconSize'))).toBe(true);
    expect(legacy.some((issue) => issue.includes('e6') && issue.includes('scales'))).toBe(true);
    expect(legacy.some((issue) => issue.includes('e19') && issue.includes('scales'))).toBe(true);
  });
});
