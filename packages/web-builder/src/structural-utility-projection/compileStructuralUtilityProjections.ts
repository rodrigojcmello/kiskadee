import {
  type ClassNameByElementJSON,
  type ComponentClassNameMapJSON,
  type ComponentStyleKeyMap,
  type ScaleProperty,
  type StandardScaleProperty,
  type StyleKey,
  scaleProperties
} from '@kiskadee/core';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { resolveEmittedScaleCssVar } from '../style-emission/emitted-scale-css-vars.ts';
import {
  type ResolvedElementStyleEmissionPolicy,
  resolveElementStyleEmissionPolicy,
  type WebStyleEmissionPolicy
} from '../style-emission/web-build-policy.ts';
import {
  applyCanonicalStyleEmissionPolicy,
  canonicalizeWebStyleKeyIdentity,
  resolveWebStyleKeyIdentity,
  type WebStyleIdentityOptimizationOptions
} from '../style-emission/web-style-key-identity.ts';
import {
  DEFAULT_WEB_STRUCTURAL_UTILITY_PROJECTIONS,
  type StructuralUtilityProjectionElementLocation,
  type StructuralUtilityProjectionRule,
  validateStructuralUtilityProjectionRegistry,
  type WebStructuralUtilityProjectionRegistry
} from './web-structural-utility-projection-registry.ts';

type ElementStyleKeyRecord = {
  scales?: Record<string, unknown>;
};

type CompileStructuralUtilityProjectionsOptions = {
  styleKeys: ComponentStyleKeyMap;
  coreClassMap: ComponentClassNameMapJSON;
  shortenMap: ShortenCssClassNames;
  projectionRegistry?: WebStructuralUtilityProjectionRegistry;
  webStyleEmissionPolicy?: WebStyleEmissionPolicy;
} & WebStyleIdentityOptimizationOptions;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function describeLocation(location: StructuralUtilityProjectionElementLocation): string {
  return [location.component, location.variant, location.mode, location.element]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join('.');
}

function sameLocation(
  left: StructuralUtilityProjectionElementLocation,
  right: StructuralUtilityProjectionElementLocation
): boolean {
  return (
    left.component === right.component &&
    left.variant === right.variant &&
    left.mode === right.mode &&
    left.element === right.element
  );
}

function resolveElementFromTree(
  tree: unknown,
  location: StructuralUtilityProjectionElementLocation
): Record<string, unknown> | undefined {
  if (!isRecord(tree)) return undefined;
  const component = tree[location.component];
  if (!isRecord(component)) return undefined;

  let branch: Record<string, unknown> = component;
  if (location.variant) {
    const variant = branch[location.variant];
    if (!isRecord(variant)) return undefined;
    branch = variant;
  }
  if (location.mode) {
    const mode = branch[location.mode];
    if (!isRecord(mode)) return undefined;
    branch = mode;
  }

  const element = branch[location.element];
  return isRecord(element) ? element : undefined;
}

function extractStyleKeyProperty(styleKey: string): string {
  const head = styleKey.split('__')[0] ?? '';
  const separators = ['++', '--', '==']
    .map((separator) => head.indexOf(separator))
    .filter((index) => index >= 0);
  const end = separators.length > 0 ? Math.min(...separators) : head.length;
  return head.slice(0, end);
}

function compactScaleKey(scale: string): string {
  return scale.startsWith('s:') ? scale.slice(2) : scale;
}

function isScaleProperty(property: string): property is ScaleProperty {
  return scaleProperties.includes(property as ScaleProperty);
}

function resolveScalePropertyEmission(
  policy: ResolvedElementStyleEmissionPolicy,
  property: StandardScaleProperty
): string {
  switch (property) {
    case 'boxWidth':
      return policy.boxWidthEmission ?? 'direct';
    case 'boxHeight':
      return policy.boxHeightEmission ?? 'direct';
    case 'borderWidth':
      return policy.borderWidthEmission;
    case 'marginTop':
      return policy.marginTopEmission ?? 'direct';
    case 'marginRight':
      return policy.marginRightEmission ?? 'direct';
    case 'marginBottom':
      return policy.marginBottomEmission ?? 'direct';
    case 'marginLeft':
      return policy.marginLeftEmission ?? 'direct';
    case 'paddingLeft':
      return policy.paddingLeftEmission ?? policy.paddingEmission;
    case 'paddingRight':
      return policy.paddingRightEmission ?? policy.paddingEmission;
    case 'paddingTop':
    case 'paddingBottom':
      return policy.paddingEmission;
    case 'textSize':
    case 'textHeight':
      return 'direct';
  }
}

function getProjectedStyleKeysBySize(
  element: ElementStyleKeyRecord,
  property: StandardScaleProperty
): Map<string, string[]> {
  const result = new Map<string, string[]>();

  for (const [scale, rawStyleKeys] of Object.entries(element.scales ?? {})) {
    if (!Array.isArray(rawStyleKeys)) continue;
    const projectedStyleKeys = rawStyleKeys.filter(
      (styleKey): styleKey is string =>
        typeof styleKey === 'string' && extractStyleKeyProperty(styleKey) === property
    );
    if (projectedStyleKeys.length > 0) {
      result.set(compactScaleKey(scale), projectedStyleKeys);
    }
  }

  return result;
}

function removeClassNames(source: string | undefined, classNames: ReadonlySet<string>): string {
  if (!source) return '';
  return source
    .split(/\s+/)
    .filter((className) => className.length > 0 && !classNames.has(className))
    .join(' ');
}

function removeProjectionFromSource(
  sourceElement: ClassNameByElementJSON,
  classesBySize: ReadonlyMap<string, readonly string[]>
): void {
  if (!sourceElement.s) return;

  for (const [scale, classes] of classesBySize) {
    const remaining = removeClassNames(sourceElement.s[scale], new Set(classes));
    if (remaining) {
      sourceElement.s[scale] = remaining;
    } else {
      delete sourceElement.s[scale];
    }
  }

  if (Object.keys(sourceElement.s).length === 0) {
    delete sourceElement.s;
  }
}

function emissionCreatesCustomProperty(emission: string): boolean {
  return emission === 'token' || emission === 'mirrored' || emission === 'compensated';
}

function getAuthoredScaleStyleKeys(element: ElementStyleKeyRecord): StyleKey[] {
  const styleKeys: StyleKey[] = [];
  for (const rawStyleKeys of Object.values(element.scales ?? {})) {
    if (!Array.isArray(rawStyleKeys)) continue;
    for (const styleKey of rawStyleKeys) {
      if (typeof styleKey !== 'string') continue;
      const property = extractStyleKeyProperty(styleKey);
      if (isScaleProperty(property)) styleKeys.push(styleKey as StyleKey);
    }
  }
  return styleKeys;
}

function assertTargetDoesNotEmitProjectedToken(
  rule: StructuralUtilityProjectionRule,
  targetElement: ElementStyleKeyRecord,
  webStyleEmissionPolicy: WebStyleEmissionPolicy | undefined,
  knownIdentities: ReadonlySet<string>,
  collapseDirectIntoMirrored: boolean | undefined
): void {
  if (sameLocation(rule.source, rule.target)) return;
  const projectedCssVar = resolveEmittedScaleCssVar(rule.source.property);
  if (!projectedCssVar) return;

  const targetEmissionPolicy = resolveElementStyleEmissionPolicy(
    webStyleEmissionPolicy,
    rule.target.component,
    rule.target.element,
    rule.target.variant
  );
  for (const targetStyleKey of getAuthoredScaleStyleKeys(targetElement)) {
    const targetProperty = extractStyleKeyProperty(targetStyleKey) as ScaleProperty;
    if (
      targetProperty === 'borderRadius' ||
      targetProperty === 'borderRadiusRounded' ||
      targetProperty === 'borderRadiusPill' ||
      targetProperty === 'borderRadiusSquare'
    ) {
      continue;
    }
    const localIdentity = resolveWebStyleKeyIdentity(
      targetStyleKey,
      webStyleEmissionPolicy,
      rule.target.component,
      rule.target.element,
      rule.target.variant
    );
    const canonicalIdentity = canonicalizeWebStyleKeyIdentity(localIdentity, knownIdentities, {
      collapseDirectIntoMirrored
    });
    const effectiveTargetEmissionPolicy = applyCanonicalStyleEmissionPolicy(
      targetStyleKey,
      targetEmissionPolicy,
      canonicalIdentity,
      { collapseDirectIntoMirrored }
    );
    const targetEmission = resolveScalePropertyEmission(
      effectiveTargetEmissionPolicy,
      targetProperty
    );
    const targetCssVar = resolveEmittedScaleCssVar(targetProperty);
    if (targetCssVar !== projectedCssVar || !emissionCreatesCustomProperty(targetEmission)) {
      continue;
    }

    throw new Error(
      `[web-builder] Structural utility projection "${rule.id}": target "${describeLocation(rule.target)}" already emits "${projectedCssVar}" from scale property "${targetProperty}"`
    );
  }
}

/**
 * What
 *     Projects existing token-only scale utility classes into named target element buckets.
 * Why
 *     Structural consumers can reuse one schema owner without duplicating CSS or resolving values
 *     in the browser.
 */
export function compileStructuralUtilityProjections({
  styleKeys,
  coreClassMap,
  shortenMap,
  projectionRegistry = DEFAULT_WEB_STRUCTURAL_UTILITY_PROJECTIONS,
  webStyleEmissionPolicy,
  collapseDirectIntoMirrored
}: CompileStructuralUtilityProjectionsOptions): void {
  validateStructuralUtilityProjectionRegistry(projectionRegistry);
  const rules = projectionRegistry.projections ?? [];
  if (rules.length === 0) return;

  const knownIdentities = new Set(Object.keys(shortenMap));

  for (const rule of rules) {
    const sourceElement = resolveElementFromTree(styleKeys, rule.source) as
      | ElementStyleKeyRecord
      | undefined;
    if (!sourceElement) {
      if (rule.source.optional) continue;
      throw new Error(
        `[web-builder] Structural utility projection "${rule.id}": source "${describeLocation(rule.source)}" does not exist`
      );
    }

    const sourceStyleKeysBySize = getProjectedStyleKeysBySize(sourceElement, rule.source.property);
    if (sourceStyleKeysBySize.size === 0) {
      if (rule.source.optional) continue;
      throw new Error(
        `[web-builder] Structural utility projection "${rule.id}": source "${describeLocation(rule.source)}" does not author scale property "${rule.source.property}"`
      );
    }

    const targetElement = resolveElementFromTree(styleKeys, rule.target) as
      | ElementStyleKeyRecord
      | undefined;
    if (!targetElement) {
      throw new Error(
        `[web-builder] Structural utility projection "${rule.id}": target "${describeLocation(rule.target)}" does not exist`
      );
    }

    const sourceEmissionPolicy = resolveElementStyleEmissionPolicy(
      webStyleEmissionPolicy,
      rule.source.component,
      rule.source.element,
      rule.source.variant
    );
    const emission = resolveScalePropertyEmission(sourceEmissionPolicy, rule.source.property);
    if (emission !== 'token') {
      throw new Error(
        `[web-builder] Structural utility projection "${rule.id}": source property "${rule.source.property}" must use token emission, received "${emission}"`
      );
    }
    const projectedCssVar = resolveEmittedScaleCssVar(rule.source.property);
    if (!projectedCssVar) {
      throw new Error(
        `[web-builder] Structural utility projection "${rule.id}": source property "${rule.source.property}" does not emit a structural CSS custom property`
      );
    }

    assertTargetDoesNotEmitProjectedToken(
      rule,
      targetElement,
      webStyleEmissionPolicy,
      knownIdentities,
      collapseDirectIntoMirrored
    );

    const sourceClassMapElement = resolveElementFromTree(coreClassMap, rule.source) as
      | ClassNameByElementJSON
      | undefined;
    const targetClassMapElement = resolveElementFromTree(coreClassMap, rule.target) as
      | ClassNameByElementJSON
      | undefined;
    if (!sourceClassMapElement || !targetClassMapElement) {
      throw new Error(
        `[web-builder] Structural utility projection "${rule.id}": class-map source or target was not generated`
      );
    }

    const classesBySize = new Map<string, string[]>();
    for (const [scale, projectedStyleKeys] of sourceStyleKeysBySize) {
      const classes = new Set<string>();
      for (const styleKey of projectedStyleKeys) {
        const localIdentity = resolveWebStyleKeyIdentity(
          styleKey,
          webStyleEmissionPolicy,
          rule.source.component,
          rule.source.element,
          rule.source.variant
        );
        const canonicalIdentity = canonicalizeWebStyleKeyIdentity(localIdentity, knownIdentities, {
          collapseDirectIntoMirrored
        });
        classes.add(shortenMap[canonicalIdentity] ?? styleKey);
      }
      classesBySize.set(scale, Array.from(classes));
    }

    const projectedClassNames = Object.fromEntries(
      Array.from(classesBySize.entries()).map(([scale, classes]) => [scale, classes.join(' ')])
    );
    targetClassMapElement.p = {
      ...targetClassMapElement.p,
      [rule.artifactKey]: projectedClassNames
    };

    if (!rule.retainSource) {
      removeProjectionFromSource(sourceClassMapElement, classesBySize);
    }
  }
}
