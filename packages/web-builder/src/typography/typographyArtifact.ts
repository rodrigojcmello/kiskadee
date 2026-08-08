import type {
  BreakpointValue,
  ComponentName,
  ElementAllSizeValue,
  ElementSizeValue,
  TypographyProfile,
  TypographyProfileId
} from '@kiskadee/core';

export const TYPOGRAPHY_ARTIFACT_PATH = 'typography.kiskadee.json';

export type TypographyArtifactUsage = {
  component: ComponentName;
  variant?: string;
  mode?: string;
  element: string;
  elementName: string;
  scale: ElementSizeValue | ElementAllSizeValue;
  breakpoint?: Exclude<BreakpointValue, 'bp:all'>;
};

export type TypographyArtifactProfile = TypographyProfile & {
  /** Space-separated atomic utility classes. This is not a composite CSS class. */
  className: string;
};

export type TypographyArtifact = {
  profiles: Record<TypographyProfileId, TypographyArtifactProfile>;
  usage: Record<TypographyProfileId, TypographyArtifactUsage[]>;
};
