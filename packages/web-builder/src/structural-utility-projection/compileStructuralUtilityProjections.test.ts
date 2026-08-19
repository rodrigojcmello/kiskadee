import type {
  ClassNameByElementJSON,
  ComponentStyleKeyMap,
  StandardScaleProperty
} from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import type { ToneMetadataByPalette } from '../phase-1-convert-schema-to-style-keys/colors/convertElementColorsToStyleKeys.ts';
import { generateCssSplit } from '../phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap.ts';
import { resolveEmittedScaleCssVar } from '../style-emission/emitted-scale-css-vars.ts';
import type { WebStyleEmissionPolicy } from '../style-emission/web-build-policy.ts';
import type {
  StructuralUtilityProjectionRule,
  WebStructuralUtilityProjectionRegistry
} from './web-structural-utility-projection-registry.ts';

const emptyToneMetadata = new Map() as ToneMetadataByPalette;

const sourceLocation = {
  component: 'progress',
  element: 'e2'
} as const;

const targetLocation = {
  component: 'progress',
  element: 'e1'
} as const;

const tokenWidthEmission: WebStyleEmissionPolicy = {
  components: {
    progress: {
      elements: {
        e2: { boxWidthEmission: 'token' }
      }
    }
  }
};

const baseStyleKeys = {
  progress: {
    e1: {
      scales: {
        's:md:1': ['boxHeight__40']
      }
    },
    e2: {
      scales: {
        's:md:1': ['boxWidth__1', 'boxHeight__20']
      }
    }
  }
} as unknown as ComponentStyleKeyMap;

const baseShortenMap = {
  'boxWidth__1@@t': 'width-token',
  boxHeight__20: 'source-height',
  boxHeight__40: 'target-height'
};

function projectionRule(
  overrides: Partial<StructuralUtilityProjectionRule> = {}
): StructuralUtilityProjectionRule {
  return {
    id: 'test-width',
    artifactKey: 'tw',
    source: {
      ...sourceLocation,
      channel: 'scales',
      property: 'boxWidth'
    },
    target: targetLocation,
    retainSource: true,
    ...overrides
  };
}

function registry(
  ...projections: StructuralUtilityProjectionRule[]
): WebStructuralUtilityProjectionRegistry {
  return { projections };
}

function generate(options?: {
  styleKeys?: ComponentStyleKeyMap;
  projectionRegistry?: WebStructuralUtilityProjectionRegistry;
  emissionPolicy?: WebStyleEmissionPolicy;
  shortenMap?: Record<string, string>;
  collapseDirectIntoMirrored?: boolean;
}) {
  return generateClassNamesMapSplit(
    options?.styleKeys ?? baseStyleKeys,
    options?.shortenMap ?? baseShortenMap,
    emptyToneMetadata,
    {
      webStyleEmissionPolicy: options?.emissionPolicy ?? tokenWidthEmission,
      structuralUtilityProjectionRegistry: options?.projectionRegistry,
      collapseDirectIntoMirrored: options?.collapseDirectIntoMirrored
    }
  );
}

describe('Structural Utility Projection', () => {
  it('uses one explicit emitted custom-property identity for every eligible standard scale', () => {
    const emittedCssVarByProperty = {
      textSize: undefined,
      textHeight: undefined,
      paddingTop: '--k-pdt',
      paddingRight: '--k-pdr',
      paddingBottom: '--k-pdb',
      paddingLeft: '--k-pdl',
      marginTop: '--k-mgt',
      marginRight: '--k-mgr',
      marginBottom: '--k-mgb',
      marginLeft: '--k-mgl',
      boxHeight: '--k-bxh',
      boxWidth: '--k-bxw',
      borderWidth: '--k-bdw'
    } satisfies Record<StandardScaleProperty, string | undefined>;

    for (const property of Object.keys(emittedCssVarByProperty) as StandardScaleProperty[]) {
      expect(resolveEmittedScaleCssVar(property)).toBe(emittedCssVarByProperty[property]);
    }
  });

  it('keeps the default registry empty', () => {
    const out = generate();
    const progress = out.core.progress as Record<string, ClassNameByElementJSON>;

    expect(progress.e1.p).toBeUndefined();
    expect(progress.e2.s?.['md:1']).toBe('width-token source-height');
  });

  it('copies one token-only utility into a named target projection when retainSource is true', () => {
    const out = generate({ projectionRegistry: registry(projectionRule()) });
    const progress = out.core.progress as Record<string, ClassNameByElementJSON>;

    expect(progress.e1.p?.tw).toEqual({ 'md:1': 'width-token' });
    expect(progress.e2.s?.['md:1']).toBe('width-token source-height');
  });

  it('moves only the projected utility out of the source scale bucket when retainSource is false', () => {
    const out = generate({
      projectionRegistry: registry(projectionRule({ retainSource: false }))
    });
    const progress = out.core.progress as Record<string, ClassNameByElementJSON>;

    expect(progress.e1.p?.tw).toEqual({ 'md:1': 'width-token' });
    expect(progress.e2.s?.['md:1']).toBe('source-height');
  });

  it('preserves base and breakpoint utilities under the source scale key', () => {
    const responsiveStyleKeys = {
      progress: {
        e1: { scales: { 's:md:1': ['boxHeight__40'] } },
        e2: {
          scales: {
            's:all': ['boxWidth__1'],
            's:md:1': ['boxWidth++s:md:1::bp:lg:1__2']
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const out = generate({
      styleKeys: responsiveStyleKeys,
      projectionRegistry: registry(projectionRule()),
      shortenMap: {
        'boxWidth__1@@t': 'width-base',
        'boxWidth++s:md:1::bp:lg:1__2@@t': 'width-large',
        boxHeight__40: 'target-height'
      }
    });
    const progress = out.core.progress as Record<string, ClassNameByElementJSON>;

    expect(progress.e1.p?.tw).toEqual({ all: 'width-base', 'md:1': 'width-large' });
  });

  it('projects utilities inside one explicit variant and mode branch', () => {
    const nestedStyleKeys = {
      slider: {
        standard: {
          base: {
            e1: { scales: { 's:md:1': ['boxHeight__40'] } },
            e2: { scales: { 's:md:1': ['boxWidth__1'] } }
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;
    const nestedEmission: WebStyleEmissionPolicy = {
      components: {
        slider: {
          variants: {
            standard: {
              elements: { e2: { boxWidthEmission: 'token' } }
            }
          }
        }
      }
    };
    const nestedRule = projectionRule({
      source: {
        component: 'slider',
        variant: 'standard',
        mode: 'base',
        element: 'e2',
        channel: 'scales',
        property: 'boxWidth'
      },
      target: {
        component: 'slider',
        variant: 'standard',
        mode: 'base',
        element: 'e1'
      }
    });
    const out = generate({
      styleKeys: nestedStyleKeys,
      projectionRegistry: registry(nestedRule),
      emissionPolicy: nestedEmission
    });
    const slider = out.core.slider as Record<
      string,
      Record<string, Record<string, ClassNameByElementJSON>>
    >;

    expect(slider.standard.base.e1.p?.tw).toEqual({ 'md:1': 'width-token' });
  });

  it('rejects source and target locations from different variant or mode branches', () => {
    expect(() =>
      generate({
        projectionRegistry: registry(
          projectionRule({
            source: {
              component: 'slider',
              variant: 'standard',
              mode: 'base',
              element: 'e2',
              channel: 'scales',
              property: 'boxWidth'
            },
            target: {
              component: 'slider',
              variant: 'standard',
              mode: 'compact',
              element: 'e1'
            }
          })
        )
      })
    ).toThrow(/must use the same variant and mode branch/);
  });

  it('omits a projection when its optional source is absent', () => {
    const out = generate({
      projectionRegistry: registry(
        projectionRule({
          source: {
            component: 'progress',
            element: 'e9',
            channel: 'scales',
            property: 'boxWidth',
            optional: true
          }
        })
      )
    });
    const progress = out.core.progress as Record<string, ClassNameByElementJSON>;

    expect(progress.e1.p).toBeUndefined();
  });

  it('omits a projection when its optional source does not author the requested property', () => {
    const out = generate({
      projectionRegistry: registry(
        projectionRule({
          source: {
            ...sourceLocation,
            channel: 'scales',
            property: 'marginLeft',
            optional: true
          }
        })
      )
    });
    const progress = out.core.progress as Record<string, ClassNameByElementJSON>;

    expect(progress.e1.p).toBeUndefined();
  });

  it('rejects a missing required target after resolving the source', () => {
    expect(() =>
      generate({
        projectionRegistry: registry(
          projectionRule({ target: { component: 'progress', element: 'e9' } })
        )
      })
    ).toThrow(/target "progress\.e9" does not exist/);
  });

  it('rejects source properties that do not use token emission', () => {
    expect(() =>
      generate({
        projectionRegistry: registry(projectionRule()),
        emissionPolicy: { components: {} }
      })
    ).toThrow(/must use token emission, received "direct"/);
  });

  it.each([
    [projectionRule({ id: 'Invalid Id' }), /id must use lowercase kebab-case/],
    [projectionRule({ artifactKey: 'wide' }), /artifactKey must contain 1-3/],
    [
      projectionRule({
        source: {
          component: 'progress',
          element: 'divider',
          channel: 'scales',
          property: 'boxWidth'
        }
      }),
      /source element "divider" must use the e<n> format/
    ],
    [
      projectionRule({ target: { component: 'progress', element: 'root' } }),
      /target element "root" must use the e<n> format/
    ],
    [
      projectionRule({
        target: { component: 'progress', mode: 'compact', element: 'e1' }
      }),
      /target mode requires a variant/
    ]
  ])('rejects malformed registry identities and locations', (rule, expectedError) => {
    expect(() => generate({ projectionRegistry: registry(rule) })).toThrow(expectedError);
  });

  it('rejects duplicate projection ids and duplicate target artifact keys', () => {
    expect(() =>
      generate({
        projectionRegistry: registry(
          projectionRule(),
          projectionRule({
            source: { ...sourceLocation, channel: 'scales', property: 'boxHeight' }
          })
        )
      })
    ).toThrow(/duplicate projection id|duplicate artifactKey/);
  });

  it('rejects two artifact keys that project the same property into one target', () => {
    expect(() =>
      generate({
        projectionRegistry: registry(
          projectionRule({ id: 'first-width', artifactKey: 'a' }),
          projectionRule({ id: 'second-width', artifactKey: 'b' })
        )
      })
    ).toThrow(/already receives property "boxWidth" from another projection/);
  });

  it('rejects cross-component projections', () => {
    expect(() =>
      generate({
        projectionRegistry: registry(
          projectionRule({ target: { component: 'card', element: 'e1' } })
        )
      })
    ).toThrow(/cross-component projection/);
  });

  it('rejects projection chains', () => {
    expect(() =>
      generate({
        projectionRegistry: registry(
          projectionRule({
            id: 'first-width',
            artifactKey: 'a',
            source: {
              component: 'progress',
              element: 'e3',
              channel: 'scales',
              property: 'boxWidth'
            },
            target: sourceLocation
          }),
          projectionRule({ id: 'second-width', artifactKey: 'b' })
        )
      })
    ).toThrow(/projection chains are not supported/);
  });

  it('rejects a target that already emits the projected CSS custom property', () => {
    const conflictingStyleKeys = {
      progress: {
        e1: { scales: { 's:md:1': ['boxWidth__40'] } },
        e2: { scales: { 's:md:1': ['boxWidth__1'] } }
      }
    } as unknown as ComponentStyleKeyMap;
    const conflictingEmission: WebStyleEmissionPolicy = {
      components: {
        progress: {
          elements: {
            e1: { boxWidthEmission: 'mirrored' },
            e2: { boxWidthEmission: 'token' }
          }
        }
      }
    };

    expect(() =>
      generate({
        styleKeys: conflictingStyleKeys,
        projectionRegistry: registry(projectionRule()),
        emissionPolicy: conflictingEmission,
        shortenMap: {
          'boxWidth__1@@t': 'width-token',
          'boxWidth__40@@m': 'target-width'
        }
      })
    ).toThrow(/already emits "--k-bxw" from scale property "boxWidth"/);
  });

  it('does not report a collision when the target property emits no custom property', () => {
    const directTargetStyleKeys = {
      progress: {
        e1: { scales: { 's:md:1': ['boxWidth__40'] } },
        e2: { scales: { 's:md:1': ['boxWidth__1'] } }
      }
    } as unknown as ComponentStyleKeyMap;
    const out = generate({
      styleKeys: directTargetStyleKeys,
      projectionRegistry: registry(projectionRule()),
      shortenMap: {
        'boxWidth__1@@t': 'width-token',
        boxWidth__40: 'target-width'
      }
    });
    const progress = out.core.progress as Record<string, ClassNameByElementJSON>;

    expect(progress.e1.s?.['md:1']).toBe('target-width');
    expect(progress.e1.p?.tw).toEqual({ 'md:1': 'width-token' });
  });

  it('rejects a target whose direct utility is canonically collapsed into mirrored emission', () => {
    const directTargetStyleKeys = {
      progress: {
        e1: { scales: { 's:md:1': ['boxWidth__40'] } },
        e2: { scales: { 's:md:1': ['boxWidth__1'] } }
      }
    } as unknown as ComponentStyleKeyMap;

    expect(() =>
      generate({
        styleKeys: directTargetStyleKeys,
        projectionRegistry: registry(projectionRule()),
        shortenMap: {
          'boxWidth__1@@t': 'width-token',
          'boxWidth__40@@m': 'target-width-mirrored'
        },
        collapseDirectIntoMirrored: true
      })
    ).toThrow(/already emits "--k-bxw" from scale property "boxWidth"/);
  });

  it('reuses the source atomic utility without adding projection CSS', async () => {
    const out = generate({ projectionRegistry: registry(projectionRule()) });
    const progress = out.core.progress as Record<string, ClassNameByElementJSON>;
    const css = await generateCssSplit(baseStyleKeys, baseShortenMap, {
      forceState: true,
      webStyleEmissionPolicy: tokenWidthEmission,
      breakpoints: { 'bp:all': 0 }
    });

    expect(progress.e1.p?.tw?.['md:1']).toBe('width-token');
    expect(progress.e2.s?.['md:1']?.split(' ')).toContain('width-token');
    expect(css.coreCss.match(/--k-bxw:\s*1px/g)).toHaveLength(1);
    expect(css.coreCss).not.toContain('tw');
  });
});
