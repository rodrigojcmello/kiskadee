import { describe, expect, it } from 'vitest';
import { validateTabsComponentContract } from './tabs.contract.zod';

describe('validateTabsComponentContract', () => {
  it('rejects components that declare both top-level elements and variants', () => {
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

    expect(issues).toContain('components.tabs: expected either "elements" or "variants", not both');
  });
});
