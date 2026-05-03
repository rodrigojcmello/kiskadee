import { describe, expect, it } from 'vitest';
import { validateTabsComponentContract } from './tabs.contract.zod.ts';

describe('validateTabsComponentContract', () => {
  it('rejects top-level elements because Tabs is variant-driven', () => {
    const issues = validateTabsComponentContract({
      elements: {
        e1: {}
      },
      variants: {
        line: {
          elements: {
            e1: {}
          }
        }
      }
    });

    expect(issues).toContain(
      'components.tabs.elements: top-level "elements" is not allowed; use "variants.<name>.elements"'
    );
  });
});
