import { describe, expect, it } from 'vitest';
import { schema } from './fluent-2-microsoft.schema.ts';

describe('Fluent 2 Microsoft typography', () => {
  it('publishes the Fluent Web stacks through semantic font roles', () => {
    expect(schema.global?.fonts).toEqual({
      families: {
        'segoe-ui': {
          stack: [
            'Segoe UI',
            'Segoe UI Web (West European)',
            'Open Sans',
            '-apple-system',
            'BlinkMacSystemFont',
            'Roboto',
            'Helvetica Neue',
            'sans-serif'
          ]
        },
        'fluent-monospace': {
          stack: ['Consolas', 'Courier New', 'Courier', 'monospace']
        }
      },
      roles: {
        body: 'segoe-ui',
        code: 'fluent-monospace'
      }
    });
  });
});
