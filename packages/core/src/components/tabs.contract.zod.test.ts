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
            e1: {
              name: 'bar'
            }
          }
        }
      }
    });

    const issue = issues.find((value) => value.includes('components.tabs') && value.includes('elements'));
    expect(issue).toBeDefined();
    expect(issue).toContain('elements');
  });
});
