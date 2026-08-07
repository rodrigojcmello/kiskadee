import type {
  ActivationFeedbackEffectSchema,
  ActivationFeedbackSetting,
  ButtonIconLayout,
  ButtonIconPlacement,
  ButtonIconTreatment,
  RadiusMode,
  SchemaFonts,
  SchemaIcons,
  ShadowEffectSchema,
  ShadowGlobalEffectSchema,
  ThemeMode
} from '@kiskadee/core';
import { useEffect, useState } from 'react';
import { extraMaps, paletteIndex } from '@/registry/design-systems.registry';
import type { DesignSystemKey } from '@/registry/registry-utils';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

type BackgroundTones = Partial<Record<ThemeMode, string | undefined>>;

const radiusGlobalCache: Partial<Record<string, RadiusMode | null>> = {};

type GlobalArtifact = {
  fonts?: SchemaFonts;
  icons?: SchemaIcons;
  radius?: RadiusMode;
  effects?: {
    activationFeedback?: ActivationFeedbackEffectSchema;
    shadow?: ShadowGlobalEffectSchema;
  };
  components?: {
    button?: {
      options?: {
        iconLayout?: ButtonIconLayout;
        iconPlacement?: ButtonIconPlacement;
        iconTreatment?: ButtonIconTreatment;
      };
      effects?: {
        activationFeedback?: ActivationFeedbackSetting;
        shadow?: ShadowEffectSchema;
      };
    };
    card?: {
      effects?: {
        shadow?: ShadowEffectSchema;
      };
    };
    switch?: {
      effects?: {
        activationFeedback?: ActivationFeedbackSetting;
      };
    };
  };
};

const globalArtifactCache: Partial<Record<string, GlobalArtifact | null>> = {};

export function useThemeExtras({
  designSystem,
  segment
}: {
  designSystem: DesignSystemKey;
  segment: string;
}) {
  const [backgroundsByTheme, setBackgroundsByTheme] = useState<BackgroundTones>({});
  const [globalConfig, setGlobalConfig] = useState<GlobalArtifact | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const loadGlobals = async () => {
      const dsKey = String(designSystem);
      if (!dsKey) return;

      const hasGlobalArtifact = Object.hasOwn(globalArtifactCache, dsKey);
      let globalArtifact = globalArtifactCache[dsKey] ?? undefined;

      if (!hasGlobalArtifact) {
        try {
          const json = await loadJsonFromBuild<GlobalArtifact>(`${dsKey}/global.kiskadee.json`, {
            required: false,
            fallback: {}
          });
          globalArtifact = json;
          globalArtifactCache[dsKey] = Object.keys(json).length ? json : null;
          radiusGlobalCache[dsKey] = json.radius ?? null;
        } catch (error) {
          console.warn(
            `[showcase] Failed to load global artifact for "${dsKey}". Retrying on next mount/selection change.`,
            error
          );
        }
      }

      if (cancelled) return;
      setGlobalConfig(globalArtifact ?? undefined);
    };

    void loadGlobals();

    return () => {
      cancelled = true;
    };
  }, [designSystem]);

  useEffect(() => {
    let cancelled = false;

    const loadBackgrounds = async () => {
      const info = paletteIndex[designSystem as keyof typeof paletteIndex];
      if (!info) return;

      const themesMap = info.themesBySegment as unknown as Record<string, readonly ThemeMode[]>;
      const themesForSegment = themesMap[segment] ?? ([] as readonly ThemeMode[]);

      if (!themesForSegment.length) return;

      const entries = await Promise.all(
        themesForSegment.map(async (themeForBackground) => {
          const key = `${String(designSystem)}|${segment}|${themeForBackground}`;
          const loader = extraMaps[key as keyof typeof extraMaps];

          if (!loader) {
            return [themeForBackground, undefined] as const;
          }

          try {
            const extra = await loader();
            return [themeForBackground, extra.background] as const;
          } catch (error) {
            console.warn(
              `[showcase] Failed to load extra artifact for "${key}". Falling back to undefined background.`,
              error
            );
            return [themeForBackground, undefined] as const;
          }
        })
      );

      if (cancelled) return;

      const nextBackgrounds: BackgroundTones = {};
      for (const [themeKey, background] of entries) {
        nextBackgrounds[themeKey] = background;
      }

      setBackgroundsByTheme(nextBackgrounds);
    };

    void loadBackgrounds();

    return () => {
      cancelled = true;
    };
  }, [designSystem, segment]);

  return {
    backgroundsByTheme,
    globalConfig
  };
}
