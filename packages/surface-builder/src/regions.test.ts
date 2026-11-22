import type { ContentSurfaceContextValue, Schema } from '@kiskadee/core';
import { schema as fluent } from '@kiskadee/presets/src/presets/fluent-2-microsoft/index.ts';
import { schema as material } from '@kiskadee/presets/src/presets/material-3-google/index.ts';
import { describe, expect, it } from 'vitest';
import {
  buildSurfaceContextsArtifact,
  materializeSurfaceContexts,
  validateSurfaceContextsArtifact
} from './artifact.ts';
import type { RegionSurface, SurfaceDiagnostic } from './region-types.ts';
import { compileSurfaceRegions } from './regions.ts';

const preset = { schema: fluent, key: 'fluent-2-microsoft', schemaPath: 'test' };

describe('region-resolved portable surfaces', () => {
  it('distinguishes an opaque selected chip, a transparent resting chip, and its sibling remove action', () => {
    const { components } = buildSurfaceContextsArtifact(preset);
    const regions = components.chip!.regions!;
    for (const context of ['onSubtle', 'onVivid'] as const) {
      const primary = regions.e2!.output.default!.light![context]!.standard.primary!;
      expect(primary.medium?.rest).toBe('onSubtle');
      expect(primary.medium?.selected ?? primary.medium?.rest).toBe('onSubtle');
      expect(primary.lowest).toMatchObject({ rest: 'inherit', selected: 'onSubtle' });
    }
    expect(regions.e5?.output.default?.light?.onSubtle?.standard.primary?.high?.rest).toBe(
      'onVivid'
    );
    expect(regions.e5).not.toHaveProperty('against');
  });

  it('keeps distinct effective parent coordinates when their colors have the same context', () => {
    const colors = (boxColor: object) => ({
      default: { light: { onSubtle: { standard: { boxColor: { neutral: boxColor } } } } }
    });
    const schema = {
      components: {
        textField: {
          variants: {
            standard: {
              modes: {
                borderless: {
                  elements: {
                    e3: {
                      palettes: colors({
                        high: { rest: '#aaa', disabled: { ref: '#ccc' } },
                        medium: { rest: '#ccc' }
                      })
                    },
                    e8: {
                      palettes: colors({ medium: { rest: '#0003' }, lowest: { rest: '#fff0' } })
                    }
                  }
                }
              }
            }
          }
        }
      },
      themeTokens: { palettes: { default: { light: { background: '#fff' } } } }
    } as unknown as Schema;
    const diagnostics: SurfaceDiagnostic[] = [];
    const regions = compileSurfaceRegions(schema, 'textField', diagnostics).variants!.standard!
      .modes!.borderless!.regions!;
    expect(diagnostics).toEqual([]);
    expect(regions.e3!.output.default!.light!.onSubtle!.standard.neutral).toEqual({
      high: { rest: 'onSubtle' },
      medium: { rest: 'onSubtle' }
    });
    function read(
      region: RegionSurface,
      parentEmphasis: string,
      parentState: string,
      childEmphasis: string
    ): ContentSurfaceContextValue | undefined {
      const key = JSON.stringify(['onSubtle', 'standard', 'neutral', parentEmphasis, parentState]);
      const leaf = (map: RegionSurface['output'] | undefined) =>
        map?.default?.light?.onSubtle?.standard.neutral?.[childEmphasis as 'lowest' | 'medium'];
      return (leaf(region.against?.[key]) ?? leaf(region.output))?.rest;
    }
    // Over #aaa the translucent black produces #888; over #ccc it produces #a3a3a3.
    expect(read(regions.e8!, 'high', 'rest', 'medium')).toBe('onVivid');
    expect(read(regions.e8!, 'high', 'disabled', 'medium')).toBe('onSubtle');
    expect(read(regions.e8!, 'medium', 'rest', 'medium')).toBe('onSubtle');
    // An unpainted/missing parent recipe uses the canonical white, not an arbitrary painted sibling.
    expect(read(regions.e8!, 'lowest', 'rest', 'medium')).toBe('onSubtle');
    expect(read(regions.e8!, 'high', 'rest', 'lowest')).toBe('inherit');
  });

  it('can classify a neutral opaque gradient wholly on one side of the cutoff', () => {
    const schema = structuredClone(fluent);
    schema.components.chip!.elements.e2.palettes!.default!.light!.onSubtle.standard.boxColor!
      .primary!.medium!.rest = {
      kind: 'linear',
      angle: 90,
      stops: [
        { color: '#111', position: 0 },
        { color: '#555', position: 100 }
      ]
    };
    const artifact = buildSurfaceContextsArtifact({ ...preset, schema });
    expect(
      artifact.components.chip?.regions?.e2?.output.default?.light?.onSubtle?.standard.primary
        ?.medium?.rest
    ).toBe('onVivid');
    expect(artifact.diagnostics).toBeUndefined();
  });

  it('preserves the prior semantic output and exact source path for unresolved paint', () => {
    const schema = structuredClone(fluent);
    schema.components.chip!.elements.e2.palettes!.default!.light!.onSubtle.standard.boxColor!
      .primary!.medium!.rest = 'var(--chip-fill)';
    schema.components.chip!.contentSurfaceContext = {
      default: { light: { onSubtle: { standard: { primary: { medium: { rest: 'onVivid' } } } } } }
    };
    const artifact = buildSurfaceContextsArtifact({ ...preset, schema });
    expect(
      artifact.components.chip?.regions?.e2?.output.default?.light?.onSubtle?.standard.primary
        ?.medium?.rest
    ).toBe('onVivid');
    expect(artifact.diagnostics).toContainEqual({
      path: 'components.chip.elements.e2.palettes.default.light.onSubtle.standard.boxColor.primary.medium.rest',
      reason: 'runtime-color'
    });
    expect(
      materializeSurfaceContexts(schema, artifact).components.chip?.contentSurfaceContext?.default
        ?.light?.onSubtle?.standard.primary?.medium?.rest
    ).toBe('onVivid');
  });

  it('uses the border paint for the interior of the segmented Tabs bar', () => {
    const bar = buildSurfaceContextsArtifact({
      key: 'material',
      schema: material,
      schemaPath: 'test'
    }).components.tabs?.variants?.segmented?.regions?.e1;
    expect(bar?.output.default?.light?.onSubtle?.standard.neutral?.medium?.rest).toBe('onVivid');
  });

  it('preserves a legacy map for a custom segment named derive', () => {
    const schema = {
      components: {
        chip: {
          elements: {
            e2: {
              palettes: {
                derive: {
                  light: {
                    onSubtle: {
                      standard: { boxColor: { neutral: { medium: { rest: 'var(--chip)' } } } }
                    }
                  }
                }
              }
            }
          },
          contentSurfaceContext: {
            derive: {
              light: { onSubtle: { standard: { neutral: { medium: { rest: 'onVivid' } } } } }
            }
          }
        }
      }
    } as unknown as Schema<string>;
    const chip = compileSurfaceRegions(schema, 'chip', []);
    expect(chip.regions?.e2?.output.derive?.light?.onSubtle?.standard.neutral?.medium?.rest).toBe(
      'onVivid'
    );
  });

  it.each([
    'bad-json',
    '["onSubtle","standard","neutral",["medium"],"rest"]',
    '["onSubtle","standard","neutral","medium","hover"]'
  ])('rejects invalid parent coordinates: %s', (key) => {
    const artifact = buildSurfaceContextsArtifact(preset);
    const region =
      artifact.components.textField!.variants!.standard!.modes!.borderless!.regions!.e8!;
    region.against = { [key]: region.output };
    expect(() => validateSurfaceContextsArtifact(artifact, preset)).toThrow(
      'invalid parent coordinate'
    );
  });

  it('rejects missing and foreign region IDs at the portable boundary', () => {
    const artifact = buildSurfaceContextsArtifact(preset);
    const regions = artifact.components.chip!.regions!;
    const remove = regions.e5!;
    delete regions.e5;
    expect(() => validateSurfaceContextsArtifact(artifact, preset)).toThrow(
      'components.chip.regions.e5.output'
    );
    regions.e5 = remove;
    regions.e6 = remove;
    expect(() => validateSurfaceContextsArtifact(artifact, preset)).toThrow(
      'unknown surface region'
    );
  });
});
