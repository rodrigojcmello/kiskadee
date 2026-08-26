export const STYLE_EMISSION_MODE = {
  direct: 'direct',
  mirrored: 'mirrored',
  token: 'token',
  interpolated: 'interpolated',
  compensated: 'compensated'
} as const;

type DirectEmission = typeof STYLE_EMISSION_MODE.direct;
type MirroredEmission = typeof STYLE_EMISSION_MODE.mirrored;
type TokenEmission = typeof STYLE_EMISSION_MODE.token;
type InterpolatedEmission = typeof STYLE_EMISSION_MODE.interpolated;
type CompensatedEmission = typeof STYLE_EMISSION_MODE.compensated;

type DirectOrMirroredEmission = DirectEmission | MirroredEmission;
type DirectOrTokenEmission = DirectEmission | TokenEmission;
type DirectMirroredOrTokenEmission = DirectOrMirroredEmission | TokenEmission;
type BoxColorEmission = DirectMirroredOrTokenEmission;
type BoxColorGradientEmission = DirectEmission | InterpolatedEmission;
type TextColorEmission = DirectOrMirroredEmission;

export type BorderWidthEmission = DirectMirroredOrTokenEmission;
export type BorderRadiusEmission = DirectMirroredOrTokenEmission;
export type BorderColorEmission = DirectMirroredOrTokenEmission;
export type BoxWidthEmission = DirectMirroredOrTokenEmission;
export type BoxHeightEmission = DirectMirroredOrTokenEmission;
export type MarginEmission = DirectMirroredOrTokenEmission;
export type PaddingEmission = DirectMirroredOrTokenEmission | CompensatedEmission;
export type ShadowEmission = DirectOrTokenEmission;

export type ElementStyleEmissionPolicy = {
  boxColorEmission?: BoxColorEmission;
  boxColorGradientEmission?: BoxColorGradientEmission;
  selectedBoxColorGateClass?: string;
  textColorEmission?: TextColorEmission;
  borderWidthEmission?: BorderWidthEmission;
  borderRadiusEmission?: BorderRadiusEmission;
  borderColorEmission?: BorderColorEmission;
  boxWidthEmission?: BoxWidthEmission;
  boxHeightEmission?: BoxHeightEmission;
  marginTopEmission?: MarginEmission;
  marginRightEmission?: MarginEmission;
  marginBottomEmission?: MarginEmission;
  marginLeftEmission?: MarginEmission;
  paddingEmission?: PaddingEmission;
  paddingLeftEmission?: PaddingEmission;
  paddingRightEmission?: PaddingEmission;
  shadowEmission?: ShadowEmission;
};

export type ResolvedElementStyleEmissionPolicy = {
  boxColorEmission?: BoxColorEmission;
  boxColorGradientEmission?: BoxColorGradientEmission;
  selectedBoxColorGateClass?: string;
  textColorEmission?: TextColorEmission;
  borderWidthEmission: BorderWidthEmission;
  borderRadiusEmission: BorderRadiusEmission;
  borderColorEmission: BorderColorEmission;
  boxWidthEmission?: BoxWidthEmission;
  boxHeightEmission?: BoxHeightEmission;
  marginTopEmission?: MarginEmission;
  marginRightEmission?: MarginEmission;
  marginBottomEmission?: MarginEmission;
  marginLeftEmission?: MarginEmission;
  paddingEmission: PaddingEmission;
  paddingLeftEmission?: PaddingEmission;
  paddingRightEmission?: PaddingEmission;
  shadowEmission: ShadowEmission;
};

export type VariantStyleEmissionPolicy = {
  elements?: Record<string, ElementStyleEmissionPolicy>;
};

export type ComponentStyleEmissionPolicy = {
  // Legacy shape: component-wide element emission without variant isolation.
  // New work should prefer `variants.<name>.elements`.
  // This branch stays temporarily for legacy coverage and should be removed after that review.
  elements?: Record<string, ElementStyleEmissionPolicy>;
  variants?: Record<string, VariantStyleEmissionPolicy>;
};

export type WebStyleEmissionPolicy = {
  components?: Record<string, ComponentStyleEmissionPolicy>;
};

const separatorThicknessEmission = {
  boxWidthEmission: 'token'
} as const satisfies ElementStyleEmissionPolicy;

export const DEFAULT_WEB_STYLE_EMISSION_POLICY: WebStyleEmissionPolicy = {
  components: {
    badge: {
      elements: {
        e1: {
          boxHeightEmission: 'token'
        },
        e3: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token'
        },
        e4: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token'
        },
        e6: {
          borderWidthEmission: 'token'
        }
      }
    },
    bottomSheet: {
      elements: {
        e3: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token'
        },
        e6: {
          paddingEmission: 'token'
        },
        e7: {
          paddingLeftEmission: 'token',
          paddingRightEmission: 'token'
        },
        e8: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token',
          paddingRightEmission: 'token'
        },
        e11: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token',
          paddingLeftEmission: 'token'
        },
        e12: separatorThicknessEmission,
        e13: {
          paddingLeftEmission: 'token',
          paddingRightEmission: 'token'
        },
        e15: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token',
          paddingRightEmission: 'token'
        }
      }
    },
    button: {
      elements: {
        e1: {
          boxColorGradientEmission: 'interpolated',
          borderRadiusEmission: 'mirrored',
          borderWidthEmission: 'mirrored',
          paddingEmission: 'compensated'
        },
        e3: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token',
          paddingRightEmission: 'token'
        },
        e5: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token',
          paddingRightEmission: 'token'
        },
        e6: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token'
        },
        e7: {
          paddingLeftEmission: 'token',
          paddingRightEmission: 'token'
        }
      }
    },
    chip: {
      elements: {
        e4: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token'
        },
        e6: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token'
        }
      }
    },
    dropdown: {
      elements: {
        e1: {
          paddingEmission: 'mirrored'
        },
        e2: {
          paddingLeftEmission: 'token',
          paddingRightEmission: 'token',
          selectedBoxColorGateClass: 'k-ddn-sbg'
        },
        e3: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token',
          paddingRightEmission: 'token'
        },
        e4: {
          paddingLeftEmission: 'token',
          paddingRightEmission: 'token'
        },
        e5: {
          paddingLeftEmission: 'token',
          paddingRightEmission: 'token'
        },
        e6: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token',
          paddingLeftEmission: 'token'
        },
        e7: separatorThicknessEmission,
        e8: {
          paddingLeftEmission: 'token',
          paddingRightEmission: 'token'
        },
        e9: {
          marginLeftEmission: 'token'
        },
        e10: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token',
          paddingRightEmission: 'token'
        },
        e11: {
          boxHeightEmission: 'token',
          boxWidthEmission: 'token'
        }
      }
    },
    separator: {
      elements: {
        e1: separatorThicknessEmission
      }
    },
    textField: {
      elements: {
        e2: {
          marginLeftEmission: 'mirrored'
        },
        e3: {
          boxColorEmission: 'mirrored',
          textColorEmission: 'mirrored',
          boxHeightEmission: 'token',
          borderWidthEmission: 'token',
          borderColorEmission: 'token'
        },
        e6: {
          boxColorEmission: 'token'
        }
      }
    },
    switch: {
      variants: {
        standard: {
          elements: {
            e2: {
              borderWidthEmission: 'mirrored',
              paddingEmission: 'compensated'
            },
            e3: {
              boxWidthEmission: 'mirrored'
            }
          }
        }
      }
    },
    slider: {
      variants: {
        standard: {
          elements: {
            e8: {
              boxWidthEmission: 'token',
              boxHeightEmission: 'mirrored'
            },
            e10: {
              borderWidthEmission: 'mirrored'
            },
            e12: {
              boxWidthEmission: 'token',
              boxHeightEmission: 'token'
            },
            e13: {
              boxWidthEmission: 'token',
              boxHeightEmission: 'token'
            },
            e14: {
              boxHeightEmission: 'token',
              marginTopEmission: 'token'
            },
            e3: {
              marginLeftEmission: 'token'
            },
            e4: {
              boxHeightEmission: 'token',
              marginTopEmission: 'token',
              paddingEmission: 'token'
            },
            e5: {
              marginRightEmission: 'token',
              marginLeftEmission: 'token',
              paddingEmission: 'token'
            },
            e15: {
              boxWidthEmission: 'mirrored',
              marginTopEmission: 'token',
              marginBottomEmission: 'token'
            },
            e16: {
              marginTopEmission: 'token',
              marginBottomEmission: 'token'
            },
            e17: {
              marginTopEmission: 'token'
            },
            e18: {
              boxWidthEmission: 'mirrored',
              marginTopEmission: 'token',
              marginBottomEmission: 'token'
            },
            e20: {
              marginLeftEmission: 'token'
            }
          }
        }
      }
    },
    tabs: {
      elements: {
        e2: {
          boxWidthEmission: 'token',
          borderRadiusEmission: 'token',
          shadowEmission: 'token'
        },
        e5: {
          borderRadiusEmission: 'token',
          shadowEmission: 'token'
        }
      },
      variants: {
        bridge: {
          elements: {
            e1: {
              paddingEmission: 'token'
            },
            e2: {
              paddingEmission: 'token'
            },
            e4: {
              boxHeightEmission: 'token',
              boxWidthEmission: 'token'
            }
          }
        },
        segmented: {
          elements: {
            e1: {
              borderColorEmission: 'mirrored',
              borderWidthEmission: 'mirrored',
              paddingEmission: 'compensated'
            }
          }
        }
      }
    }
  }
};

export const DEFAULT_ELEMENT_STYLE_EMISSION_POLICY: ResolvedElementStyleEmissionPolicy = {
  boxColorEmission: 'direct',
  boxColorGradientEmission: 'direct',
  textColorEmission: 'direct',
  borderRadiusEmission: 'mirrored',
  borderWidthEmission: 'direct',
  borderColorEmission: 'direct',
  boxWidthEmission: 'direct',
  boxHeightEmission: 'direct',
  marginTopEmission: 'direct',
  marginRightEmission: 'direct',
  marginBottomEmission: 'direct',
  marginLeftEmission: 'direct',
  paddingEmission: 'direct',
  shadowEmission: 'direct'
};

export function resolveElementStyleEmissionPolicy(
  webStyleEmissionPolicy: WebStyleEmissionPolicy | undefined,
  componentName: string,
  elementName: string,
  variantName?: string
): ResolvedElementStyleEmissionPolicy {
  const componentPolicy = webStyleEmissionPolicy?.components?.[componentName];
  const elementPolicy = componentPolicy?.elements?.[elementName];
  const variantElementPolicy = variantName
    ? componentPolicy?.variants?.[variantName]?.elements?.[elementName]
    : undefined;

  return {
    boxColorEmission:
      variantElementPolicy?.boxColorEmission ??
      elementPolicy?.boxColorEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.boxColorEmission,
    boxColorGradientEmission:
      variantElementPolicy?.boxColorGradientEmission ??
      elementPolicy?.boxColorGradientEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.boxColorGradientEmission,
    selectedBoxColorGateClass:
      variantElementPolicy?.selectedBoxColorGateClass ?? elementPolicy?.selectedBoxColorGateClass,
    textColorEmission:
      variantElementPolicy?.textColorEmission ??
      elementPolicy?.textColorEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.textColorEmission,
    borderRadiusEmission:
      variantElementPolicy?.borderRadiusEmission ??
      elementPolicy?.borderRadiusEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.borderRadiusEmission,
    borderWidthEmission:
      variantElementPolicy?.borderWidthEmission ??
      elementPolicy?.borderWidthEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.borderWidthEmission,
    borderColorEmission:
      variantElementPolicy?.borderColorEmission ??
      elementPolicy?.borderColorEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.borderColorEmission,
    boxWidthEmission:
      variantElementPolicy?.boxWidthEmission ??
      elementPolicy?.boxWidthEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.boxWidthEmission,
    boxHeightEmission:
      variantElementPolicy?.boxHeightEmission ??
      elementPolicy?.boxHeightEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.boxHeightEmission,
    marginTopEmission:
      variantElementPolicy?.marginTopEmission ??
      elementPolicy?.marginTopEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.marginTopEmission,
    marginRightEmission:
      variantElementPolicy?.marginRightEmission ??
      elementPolicy?.marginRightEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.marginRightEmission,
    marginBottomEmission:
      variantElementPolicy?.marginBottomEmission ??
      elementPolicy?.marginBottomEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.marginBottomEmission,
    marginLeftEmission:
      variantElementPolicy?.marginLeftEmission ??
      elementPolicy?.marginLeftEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.marginLeftEmission,
    paddingEmission:
      variantElementPolicy?.paddingEmission ??
      elementPolicy?.paddingEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.paddingEmission,
    paddingLeftEmission:
      variantElementPolicy?.paddingLeftEmission ??
      variantElementPolicy?.paddingEmission ??
      elementPolicy?.paddingLeftEmission ??
      elementPolicy?.paddingEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.paddingEmission,
    paddingRightEmission:
      variantElementPolicy?.paddingRightEmission ??
      variantElementPolicy?.paddingEmission ??
      elementPolicy?.paddingRightEmission ??
      elementPolicy?.paddingEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.paddingEmission,
    shadowEmission:
      variantElementPolicy?.shadowEmission ??
      elementPolicy?.shadowEmission ??
      DEFAULT_ELEMENT_STYLE_EMISSION_POLICY.shadowEmission
  };
}

type SeparatorPolicySchemaLike = {
  components?: unknown;
};

type SeparatorPolicyLocation = {
  path: string;
  componentName: string;
  elementName: string;
  variantName?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectSeparatorPolicyLocations(
  schemaLike: SeparatorPolicySchemaLike
): SeparatorPolicyLocation[] {
  if (!isRecord(schemaLike.components)) return [];
  const locations: SeparatorPolicyLocation[] = [];

  const collectElementMap = (
    value: unknown,
    path: string,
    componentName: string,
    variantName?: string
  ): void => {
    if (!isRecord(value)) return;
    for (const [elementName, element] of Object.entries(value)) {
      if (!isRecord(element) || !Object.hasOwn(element, 'separator')) continue;
      locations.push({
        path: `${path}.${elementName}`,
        componentName,
        elementName,
        ...(variantName ? { variantName } : {})
      });
    }
  };

  for (const [componentName, component] of Object.entries(schemaLike.components)) {
    if (!isRecord(component)) continue;
    const componentPath = `components.${componentName}`;
    collectElementMap(component.elements, `${componentPath}.elements`, componentName);

    if (!isRecord(component.variants)) continue;
    for (const [variantName, variant] of Object.entries(component.variants)) {
      if (!isRecord(variant)) continue;
      const variantPath = `${componentPath}.variants.${variantName}`;
      collectElementMap(variant.elements, `${variantPath}.elements`, componentName, variantName);

      if (!isRecord(variant.modes)) continue;
      for (const [modeName, mode] of Object.entries(variant.modes)) {
        if (!isRecord(mode)) continue;
        collectElementMap(
          mode.elements,
          `${variantPath}.modes.${modeName}.elements`,
          componentName,
          variantName
        );
      }
    }
  }

  return locations;
}

/**
 * What
 *     Validates that every separator recipe consumer emits boxWidth as a structural token.
 * Why
 *     Horizontal and vertical structures reinterpret one shared thickness without implicit policy.
 */
export function getSeparatorStyleEmissionPolicyIssues(
  schemaLike: SeparatorPolicySchemaLike,
  webStyleEmissionPolicy: WebStyleEmissionPolicy | undefined
): string[] {
  const issues: string[] = [];
  for (const location of collectSeparatorPolicyLocations(schemaLike)) {
    const componentPolicy = webStyleEmissionPolicy?.components?.[location.componentName];
    const elementPolicy = componentPolicy?.elements?.[location.elementName];
    const variantElementPolicy = location.variantName
      ? componentPolicy?.variants?.[location.variantName]?.elements?.[location.elementName]
      : undefined;
    const explicitBoxWidthEmission =
      variantElementPolicy?.boxWidthEmission ?? elementPolicy?.boxWidthEmission;

    if (explicitBoxWidthEmission !== 'token') {
      issues.push(
        `${location.path}.separator: requires explicit boxWidthEmission "token" in the Web style-emission policy`
      );
    }
  }
  return issues;
}

export function validateSeparatorStyleEmissionPolicy(
  schemaLike: SeparatorPolicySchemaLike,
  webStyleEmissionPolicy: WebStyleEmissionPolicy | undefined
): void {
  const issues = getSeparatorStyleEmissionPolicyIssues(schemaLike, webStyleEmissionPolicy);
  if (issues.length === 0) return;
  throw new Error(`Invalid separator style-emission policy.\n${issues.join('\n')}`);
}
