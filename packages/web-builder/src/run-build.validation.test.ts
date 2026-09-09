import type { Schema } from '@kiskadee/core';
import { describe, expect, it, vi } from 'vitest';
import { runBuild } from './run-build.ts';
import { loadPresetsToBuild } from './utils/loadPresetsToBuild.ts';

vi.mock('./utils/loadPresetsToBuild.ts', () => ({ loadPresetsToBuild: vi.fn() }));

describe('build contract diagnostics', () => {
  it.each([
    {
      contract: 'density',
      schema: { global: { density: { compact: 's:sm:1' } } },
      detail: 'At least one density must reference s:md:1.'
    },
    {
      contract: 'density',
      schema: {
        global: { density: { compact: 's:md:1' } },
        components: { button: { options: { density: { spacious: 's:lg:1' } } } }
      },
      detail: 'components.button.options.density'
    },
    {
      contract: 'interaction',
      schema: { global: { interaction: { controlCursor: { value: 'invalid', scope: 'web' } } } },
      detail: 'controlCursor'
    },
    {
      contract: 'global icon',
      schema: { global: { icons: { family: 'Invalid Family' } } },
      detail: 'family'
    }
  ])('identifies the $contract contract and preserves its diagnostic', async ({
    contract,
    schema,
    detail
  }) => {
    vi.mocked(loadPresetsToBuild).mockResolvedValue([
      {
        schema: { name: 'Diagnostic fixture', ...schema } as unknown as Schema,
        schemaPath: '/fixtures/invalid.schema.ts'
      }
    ]);

    const result = runBuild();
    await expect(result).rejects.toThrow(
      `Schema ${contract} contract validation failed for "Diagnostic fixture" (/fixtures/invalid.schema.ts).`
    );
    await expect(result).rejects.toThrow(detail);
  });
});
