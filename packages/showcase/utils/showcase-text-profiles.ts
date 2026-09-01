import type { TypographyProfileId } from '@kiskadee/core';
import { useKiskadee } from '@kiskadee/react-components';
import type { DesignSystemKey } from '@/registry/registry-utils';

export type ShowcaseTextProfiles = {
  pageTitle: TypographyProfileId;
  sectionTitle: TypographyProfileId;
  subsectionTitle: TypographyProfileId;
  groupTitle: TypographyProfileId;
  body: TypographyProfileId;
  bodyStrong: TypographyProfileId;
  caption: TypographyProfileId;
};

export const showcaseTextProfilesByDesignSystem = {
  'carbon-1-ibm': {
    pageTitle: 'body-medium-strong',
    sectionTitle: 'body-medium-strong',
    subsectionTitle: 'body-medium-strong',
    groupTitle: 'label-small',
    body: 'body-medium',
    bodyStrong: 'body-medium-strong',
    caption: 'label-small'
  },
  'elegant-1-kiskadee': {
    pageTitle: 'label-medium',
    sectionTitle: 'label-medium',
    subsectionTitle: 'label-medium',
    groupTitle: 'label-medium',
    body: 'body-medium',
    bodyStrong: 'label-medium',
    caption: 'label-medium'
  },
  'fluent-2-kiskadee': {
    pageTitle: 'label-large',
    sectionTitle: 'label-large',
    subsectionTitle: 'label-medium',
    groupTitle: 'label-small',
    body: 'label-medium',
    bodyStrong: 'label-medium',
    caption: 'label-small'
  },
  'fluent-2-microsoft': {
    pageTitle: 'heading-large',
    sectionTitle: 'heading-small',
    subsectionTitle: 'subtitle-large',
    groupTitle: 'subtitle-small',
    body: 'body-medium',
    bodyStrong: 'body-medium-strong',
    caption: 'caption-medium'
  },
  'ios-18-apple': {
    pageTitle: 'body-medium',
    sectionTitle: 'body-medium',
    subsectionTitle: 'body-medium',
    groupTitle: 'body-medium',
    body: 'body-medium',
    bodyStrong: 'body-medium',
    caption: 'body-medium'
  },
  'ios-27-apple': {
    pageTitle: 'body-medium',
    sectionTitle: 'label-medium',
    subsectionTitle: 'label-small-strong',
    groupTitle: 'label-small',
    body: 'body-medium',
    bodyStrong: 'label-medium',
    caption: 'caption-medium'
  },
  'material-design-3-google': {
    pageTitle: 'label-display-large',
    sectionTitle: 'label-display-small',
    subsectionTitle: 'label-extra-large',
    groupTitle: 'label-large',
    body: 'body-medium',
    bodyStrong: 'label-large',
    caption: 'body-small'
  },
  'material-design-3-kiskadee': {
    pageTitle: 'label-display-large',
    sectionTitle: 'label-display-small',
    subsectionTitle: 'label-extra-large',
    groupTitle: 'label-large',
    body: 'body-medium',
    bodyStrong: 'label-large',
    caption: 'body-small'
  },
  'sandbox-0-kiskadee': {
    pageTitle: 'body-large-strong',
    sectionTitle: 'body-medium-strong',
    subsectionTitle: 'body-small-strong',
    groupTitle: 'body-extra-small-strong',
    body: 'body-medium',
    bodyStrong: 'body-medium-strong',
    caption: 'body-extra-small'
  },
  'sandbox-2-kiskadee': {
    pageTitle: 'body-large-strong',
    sectionTitle: 'body-medium-strong',
    subsectionTitle: 'body-small-strong',
    groupTitle: 'body-extra-small-strong',
    body: 'body-medium',
    bodyStrong: 'body-medium-strong',
    caption: 'body-extra-small'
  },
  'sandbox-3-kiskadee': {
    pageTitle: 'body-large-strong',
    sectionTitle: 'body-medium-strong',
    subsectionTitle: 'body-small-strong',
    groupTitle: 'body-extra-small-strong',
    body: 'body-medium',
    bodyStrong: 'body-medium-strong',
    caption: 'body-extra-small'
  }
} as const satisfies Record<DesignSystemKey, ShowcaseTextProfiles>;

export function resolveShowcaseTextProfiles(designSystem: string): ShowcaseTextProfiles {
  const profiles = showcaseTextProfilesByDesignSystem[designSystem as DesignSystemKey];
  if (!profiles) {
    throw new Error(`[showcase] Missing text-profile mapping for "${designSystem}".`);
  }
  return profiles;
}

export function useShowcaseTextProfiles(): ShowcaseTextProfiles {
  const { designSystem } = useKiskadee();
  return resolveShowcaseTextProfiles(designSystem);
}
