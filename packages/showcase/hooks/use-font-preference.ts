import type { ShowcaseFontRole } from '@kiskadee/react-components';
import { useEffect, useState } from 'react';
import { useManifest } from '@/hooks/use-manifest';
import { FOLLOW_PRESET_FONT_KEY, MIXED_FONT_KEY } from '@/utils/font-family-selection';

export function useFontPreference(options: { designSystemKey?: string }) {
  const { designSystemKey } = options;
  const manifest = useManifest(designSystemKey);
  const [fontRoleNames, setFontRoleNames] = useState<Record<ShowcaseFontRole, string>>({
    body: FOLLOW_PRESET_FONT_KEY,
    heading: FOLLOW_PRESET_FONT_KEY,
    code: FOLLOW_PRESET_FONT_KEY
  });
  const fontName =
    fontRoleNames.body === fontRoleNames.heading ? fontRoleNames.body : MIXED_FONT_KEY;

  const setFontName = (value: string) => {
    setFontRoleNames((current) => ({
      ...current,
      body: value,
      heading: value
    }));
  };

  const setFontRoleName = (role: ShowcaseFontRole, value: string) => {
    setFontRoleNames((current) => ({
      ...current,
      [role]: value
    }));
  };

  useEffect(() => {
    setFontRoleNames({
      body: FOLLOW_PRESET_FONT_KEY,
      heading: FOLLOW_PRESET_FONT_KEY,
      code: FOLLOW_PRESET_FONT_KEY
    });
  }, [designSystemKey]);

  return {
    manifest,
    fontName,
    fontRoleNames,
    setFontName,
    setFontRoleName
  } as const;
}
