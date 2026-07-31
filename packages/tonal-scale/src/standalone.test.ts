import { describe, expect, it } from 'vitest';

import { KISKADEE_TONES } from './kiskadee-tonal-scale.ts';
import {
  formatStandaloneKiskadeeTonalFamilyArtifact,
  generateStandaloneKiskadeeTonalFamily,
  STANDALONE_TONAL_ARTIFACT_GENERATOR,
  StandaloneTonalFamilyError,
  verifyStandaloneKiskadeeTonalFamilyArtifact
} from './standalone.ts';

const SOURCE_EXACT = {
  lightPolicy: 'source-exact',
  darkPolicy: 'source-exact'
} as const;

describe('standalone tonal family artifact v1', () => {
  it('preserves a chromatic seed in both themes and emits complete deterministic scales', async () => {
    const input = {
      seedHex: '#0B57D0',
      tonalProfile: 'muted-darks',
      ...SOURCE_EXACT
    } as const;
    const first = await generateStandaloneKiskadeeTonalFamily(input);
    const second = await generateStandaloneKiskadeeTonalFamily({
      ...input,
      seedHex: '#0b57d0'
    });

    expect(first).toEqual(second);
    expect(first.generator).toEqual(STANDALONE_TONAL_ARTIFACT_GENERATOR);
    expect(first.seedHex).toBe('#0b57d0');
    expect(first.diagnostics.status).toBe('pass');
    expect(first.diagnostics.themes.light.sourceSeedPreserved).toBe(true);
    expect(first.diagnostics.themes.dark.sourceSeedPreserved).toBe(true);
    expect(first.generatedAnchors.light.hex).toBe('#0b57d0');
    expect(first.generatedAnchors.dark.hex).toBe('#0b57d0');
    expect(first.functionalReferences.light.vivid).toMatchObject(first.generatedAnchors.light);
    expect(first.functionalReferences.dark.vivid).toMatchObject(first.generatedAnchors.dark);
    expect(first.functionalReferences.light.vivid.source).toBe('generated-anchor');
    expect(first.functionalReferences.dark.vivid.source).toBe('generated-anchor');
    expect(Object.keys(first.scales.light).map(Number)).toEqual(KISKADEE_TONES);
    expect(Object.keys(first.scales.dark).map(Number)).toEqual(KISKADEE_TONES);
    expect(first.scales.light['0']).toBe('#ffffff');
    expect(first.scales.light['100']).toBe('#000000');
    expect(first.scales.dark['0']).toBe('#000000');
    expect(first.scales.dark['100']).toBe('#ffffff');
    expect(first.functionalReferences.light.subtle.tone).toBe(4);
    expect(KISKADEE_TONES.indexOf(first.functionalReferences.dark.subtle.tone)).toBeLessThan(
      KISKADEE_TONES.indexOf(first.functionalReferences.dark.vivid.tone)
    );
    expect(formatStandaloneKiskadeeTonalFamilyArtifact(first)).toBe(
      formatStandaloneKiskadeeTonalFamilyArtifact(second)
    );
  });

  it('keeps absolute black at both generated caps while emitting usable vivid references', async () => {
    const artifact = await generateStandaloneKiskadeeTonalFamily({
      seedHex: '#000000',
      tonalProfile: 'muted-darks',
      ...SOURCE_EXACT
    });

    expect(artifact.generatedAnchors.light).toEqual({ tone: 100, hex: '#000000' });
    expect(artifact.generatedAnchors.dark).toEqual({ tone: 0, hex: '#000000' });
    expect(artifact.functionalReferences.light.vivid).toMatchObject({
      tone: 85,
      source: 'cap-fallback'
    });
    expect(
      KISKADEE_TONES[KISKADEE_TONES.indexOf(artifact.functionalReferences.light.vivid.tone) + 3]
    ).toBeDefined();
    expect(artifact.functionalReferences.dark.vivid).toMatchObject({
      source: 'contrast-mirror'
    });
    expect(artifact.functionalReferences.dark.vivid.tone).not.toBe(0);
    expect(artifact.diagnostics.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'VIVID_REFERENCE_CAP_FALLBACK',
          theme: 'light'
        }),
        expect.objectContaining({
          code: 'VIVID_REFERENCE_CAP_FALLBACK',
          theme: 'dark'
        })
      ])
    );
    expect(artifact.diagnostics.status).toBe('pass');
  });

  it('verifies integrity and deterministic replay', async () => {
    const artifact = await generateStandaloneKiskadeeTonalFamily({
      seedHex: '#0866ff',
      tonalProfile: 'muted-darks',
      ...SOURCE_EXACT
    });
    await expect(verifyStandaloneKiskadeeTonalFamilyArtifact(artifact)).resolves.toMatchObject({
      valid: true,
      issues: []
    });

    const tampered = structuredClone(artifact);
    tampered.scales.light['45'] = '#123456';
    const verification = await verifyStandaloneKiskadeeTonalFamilyArtifact(tampered);
    expect(verification.valid).toBe(false);
    if (verification.valid) throw new Error('Tampered artifact must fail verification.');
    expect(verification.issues.map((issue) => issue.code)).toEqual([
      'INTEGRITY_MISMATCH',
      'REPLAY_MISMATCH'
    ]);
  });

  it('rejects invalid input and policies explicitly', async () => {
    await expect(
      generateStandaloneKiskadeeTonalFamily({
        seedHex: 'not-a-color',
        tonalProfile: 'muted-darks',
        ...SOURCE_EXACT
      })
    ).rejects.toBeInstanceOf(StandaloneTonalFamilyError);

    await expect(
      generateStandaloneKiskadeeTonalFamily({
        seedHex: '#0b57d0',
        tonalProfile: 'muted-darks',
        lightPolicy: 'adaptive' as 'source-exact',
        darkPolicy: 'source-exact'
      })
    ).rejects.toThrow('source-exact Light and Dark policies only');
  });

  it('keeps the standalone contract free of system and Munsell concepts', async () => {
    const artifact = await generateStandaloneKiskadeeTonalFamily({
      seedHex: '#d300c5',
      tonalProfile: 'balanced',
      ...SOURCE_EXACT
    });
    const serialized = JSON.stringify(artifact);

    expect(serialized).not.toContain('munsell');
    expect(serialized).not.toContain('harmony');
    expect(artifact).not.toHaveProperty('id');
    expect(artifact).not.toHaveProperty('role');
    expect(artifact).not.toHaveProperty('preset');
  });
});
