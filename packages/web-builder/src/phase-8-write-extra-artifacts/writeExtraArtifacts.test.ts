import { access, readFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Schema, SchemaFonts } from '@kiskadee/core';
import { afterEach, describe, expect, it } from 'vitest';
import { writeExtraArtifacts } from './writeExtraArtifacts.ts';

const buildRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'build');
const generatedDirectories: string[] = [];

function createOutputSlug(label: string): string {
  const slug = `font-artifact-test-${label}-${process.pid}-${Date.now()}`;
  generatedDirectories.push(resolve(buildRoot, slug));
  return slug;
}

function createSchema(global: Schema['global']): Schema {
  return { global } as Schema;
}

afterEach(async () => {
  await Promise.all(
    generatedDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  );
});

describe('writeExtraArtifacts font artifacts', () => {
  it('preserves the semantic catalog in JSON and resolves role CSS variables', async () => {
    const fonts = {
      families: {
        inter: { stack: ['Inter', 'Arial', 'sans-serif'] },
        'jetbrains-mono': { stack: ['JetBrains Mono', 'monospace'] }
      },
      roles: {
        body: 'inter',
        code: 'jetbrains-mono'
      }
    } as const satisfies SchemaFonts;
    const outDirSlug = createOutputSlug('catalog');

    await writeExtraArtifacts({
      schema: createSchema({ fonts }),
      outDirSlug
    });

    const outputDirectory = resolve(buildRoot, outDirSlug);
    const globalArtifact = JSON.parse(
      await readFile(resolve(outputDirectory, 'global.kiskadee.json'), 'utf8')
    );
    const tokensCss = await readFile(resolve(outputDirectory, 'tokens.kiskadee.css'), 'utf8');

    expect(globalArtifact).toEqual({ fonts });
    expect(tokensCss).toContain('--k-font-body:Inter,Arial,sans-serif');
    expect(tokensCss).toContain('--k-font-heading:var(--k-font-body)');
    expect(tokensCss).toContain('--k-font-code:"JetBrains Mono",monospace');
  });

  it('uses the canonical code fallback and an explicit heading stack', async () => {
    const fonts = {
      families: {
        inter: { stack: ['Inter', 'sans-serif'] },
        lora: { stack: ['Lora', 'Georgia', 'serif'] }
      },
      roles: {
        body: 'inter',
        heading: 'lora'
      }
    } as const satisfies SchemaFonts;
    const outDirSlug = createOutputSlug('fallbacks');

    await writeExtraArtifacts({
      schema: createSchema({ fonts }),
      outDirSlug
    });

    const tokensCss = await readFile(resolve(buildRoot, outDirSlug, 'tokens.kiskadee.css'), 'utf8');

    expect(tokensCss).toContain('--k-font-heading:Lora,Georgia,serif');
    expect(tokensCss).toContain(
      '--k-font-code:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace'
    );
  });

  it('does not emit font variables when fonts are absent', async () => {
    const outDirSlug = createOutputSlug('absent');

    await writeExtraArtifacts({
      schema: createSchema({ focus: { width: 2 } }),
      outDirSlug
    });

    const tokensCss = await readFile(resolve(buildRoot, outDirSlug, 'tokens.kiskadee.css'), 'utf8');

    expect(tokensCss).toContain('--k-focus-width:2');
    expect(tokensCss).not.toContain('--k-font-');
  });

  it('publishes icon recommendations without creating CSS variables', async () => {
    const outDirSlug = createOutputSlug('icons');

    await writeExtraArtifacts({
      schema: createSchema({
        icons: { family: 'fluent-system', variant: 'regular' },
        focus: { width: 2 }
      }),
      outDirSlug
    });

    const outputDirectory = resolve(buildRoot, outDirSlug);
    const globalArtifact = JSON.parse(
      await readFile(resolve(outputDirectory, 'global.kiskadee.json'), 'utf8')
    );
    const tokensCss = await readFile(resolve(outputDirectory, 'tokens.kiskadee.css'), 'utf8');

    expect(globalArtifact.icons).toEqual({ family: 'fluent-system', variant: 'regular' });
    expect(tokensCss).not.toContain('--k-icon');
  });
});

describe('writeExtraArtifacts typography artifacts', () => {
  it('writes typography separately and does not copy the catalog into global metadata', async () => {
    const outDirSlug = createOutputSlug('typography');
    const typographyArtifact = {
      profiles: {
        'body-medium': {
          decorations: { textFont: 'body' as const, textWeight: 'normal' as const },
          scales: { textSize: 16, textHeight: 24 },
          className: 'k-a k-b k-c k-d'
        }
      },
      usage: { 'body-medium': [] }
    };

    await writeExtraArtifacts({
      schema: createSchema({
        typography: {
          profiles: {
            'body-medium': {
              decorations: { textFont: 'body', textWeight: 'normal' },
              scales: { textSize: 16, textHeight: 24 }
            }
          }
        }
      }),
      outDirSlug,
      typographyArtifact
    });

    const outputDirectory = resolve(buildRoot, outDirSlug);
    expect(
      JSON.parse(await readFile(resolve(outputDirectory, 'typography.kiskadee.json'), 'utf8'))
    ).toEqual(typographyArtifact);
    await expect(access(resolve(outputDirectory, 'global.kiskadee.json'))).rejects.toMatchObject({
      code: 'ENOENT'
    });
  });
});
