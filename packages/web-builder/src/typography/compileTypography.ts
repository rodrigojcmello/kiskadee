import type {
  Breakpoints,
  BreakpointValue,
  ComponentName,
  ElementAllSizeValue,
  ElementSizeValue,
  ElementTypography,
  GlobalClassNameMapJSON,
  SchemaTypography,
  TypographyProfile,
  TypographyProfileId
} from '@kiskadee/core';
import { breakpointValues, resolveTypographyProfileBucket } from '@kiskadee/core';
import type { ShortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { buildStyleKey } from '../utils/index.ts';
import { normalizeCssNumber } from '../utils/normalizeCssNumber.ts';
import type { TypographyArtifact, TypographyArtifactUsage } from './typographyArtifact.ts';

export type TypographyElementStyleKeys = {
  decorations: string[];
  scales: Partial<Record<ElementSizeValue | ElementAllSizeValue, string[]>>;
};

type TypographyElementScope = {
  component: ComponentName;
  variant?: string;
  mode?: string;
  element: string;
  elementName: string;
};

type TypographyFrame = {
  breakpoint: BreakpointValue;
  profileId: TypographyProfileId;
  profile: TypographyProfile;
};

export type TypographyBuild = {
  /** Includes duplicates so Phase 2 can still prioritize the most reused utilities. */
  additionalCoreStyleKeys: string[];
  profileStyleKeys: Record<TypographyProfileId, string[]>;
  profiles: SchemaTypography['profiles'];
  usage: Record<TypographyProfileId, TypographyArtifactUsage[]>;
  expandElement(
    typography: ElementTypography,
    scope: TypographyElementScope
  ): TypographyElementStyleKeys;
};

function normalizeFontSize(value: number): number {
  return normalizeCssNumber(value);
}

function normalizeLineHeight(profile: TypographyProfile): number {
  return normalizeCssNumber(profile.scales.textHeight / profile.scales.textSize);
}

function normalizeLetterSpacing(profile: TypographyProfile): number | undefined {
  const letterSpacing = profile.scales.textLetterSpacing;
  if (letterSpacing === undefined) return undefined;
  return normalizeCssNumber(letterSpacing / profile.scales.textSize);
}

function profileStyleKeys(profile: TypographyProfile): string[] {
  const keys = [
    buildStyleKey({ propertyName: 'textFont', value: profile.decorations.textFont }),
    buildStyleKey({ propertyName: 'textWeight', value: profile.decorations.textWeight }),
    buildStyleKey({ propertyName: 'textSize', value: normalizeFontSize(profile.scales.textSize) }),
    buildStyleKey({ propertyName: 'textLineHeight', value: normalizeLineHeight(profile) })
  ];
  const letterSpacing = normalizeLetterSpacing(profile);
  if (letterSpacing !== undefined) {
    keys.push(buildStyleKey({ propertyName: 'textLetterSpacing', value: letterSpacing }));
  }
  return keys;
}

function resolveProfile(
  profiles: SchemaTypography['profiles'],
  profileId: TypographyProfileId
): TypographyProfile {
  const profile = profiles[profileId];
  if (!profile) {
    throw new Error(`[web-builder] Unknown typography profile "${profileId}".`);
  }
  return profile;
}

function canonicalFrames(
  profiles: SchemaTypography['profiles'],
  assignment: ElementTypography[ElementSizeValue | ElementAllSizeValue],
  breakpoints: Breakpoints
): TypographyFrame[] {
  if (typeof assignment === 'string') {
    return [
      {
        breakpoint: 'bp:all',
        profileId: assignment,
        profile: resolveProfile(profiles, assignment)
      }
    ];
  }
  if (!assignment) return [];

  const frames: TypographyFrame[] = [];
  for (const breakpoint of breakpointValues) {
    const profileId = assignment[breakpoint];
    if (!profileId) continue;
    frames.push({
      breakpoint,
      profileId,
      profile: resolveProfile(profiles, profileId)
    });
  }
  return frames.sort((a, b) => {
    if (a.breakpoint === 'bp:all') return b.breakpoint === 'bp:all' ? 0 : -1;
    if (b.breakpoint === 'bp:all') return 1;

    const aMinWidth = breakpoints[a.breakpoint] ?? Number.POSITIVE_INFINITY;
    const bMinWidth = breakpoints[b.breakpoint] ?? Number.POSITIVE_INFINITY;
    return (
      aMinWidth - bMinWidth ||
      breakpointValues.indexOf(a.breakpoint) - breakpointValues.indexOf(b.breakpoint)
    );
  });
}

function authoredFrames(
  profiles: SchemaTypography['profiles'],
  assignment: ElementTypography[ElementSizeValue | ElementAllSizeValue]
): TypographyFrame[] {
  if (typeof assignment === 'string') {
    return [
      {
        breakpoint: 'bp:all',
        profileId: assignment,
        profile: resolveProfile(profiles, assignment)
      }
    ];
  }
  if (!assignment) return [];

  return Object.entries(assignment).flatMap(([breakpoint, profileId]) =>
    profileId
      ? [
          {
            breakpoint: breakpoint as BreakpointValue,
            profileId,
            profile: resolveProfile(profiles, profileId)
          }
        ]
      : []
  );
}

function responsiveStyleKey(params: {
  propertyName: string;
  value: string | number;
  size: ElementSizeValue | ElementAllSizeValue;
  breakpoint: BreakpointValue;
}): string {
  const { propertyName, value, size, breakpoint } = params;
  if (breakpoint === 'bp:all') {
    return buildStyleKey({ propertyName, value });
  }

  // `s:all` is a valid typography scale. buildStyleKey only types component-specific
  // sizes today, but its serialized format is also valid for this global-size token.
  return buildStyleKey({
    propertyName,
    value,
    size: size as ElementSizeValue,
    breakpoint
  });
}

function appendScaleKey(
  target: TypographyElementStyleKeys['scales'],
  size: ElementSizeValue | ElementAllSizeValue,
  key: string
): void {
  const current = target[size] ?? [];
  if (!current.includes(key)) {
    target[size] = [...current, key];
  }
}

export function createTypographyBuild(
  typography: SchemaTypography | undefined,
  breakpoints: Breakpoints
): TypographyBuild | undefined {
  if (!typography) return undefined;

  const byProfile: Record<TypographyProfileId, string[]> = {};
  const usage: Record<TypographyProfileId, TypographyArtifactUsage[]> = {};
  const additionalCoreStyleKeys: string[] = [];

  // Object entry order is authorial order and is intentionally retained in both artifacts.
  for (const [profileId, profile] of Object.entries(typography.profiles)) {
    const keys = profileStyleKeys(profile);
    byProfile[profileId] = keys;
    usage[profileId] = [];
    additionalCoreStyleKeys.push(...keys);
  }

  return {
    additionalCoreStyleKeys,
    profileStyleKeys: byProfile,
    profiles: typography.profiles,
    usage,
    expandElement(elementTypography, scope) {
      const scales: TypographyElementStyleKeys['scales'] = {};
      const decorations: string[] = [];
      const allFrames = Object.values(elementTypography).flatMap((assignment) =>
        canonicalFrames(typography.profiles, assignment, breakpoints)
      );
      const fonts = new Set(allFrames.map((frame) => frame.profile.decorations.textFont));
      const weights = new Set(allFrames.map((frame) => frame.profile.decorations.textWeight));
      const invariantFont =
        fonts.size === 1 ? allFrames[0]?.profile.decorations.textFont : undefined;
      const invariantWeight =
        weights.size === 1 ? allFrames[0]?.profile.decorations.textWeight : undefined;

      if (invariantFont) {
        decorations.push(buildStyleKey({ propertyName: 'textFont', value: invariantFont }));
      }
      if (invariantWeight) {
        decorations.push(buildStyleKey({ propertyName: 'textWeight', value: invariantWeight }));
      }

      for (const [rawSize, assignment] of Object.entries(elementTypography)) {
        if (!assignment) continue;
        const size = rawSize as ElementSizeValue | ElementAllSizeValue;

        // Keep detailed artifact usage in the exact order authored in the schema.
        for (const frame of authoredFrames(typography.profiles, assignment)) {
          usage[frame.profileId]?.push({
            component: scope.component,
            ...(scope.variant ? { variant: scope.variant } : {}),
            ...(scope.mode ? { mode: scope.mode } : {}),
            element: scope.element,
            elementName: scope.elementName,
            scale: size,
            ...(frame.breakpoint === 'bp:all'
              ? {}
              : {
                  breakpoint: frame.breakpoint as Exclude<BreakpointValue, 'bp:all'>
                })
          });
        }

        const frames = canonicalFrames(typography.profiles, assignment, breakpoints);
        const baseFrame = frames[0];
        if (!invariantFont && baseFrame) {
          appendScaleKey(
            scales,
            size,
            buildStyleKey({
              propertyName: 'textFont',
              value: baseFrame.profile.decorations.textFont
            })
          );
        }
        if (!invariantWeight && baseFrame) {
          appendScaleKey(
            scales,
            size,
            buildStyleKey({
              propertyName: 'textWeight',
              value: baseFrame.profile.decorations.textWeight
            })
          );
        }

        let previousHadLetterSpacing = false;
        for (const frame of frames) {
          const keyParams = { size, breakpoint: frame.breakpoint };
          appendScaleKey(
            scales,
            size,
            responsiveStyleKey({
              ...keyParams,
              propertyName: 'textSize',
              value: normalizeFontSize(frame.profile.scales.textSize)
            })
          );
          appendScaleKey(
            scales,
            size,
            responsiveStyleKey({
              ...keyParams,
              propertyName: 'textLineHeight',
              value: normalizeLineHeight(frame.profile)
            })
          );

          const letterSpacing = normalizeLetterSpacing(frame.profile);
          if (letterSpacing !== undefined) {
            appendScaleKey(
              scales,
              size,
              responsiveStyleKey({
                ...keyParams,
                propertyName: 'textLetterSpacing',
                value: letterSpacing
              })
            );
          } else if (previousHadLetterSpacing && frame.breakpoint !== 'bp:all') {
            appendScaleKey(
              scales,
              size,
              responsiveStyleKey({
                ...keyParams,
                propertyName: 'textLetterSpacing',
                value: 'normal'
              })
            );
          }
          previousHadLetterSpacing = letterSpacing !== undefined;
        }
      }

      return { decorations, scales };
    }
  };
}

export function buildTypographyArtifact(
  build: TypographyBuild,
  shortenMap: ShortenCssClassNames
): TypographyArtifact {
  const profiles: TypographyArtifact['profiles'] = {};

  for (const [profileId, profile] of Object.entries(build.profiles)) {
    const classes = (build.profileStyleKeys[profileId] ?? []).map((styleKey) => {
      const className = shortenMap[styleKey];
      if (!className) {
        throw new Error(
          `[web-builder] Missing generated class for typography profile "${profileId}" style key "${styleKey}".`
        );
      }
      return className;
    });

    profiles[profileId] = {
      decorations: { ...profile.decorations },
      scales: { ...profile.scales },
      bucket: resolveTypographyProfileBucket(profileId),
      className: Array.from(new Set(classes)).join(' ')
    };
  }

  return {
    profiles,
    usage: Object.fromEntries(
      Object.keys(build.profiles).map((profileId) => [profileId, build.usage[profileId] ?? []])
    )
  };
}

/**
 * What
 *     Builds the Text class-map bucket from compiled typography profile utilities.
 * Why
 *     Text needs profile lookup in the normal global artifact without adding CSS selectors.
 */
export function buildTextTypographyClassMap(
  artifact: TypographyArtifact
): NonNullable<GlobalClassNameMapJSON['text']> {
  const profilesByBucket = new Map<string, TypographyProfileId>();
  const t: Record<string, string> = {};

  for (const [profileId, profile] of Object.entries(artifact.profiles)) {
    const previousProfileId = profilesByBucket.get(profile.bucket);
    if (previousProfileId && previousProfileId !== profileId) {
      throw new Error(
        `[web-builder] Typography profiles "${previousProfileId}" and "${profileId}" resolve to the same bucket "${profile.bucket}".`
      );
    }

    profilesByBucket.set(profile.bucket, profileId);
    t[profile.bucket] = profile.className;
  }

  return { e1: { t } };
}
