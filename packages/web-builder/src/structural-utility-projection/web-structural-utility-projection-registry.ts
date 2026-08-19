import type { ComponentName, StandardScaleProperty } from '@kiskadee/core';

export type StructuralUtilityProjectionElementLocation = {
  component: ComponentName;
  variant?: string;
  mode?: string;
  element: string;
};

export type StructuralUtilityProjectionSource = StructuralUtilityProjectionElementLocation & {
  channel: 'scales';
  property: StandardScaleProperty;
  optional?: boolean;
};

export type StructuralUtilityProjectionRule = {
  id: string;
  artifactKey: string;
  source: StructuralUtilityProjectionSource;
  target: StructuralUtilityProjectionElementLocation;
  retainSource: boolean;
};

export type WebStructuralUtilityProjectionRegistry = {
  projections?: readonly StructuralUtilityProjectionRule[];
};

export const DEFAULT_WEB_STRUCTURAL_UTILITY_PROJECTIONS = {
  projections: []
} as const satisfies WebStructuralUtilityProjectionRegistry;

function locationKey(location: StructuralUtilityProjectionElementLocation): string {
  return [location.component, location.variant ?? '', location.mode ?? '', location.element].join(
    '/'
  );
}

function describeLocation(location: StructuralUtilityProjectionElementLocation): string {
  const branch = [location.component, location.variant, location.mode, location.element].filter(
    (part): part is string => typeof part === 'string' && part.length > 0
  );
  return branch.join('.');
}

function hasSameBranch(
  source: StructuralUtilityProjectionElementLocation,
  target: StructuralUtilityProjectionElementLocation
): boolean {
  return source.variant === target.variant && source.mode === target.mode;
}

/**
 * What
 *     Collects configuration issues in the structural utility projection registry.
 * Why
 *     Projection rules must be deterministic before any preset-specific class map is compiled.
 */
export function getStructuralUtilityProjectionRegistryIssues(
  registry: WebStructuralUtilityProjectionRegistry | undefined
): string[] {
  const rules = registry?.projections ?? [];
  const issues: string[] = [];
  const ids = new Set<string>();
  const targetArtifactKeys = new Set<string>();
  const targetProperties = new Set<string>();

  for (const rule of rules) {
    const prefix = `Structural utility projection "${rule.id}"`;

    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(rule.id)) {
      issues.push(`${prefix}: id must use lowercase kebab-case`);
    }
    if (!/^[a-z][a-z0-9]{0,2}$/.test(rule.artifactKey)) {
      issues.push(`${prefix}: artifactKey must contain 1-3 lowercase alphanumeric characters`);
    }
    if (!/^e\d+$/.test(rule.source.element)) {
      issues.push(`${prefix}: source element "${rule.source.element}" must use the e<n> format`);
    }
    if (!/^e\d+$/.test(rule.target.element)) {
      issues.push(`${prefix}: target element "${rule.target.element}" must use the e<n> format`);
    }
    if (rule.source.mode && !rule.source.variant) {
      issues.push(`${prefix}: source mode requires a variant`);
    }
    if (rule.target.mode && !rule.target.variant) {
      issues.push(`${prefix}: target mode requires a variant`);
    }
    if (rule.source.component !== rule.target.component) {
      issues.push(
        `${prefix}: cross-component projection from "${rule.source.component}" to "${rule.target.component}" is not supported`
      );
    }
    if (!hasSameBranch(rule.source, rule.target)) {
      issues.push(
        `${prefix}: source "${describeLocation(rule.source)}" and target "${describeLocation(rule.target)}" must use the same variant and mode branch`
      );
    }
    if (ids.has(rule.id)) {
      issues.push(`${prefix}: duplicate projection id`);
    }
    ids.add(rule.id);

    const targetArtifactKey = `${locationKey(rule.target)}::${rule.artifactKey}`;
    if (targetArtifactKeys.has(targetArtifactKey)) {
      issues.push(
        `${prefix}: duplicate artifactKey "${rule.artifactKey}" for target "${describeLocation(rule.target)}"`
      );
    }
    targetArtifactKeys.add(targetArtifactKey);

    const targetPropertyKey = `${locationKey(rule.target)}::${rule.source.property}`;
    if (targetProperties.has(targetPropertyKey)) {
      issues.push(
        `${prefix}: target "${describeLocation(rule.target)}" already receives property "${rule.source.property}" from another projection`
      );
    }
    targetProperties.add(targetPropertyKey);
  }

  for (let sourceIndex = 0; sourceIndex < rules.length; sourceIndex += 1) {
    const sourceRule = rules[sourceIndex];
    if (!sourceRule) continue;

    for (let targetIndex = 0; targetIndex < rules.length; targetIndex += 1) {
      if (sourceIndex === targetIndex) continue;
      const targetRule = rules[targetIndex];
      if (!targetRule) continue;

      if (
        locationKey(sourceRule.source) === locationKey(targetRule.target) &&
        sourceRule.source.property === targetRule.source.property
      ) {
        issues.push(
          `Structural utility projection "${sourceRule.id}": projection chains are not supported; source "${describeLocation(sourceRule.source)}.${sourceRule.source.property}" is the target of "${targetRule.id}"`
        );
      }
    }
  }

  return Array.from(new Set(issues));
}

/**
 * What
 *     Rejects an invalid structural utility projection registry.
 * Why
 *     Build output must never depend on ambiguous, chained, or cross-component projection rules.
 */
export function validateStructuralUtilityProjectionRegistry(
  registry: WebStructuralUtilityProjectionRegistry | undefined
): void {
  const issues = getStructuralUtilityProjectionRegistryIssues(registry);
  if (issues.length === 0) return;

  throw new Error(`[web-builder] ${issues.join('\n[web-builder] ')}`);
}
