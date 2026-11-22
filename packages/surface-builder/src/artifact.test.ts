import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateSchemaComponentContracts } from '@kiskadee/core';
import { schema as elegant } from '@kiskadee/presets/src/presets/elegant/index.ts';
import { schema as fluent } from '@kiskadee/presets/src/presets/fluent-2-microsoft/index.ts';
import { schema as material } from '@kiskadee/presets/src/presets/material-3-google/index.ts';
import { describe, expect, it } from 'vitest';
import {
  buildSurfaceContextsArtifact,
  checkSurfaceContexts,
  generateSurfaceContexts,
  getSurfaceContextsPath,
  getSurfacePresetKey,
  getSurfacePresetRevision,
  loadSurfacePresets,
  materializeSurfaceContexts,
  readSurfaceContexts,
  type SurfacePreset,
  validateSurfaceContextsArtifact
} from './index.ts';

function preset(schema: SurfacePreset['schema']): SurfacePreset {
  return { key: getSurfacePresetKey(schema), schema, schemaPath: 'unused.schema.ts' };
}

describe('portable surface contexts', () => {
  it('keeps the checked-in surface maps synchronized with all authored presets', async () => {
    await checkSurfaceContexts(await loadSurfacePresets());
  });

  it('checks the companion beside its schema and reports drift without rewriting it', async () => {
    const root = await mkdtemp(join(tmpdir(), 'surface-companion-'));
    const source = { ...preset(fluent), schemaPath: join(root, 'local-preset', 'preset.ts') };
    const path = join(root, 'local-preset', 'generated', 'surface-contexts.json');
    try {
      await expect(checkSurfaceContexts([source])).rejects.toMatchObject({ code: 'ENOENT', path });
      await generateSurfaceContexts([source]);
      await checkSurfaceContexts([source]);
      const edited = await readSurfaceContexts(source);
      edited.components.button!.regions!.e1!.output.default!.light!.onSubtle!.standard.primary!
        .high!.rest = 'onSubtle';
      const modifiedBytes = `${JSON.stringify(edited, null, 2)}\n`;
      await writeFile(path, modifiedBytes);
      await expect(checkSurfaceContexts([source])).rejects.toThrow('differs from generated output');
      await expect(readSurfaceContexts(source)).rejects.toThrow('differs from generated output');
      expect(await readFile(path, 'utf8')).toBe(modifiedBytes);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('derives Fluent Container Rest once and computes independent CardAction state deltas', () => {
    const source = preset(fluent);
    const sourceRevision = getSurfacePresetRevision(source.schema);
    const surfaces = buildSurfaceContextsArtifact(source);
    validateSurfaceContextsArtifact(surfaces, source);

    for (const segment of ['default', 'teams'] as const) {
      const container = surfaces.components.container;
      const catalog = container?.options?.canonicalSurfaces[segment];
      const card = surfaces.components.card;
      expect(catalog?.light?.find(({ referenceFor }) => referenceFor === 'onVivid')).toMatchObject({
        intent: 'primary',
        emphasis: 'highest',
        contentSurfaceContext: 'onVivid'
      });
      expect(
        card?.regions?.e1?.output?.[segment]?.light?.onSubtle?.standard.primary?.highest
      ).toEqual({
        rest: 'onVivid',
        disabled: 'onSubtle'
      });
      for (const theme of ['dark', 'darker'] as const) {
        expect(catalog?.[theme]?.every((entry) => entry.contentSurfaceContext === 'onSubtle')).toBe(
          true
        );
        const anchor = catalog?.[theme]?.find(({ referenceFor }) => referenceFor === 'onVivid');
        expect(anchor).toMatchObject({
          intent: 'primary',
          emphasis: 'highest',
          contentSurfaceContext: 'onSubtle'
        });
        expect(!!anchor?.rest).toBe(true);
        expect(
          card?.regions?.e1?.output?.[segment]?.[theme]?.onSubtle?.standard.primary?.highest?.rest
        ).toBe('onSubtle');
        expect(
          card?.options?.canonicalSurfaces[segment]?.[theme]?.find(
            ({ intent, emphasis }) => intent === 'primary' && emphasis === 'highest'
          )
        ).toEqual({
          intent: 'primary',
          emphasis: 'highest',
          rest: anchor?.rest,
          contentSurfaceContext: 'onSubtle'
        });
      }
    }

    const resolved = materializeSurfaceContexts(source.schema, surfaces);
    expect(() => validateSchemaComponentContracts(resolved)).not.toThrow();
    expect(resolved.components.card?.surfaceSource).toBeUndefined();
    expect(getSurfacePresetRevision(source.schema)).toBe(sourceRevision);
    expect(source.schema.components.card?.surfaceSource).toBe('container');
    expect(
      resolved.components.card?.options?.canonicalSurfaces?.default?.dark?.[0]
    ).not.toHaveProperty('rest');
  });

  it('derives the published appearance from paint for other presets and both TextField regions', () => {
    const authored = buildSurfaceContextsArtifact(preset(material));
    expect(
      authored.components.button!.regions!.e1!.output.default!.dark!.onSubtle!.standard.primary!
        .high!.rest
    ).toBe('onVivid');
    expect(authored.components.container).not.toHaveProperty('contentSurfaceContext');
    const outline = buildSurfaceContextsArtifact(preset(fluent)).components.textField?.variants
      ?.standard?.modes?.outline;
    expect(outline?.regions?.e3?.output).toBeDefined();
    expect(outline?.regions?.e8?.output).toBeDefined();
    expect(outline).not.toHaveProperty('contentSurfaceContext');
    expect(outline).not.toHaveProperty('contentRegionSurfaceContext');
  });

  it.each([
    { name: 'empty catalog', canonicalSurfaces: {} },
    { name: 'empty segment', canonicalSurfaces: { default: {} } }
  ])('omits an optional manual $name without rejecting the artifact', ({ canonicalSurfaces }) => {
    const source = preset(structuredClone(elegant));
    source.schema.components.container!.options = { canonicalSurfaces };
    const artifact = buildSurfaceContextsArtifact(source);
    expect(() => validateSurfaceContextsArtifact(artifact, source)).not.toThrow();
    expect(artifact.components.container?.options?.canonicalSurfaces).toBeUndefined();
    expect(artifact.components.card?.options?.canonicalSurfaces).toBeUndefined();
    expect(
      artifact.components.container?.regions?.e1?.output?.default?.light?.onSubtle?.standard.neutral
        ?.medium?.rest
    ).toBe('onSubtle');
  });

  it('still rejects the omission of a populated authored catalog', () => {
    const source = preset(material);
    const artifact = buildSurfaceContextsArtifact(source);
    expect(
      artifact.components.container?.options?.canonicalSurfaces.default?.light?.length
    ).toBeGreaterThan(0);
    delete artifact.components.container!.options;
    expect(() => validateSurfaceContextsArtifact(artifact, source)).toThrow(
      'components.container.options.canonicalSurfaces: required catalog is missing'
    );
  });

  it('keeps missing, malformed and stale artifacts out of the Web handoff', async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), 'kiskadee-surface-builder-test-'));
    const source = preset(fluent);
    const options = { outputDirectory };
    const path = getSurfaceContextsPath(source, options);
    try {
      await expect(readSurfaceContexts(source, options)).rejects.toThrow(/Cannot load.*ENOENT/);

      await generateSurfaceContexts([source], options);
      const first = await readFile(path, 'utf8');
      const artifact = await readSurfaceContexts(source, options);
      await generateSurfaceContexts([source], options);
      expect(await readFile(path, 'utf8')).toBe(first);
      expect(await readdir(join(outputDirectory, source.key))).toEqual(['surface-contexts.json']);

      const changed = { ...source, schema: { ...source.schema, prefix: 'changed' } };
      await expect(readSurfaceContexts(changed, options)).rejects.toThrow('stale surface data');

      const incomplete = structuredClone(artifact);
      delete incomplete.components.button;
      await writeFile(path, JSON.stringify(incomplete), 'utf8');
      await expect(readSurfaceContexts(source, options)).rejects.toThrow(
        'required surface map is missing'
      );

      const emptyDerived = structuredClone(artifact);
      emptyDerived.components.button!.regions!.e1!.output = {};
      await writeFile(path, JSON.stringify(emptyDerived), 'utf8');
      await expect(readSurfaceContexts(source, options)).rejects.toThrow(
        'derived surface map cannot be empty'
      );

      await writeFile(path, JSON.stringify({ ...artifact, formatVersion: 1 }), 'utf8');
      await expect(readSurfaceContexts(source, options)).rejects.toThrow(
        'unsupported portable surface format'
      );

      await writeFile(path, '{', 'utf8');
      await expect(readSurfaceContexts(source, options)).rejects.toThrow('Cannot load');
    } finally {
      await rm(outputDirectory, { recursive: true, force: true });
    }
  });
});
