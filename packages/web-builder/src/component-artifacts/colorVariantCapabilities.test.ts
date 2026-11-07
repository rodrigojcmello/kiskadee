import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveCardSurfaceSource, type Schema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema as fluent } from '../../../presets/src/presets/fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { resolveElementPaletteSources } from '../palettes/resolveElementPaletteSources.ts';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import { mapStyleKeyUsage } from '../phase-2-map-style-key-usage/mapStyleKeyUsage.ts';
import { shortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { generateCssSplit } from '../phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap.ts';
import { buildComponentSurfaceContexts } from '../phase-7-publish-metadata/publishMetadata.ts';
import { writeExtraArtifacts } from '../phase-8-write-extra-artifacts/writeExtraArtifacts.ts';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy.ts';
import { BUTTON_GROUP_BORDER_SUPPRESSION_STYLE_KEY } from './buttonGroupArtifact.ts';
import { buildColorVariantCapabilities } from './colorVariantCapabilities.ts';
import { buildComponentClassMapArtifact } from './componentClassMapArtifacts.ts';
import { publishComponentResources } from './publishComponentResources.ts';

function fixture(): Schema {
  const root = {
    boxColor: {
      neutral: { high: { rest: '#112233', hover: '#223344', selected: { rest: '#334455' } } }
    },
    borderColor: { neutral: { high: { rest: '#445566', pressed: '#00000000' } } }
  };
  return {
    name: 'Shared color variants',
    author: 'Kiskadee',
    version: [1, 0, 0],
    breakpoints: { 'bp:all': 0 },
    components: {
      button: {
        contentSurfaceContext: {
          default: {
            light: {
              onSubtle: { standard: { neutral: { high: { rest: 'onVivid', hover: 'onSubtle' } } } },
              onVivid: {
                standard: { neutral: { high: { rest: 'onVivid', hover: 'onSubtle' } } },
                alternative: { neutral: { high: { rest: 'onSubtle' } } }
              }
            }
          }
        },
        elements: {
          e1: {
            name: 'button',
            decorations: { borderStyle: 'solid' },
            scales: { borderWidth: { 's:md:1': 1 } },
            palettes: {
              default: {
                light: {
                  onSubtle: { standard: structuredClone(root) },
                  onVivid: {
                    standard: structuredClone(root),
                    alternative: {
                      boxColor: {
                        neutral: { high: { rest: '#abcdef', selected: { rest: '#fedcba' } } }
                      }
                    }
                  }
                }
              }
            }
          },
          e2: {
            name: 'label',
            palettes: {
              default: {
                light: {
                  onSubtle: { standard: { textColor: { neutral: { high: { rest: '#ffffff' } } } } },
                  onVivid: { standard: { textColor: { neutral: { high: { rest: '#ffffff' } } } } }
                }
              }
            }
          },
          e6: { name: 'divider', scales: { boxWidth: 1 } }
        }
      }
    }
  } as unknown as Schema;
}
async function compile(schema: Schema) {
  const converted = convertElementSchemaToStyleKeys(schema, DEFAULT_WEB_STYLE_EMISSION_POLICY);
  const usage = mapStyleKeyUsage(converted.styleKeys, {
    additionalStyleKeys: [BUTTON_GROUP_BORDER_SUPPRESSION_STYLE_KEY],
    webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
  });
  const names = shortenCssClassNames(usage);
  const maps = generateClassNamesMapSplit(
    converted.styleKeys,
    names,
    converted.toneMetadataByPalette,
    {
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
    }
  );
  const css = await generateCssSplit(converted.styleKeys, names, {
    forceState: true,
    webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
  });
  return { ...converted, names, maps, css };
}

describe('shared color variant handoff', () => {
  it('does not advertise alternatives synthesized while projecting another component', () => {
    const resolved = resolveCardSurfaceSource(fluent);
    expect(buildColorVariantCapabilities(resolved, 'container')).toBeUndefined();
    expect(
      resolved.components.container!.elements.e1.palettes.default!.light!.onSubtle!.alternative
    ).toBeUndefined();
  });

  it('emits no alternative branch for Standard-only components or isolated palette helpers', async () => {
    const schema = resolveCardSurfaceSource(fluent);
    const result = await compile(schema);
    const containsAlternative = (node: unknown): boolean => {
      if (!node || typeof node !== 'object') return false;
      const element = node as any;
      if (element.c?.s?.a || element.c?.v?.a) return true;
      return Object.values(element).some(containsAlternative);
    };
    for (const palette of Object.values(result.maps.palettes)) {
      for (const [component, map] of Object.entries(palette)) {
        if (component !== 'button' && component !== 'text')
          expect(containsAlternative(map), component).toBe(false);
      }
    }
    expect(containsAlternative(result.maps.palettes['default.light']!.button)).toBe(true);
    expect(containsAlternative(result.maps.palettes['default.light']!.text)).toBe(true);
    const coverage = buildColorVariantCapabilities(schema, 'button', result.maps);
    for (const segment of ['default', 'teams'])
      for (const theme of ['light', 'dark', 'darker']) {
        const palette = coverage!.alternative![`${segment}.${theme}`]!;
        expect(palette.onVivid!.neutral).toEqual(['high']);
        expect(palette.onSubtle?.neutral).toBeUndefined();
      }
    const helper = resolveElementPaletteSources(fixture().components.button!.elements.e2!, {});
    expect(helper.palettes!.default!.light!.onVivid!.alternative).toBeUndefined();
  });

  it('does not activate inherited alternatives in another structural variant, mode or context', async () => {
    const schema = fixture();
    const elements = schema.components.button!.elements;
    const standard = structuredClone(elements);
    delete standard.e1!.palettes!.default!.light!.onVivid!.alternative;
    schema.components = {
      select: {
        variants: {
          standard: { modes: { outline: { elements }, filled: { elements: standard } } },
          multi: { modes: { outline: { elements: standard } } }
        }
      }
    } as unknown as Schema['components'];
    const result = await compile(schema);
    const map = result.maps.palettes['default.light']!.select as any;
    expect(map.standard.outline.e2.c.v.a).toEqual(map.standard.outline.e2.c.v.s);
    expect(map.standard.outline.e1.c.s.a).toBeUndefined();
    expect(map.standard.filled.e1.c.v.a).toBeUndefined();
    expect(map.multi.outline.e1.c.v.a).toBeUndefined();
  });

  it('publishes alternatives authored by a referenced Separator source', async () => {
    const schema = fixture();
    schema.global = {
      separators: {
        profiles: {
          body: {
            scales: { boxWidth: 1 },
            palettes: {
              default: {
                light: {
                  onSubtle: {
                    standard: { boxColor: { neutral: { medium: { rest: '#112233' } } } },
                    alternative: { boxColor: { neutral: { medium: { rest: '#abcdef' } } } }
                  }
                }
              }
            }
          }
        }
      }
    };
    schema.components = {
      separator: {
        elements: {
          e1: {
            name: 'divider',
            separator: { 's:all': 'body' }
          }
        }
      }
    };
    const result = await compile(schema);
    const map = result.maps.palettes['default.light']!.separator as any;
    expect(map.e1.c.s.a.neutral.m).not.toEqual(map.e1.c.s.s.neutral.m);
    expect(map.e1.c.v).toBeUndefined();
    expect(buildColorVariantCapabilities(schema, 'separator', result.maps)).toEqual({
      alternative: {
        'default.light': { onSubtle: { neutral: ['medium'] } }
      }
    });
  });

  it('inherits complete leaves without leaking standard states into authored alternative leaves', () => {
    const element = fixture().components.button!.elements.e1!;
    const palettes = resolveElementPaletteSources(element, {}).palettes!;
    const context = palettes.default!.light!.onVivid!;
    expect(context.alternative!.boxColor!.neutral!.high).toEqual({
      rest: '#abcdef',
      selected: { rest: '#fedcba' }
    });
    expect(context.alternative!.borderColor).toEqual(context.standard.borderColor);
    expect(palettes.default!.light!.onSubtle!.alternative).toBeUndefined();
    expect(element.palettes!.default!.light!.onSubtle!.alternative).toBeUndefined();
  });

  it('publishes only positively authored coordinates after effective inheritance and output validation', async () => {
    const schema = fixture();
    const result = await compile(schema);
    expect(buildColorVariantCapabilities(schema, 'button', result.maps)).toEqual({
      alternative: {
        'default.light': { onVivid: { neutral: ['high'] } }
      }
    });
    expect(
      buildComponentSurfaceContexts(schema, 'button')!['default.light']!.onVivid!.state!.neutral!
        .high
    ).toHaveProperty('hover');
    delete (result.maps.palettes['default.light']!.button as any).e2.c.v.a.neutral.h;
    expect(buildColorVariantCapabilities(schema, 'button', result.maps)).toBeUndefined();
  });

  it('rejects incomplete effective output and paint without borrowing another context', () => {
    const schema = fixture();
    const output = schema.components.button!.contentSurfaceContext!.default!.light!.onVivid!;
    delete (output.alternative!.neutral!.high as any).rest;
    expect(buildColorVariantCapabilities(schema, 'button')).toBeUndefined();
    output.alternative!.neutral!.high!.rest = 'onSubtle';
    const colors = schema.components.button!.elements.e1!.palettes!.default!.light!.onVivid!;
    delete (colors.alternative!.boxColor!.neutral!.high as any).rest;
    expect(buildColorVariantCapabilities(schema, 'button')).toBeUndefined();
  });

  it('deduplicates equal CSS while separating emphasis metadata, High Rest and Group per variant', async () => {
    const result = await compile(fixture());
    const map = result.maps.palettes['default.light']!.button as any;
    expect(map.e2.c.v.a).toEqual(map.e2.c.v.s);
    expect(map.e1.c.s.a).toBeUndefined();
    expect(map.selectionRest.e1.c.v.a.neutral.h).toContain(result.names['boxColor__#abcdef@@i']);
    expect(map.selectionRest.e1.c.v.a.neutral.h).not.toContain(
      result.names['boxColor--selected:rest__#fedcba@@i']
    );
    expect(map.group.frame.c.v.a).toEqual(map.group.frame.c.v.s);
    expect(map.group.frameOmissions.v.a.neutral.h).toEqual({ pressed: true });
    expect(map).not.toHaveProperty('alternativeGroup');
    expect(map).not.toHaveProperty('alternativeSelectionRest');
    expect(Object.keys(result.names).filter((key) => key === 'textColor__#ffffff')).toHaveLength(1);
    expect(result.toneMetadataByPalette.has('default.light.onVivid.standard')).toBe(true);
    expect(result.toneMetadataByPalette.has('default.light.onVivid.alternative')).toBe(true);
    expect(JSON.stringify(result.names)).not.toContain('alternative');
  });

  it('scopes shared CSS identity to the emphasis authored in each variant', async () => {
    const schema = fixture();
    schema.components.button!.elements.e1!.palettes = {
      default: {
        light: {
          onSubtle: {
            standard: {
              boxColor: {
                neutral: {
                  high: { rest: '#ffffff' },
                  medium: { rest: '#000000' }
                }
              }
            },
            alternative: {
              boxColor: {
                neutral: {
                  high: { rest: '#000000' },
                  medium: { rest: '#ffffff' }
                }
              }
            }
          }
        }
      }
    };
    const result = await compile(schema);
    const map = (result.maps.palettes['default.light']!.button as any).e1.c.s;
    expect(map.s.neutral.h).toBe(map.a.neutral.m);
    expect(map.s.neutral.m).toBe(map.a.neutral.h);
    expect(map.s.neutral.h).not.toBe(map.a.neutral.h);
  });

  it('keeps identical standard rules when an alternative is added', async () => {
    const schema = fixture();
    const baseline = structuredClone(schema);
    delete baseline.components.button!.elements.e1!.palettes!.default!.light!.onVivid!.alternative;
    const standard = await compile(baseline);
    const changed = await compile(schema);
    const leaf = (result: Awaited<ReturnType<typeof compile>>) =>
      (result.styleKeys.button as any).e1.palettes.default.light.onVivid.standard;
    expect(leaf(changed)).toEqual(leaf(standard));
  });

  it('publishes complete coverage in the first metadata fetch and all v3 resource envelopes', async () => {
    const schema = fixture();
    const dir = await mkdtemp(join(tmpdir(), 'kiskadee-color-variant-'));
    const write = (name: string, value: unknown) =>
      writeFile(join(dir, name), typeof value === 'string' ? value : JSON.stringify(value));
    try {
      const result = await compile(schema);
      await writeExtraArtifacts({ schema, outDirSlug: dir });
      await write('manifest.json', {
        formatVersion: 3,
        themes: { default: ['light'] },
        components: {
          button: {
            colorVariants: buildColorVariantCapabilities(schema, 'button', result.maps),
            surfaceContexts: buildComponentSurfaceContexts(schema, 'button')
          }
        }
      });
      await write('core.kiskadee.json', result.maps.core);
      await write('core.kiskadee.css', result.css.coreCss);
      await write('default.light.kiskadee.json', result.maps.palettes['default.light']);
      await write('default.light.kiskadee.css', result.css.palettes['default.light']);
      await publishComponentResources(dir, schema);
      const metadata = JSON.parse(
        await readFile(join(dir, 'components/button.kiskadee.json'), 'utf8')
      );
      expect(metadata.formatVersion).toBe(3);
      expect(metadata.capabilities.colorVariants.alternative['default.light']).toEqual({
        onVivid: { neutral: ['high'] }
      });
      const resource = JSON.parse(
        await readFile(join(dir, metadata.resources.palettes['default.light']), 'utf8')
      );
      expect(resource.formatVersion).toBe(3);
      expect(
        resource.config.contentSurfaceContext.default.light.onSubtle.alternative
      ).toBeUndefined();
      expect(
        resource.config.contentSurfaceContext.default.light.onVivid.alternative.neutral.high
      ).toEqual({ rest: 'onSubtle' });
      expect(JSON.parse(await readFile(join(dir, 'manifest.json'), 'utf8')).formatVersion).toBe(3);
      expect(buildComponentClassMapArtifact('button', result.maps.core.button).formatVersion).toBe(
        3
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
