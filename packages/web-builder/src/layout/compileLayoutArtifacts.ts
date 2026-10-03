import {
  type Breakpoints,
  type BreakpointValue,
  type ClassNameByElementJSON,
  type ComponentClassNameMapJSON,
  type ComponentStyleKeyMap,
  breakpoints as coreBreakpoints,
  layoutColumnCssVariables
} from '@kiskadee/core';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import {
  DEFAULT_WEB_STYLE_EMISSION_POLICY,
  resolveElementStyleEmissionPolicy,
  type WebStyleEmissionPolicy
} from '../style-emission/web-build-policy.ts';
import {
  canonicalizeWebStyleKeyIdentity,
  resolveWebStyleKeyIdentity,
  type WebStyleIdentityOptimizationOptions
} from '../style-emission/web-style-key-identity.ts';

const SPACING_PROPERTIES = {
  paddingTop: 'pt',
  paddingRight: 'pr',
  paddingBottom: 'pb',
  paddingLeft: 'pl',
  marginTop: 'mt',
  marginRight: 'mr',
  marginBottom: 'mb',
  marginLeft: 'ml'
} as const;

type CompileLayoutArtifactsOptions = {
  styleKeys: ComponentStyleKeyMap;
  coreClassMap: ComponentClassNameMapJSON;
  shortenMap: ShortenCssClassNames;
  breakpoints?: Breakpoints;
  classNamePrefix?: string;
  webStyleEmissionPolicy?: WebStyleEmissionPolicy;
} & WebStyleIdentityOptimizationOptions;

/** Publish spacing selectors and responsive consumers of instance-local column counts. */
export function compileLayoutArtifacts(options: CompileLayoutArtifactsOptions): string {
  const { styleKeys, coreClassMap, shortenMap } = options;
  if (!styleKeys.layout) return '';
  const policy = options.webStyleEmissionPolicy ?? DEFAULT_WEB_STYLE_EMISSION_POLICY;
  const layout = coreClassMap.layout;
  if (!layout?.e1 || !layout.e2) {
    throw new Error('components.layout: missing frame/flow class maps');
  }

  for (const elementName of ['e1', 'e2'] as const) {
    const element = layout[elementName];
    const emission = resolveElementStyleEmissionPolicy(policy, 'layout', elementName);
    if (
      emission.paddingEmission !== 'token' ||
      (emission.paddingLeftEmission ?? emission.paddingEmission) !== 'token' ||
      (emission.paddingRightEmission ?? emission.paddingEmission) !== 'token' ||
      (elementName === 'e1' &&
        [
          'marginTopEmission',
          'marginRightEmission',
          'marginBottomEmission',
          'marginLeftEmission'
        ].some((property) => emission[property as keyof typeof emission] !== 'token'))
    ) {
      throw new Error(`components.layout.${elementName}: spacing must use token-only emission`);
    }
    const spacing: NonNullable<ClassNameByElementJSON['sp']> = {};
    for (const [size, keys] of Object.entries(styleKeys.layout[elementName]?.scales ?? {})) {
      const sizeKey = size.startsWith('s:') ? size.slice(2) : size;
      for (const styleKey of keys ?? []) {
        const property = Object.keys(SPACING_PROPERTIES).find(
          (name) => styleKey.startsWith(`${name}__`) || styleKey.startsWith(`${name}++`)
        ) as keyof typeof SPACING_PROPERTIES | undefined;
        if (
          !property ||
          (elementName === 'e2' && !['paddingTop', 'paddingLeft'].includes(property))
        ) {
          throw new Error(`components.layout.${elementName}: unsupported spacing key ${styleKey}`);
        }
        const identity = canonicalizeWebStyleKeyIdentity(
          resolveWebStyleKeyIdentity(styleKey, policy, 'layout', elementName),
          shortenMap,
          options
        );
        const className = shortenMap[identity];
        if (!className)
          throw new Error(`components.layout.${elementName}: missing class for ${identity}`);
        const spacingKey = SPACING_PROPERTIES[property];
        spacing[spacingKey] ??= {};
        const propertyMap = spacing[spacingKey]!;
        propertyMap[sizeKey] = [
          ...new Set([...(propertyMap[sizeKey]?.split(' ') ?? []), className])
        ].join(' ');
      }
    }
    element.sp = spacing;
    // One aggregate size bucket would couple frame padding, margin and flow gap selections.
    delete element.s;
  }

  // A schema override replaces the Core table, as in ordinary scale CSS compilation.
  const effectiveBreakpoints = options.breakpoints ?? coreBreakpoints;
  if (effectiveBreakpoints['bp:all'] !== undefined && effectiveBreakpoints['bp:all'] !== 0) {
    throw new Error('components.layout: bp:all must remain 0');
  }
  const entries = Object.entries({ ...effectiveBreakpoints, 'bp:all': 0 }) as [
    BreakpointValue,
    number
  ][];
  for (const [key, threshold] of entries) {
    if (!Object.hasOwn(layoutColumnCssVariables, key)) {
      throw new Error(`components.layout: unsupported breakpoint ${key}`);
    }
    if (!Number.isFinite(threshold) || threshold < 0) {
      throw new Error(`components.layout: invalid breakpoint threshold for ${key}`);
    }
  }
  entries.sort(
    ([leftKey, left], [rightKey, right]) =>
      left - right ||
      (leftKey === 'bp:all' ? -1 : rightKey === 'bp:all' ? 1 : leftKey.localeCompare(rightKey))
  );

  const columns: NonNullable<ClassNameByElementJSON['gc']> = {};
  const css: string[] = [];
  for (const [index, [breakpoint, threshold]] of entries.entries()) {
    // A numeric suffix distinguishes these consumers from shortened atomic tokens (letters only).
    const name = `${options.classNamePrefix ? `${options.classNamePrefix}-` : ''}lc${index}`;
    const rule = `.${name}{grid-template-columns:repeat(var(${layoutColumnCssVariables[breakpoint]}),minmax(0,1fr))}`;
    columns[breakpoint] = name;
    css.push(breakpoint === 'bp:all' ? rule : `@media (min-width:${threshold}px){${rule}}`);
  }
  layout.e2.gc = columns;
  return css.join('');
}
