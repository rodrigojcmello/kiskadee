export const dropdownPresenceProfiles = ['fade-translate', 'grow-height'] as const;

export type DropdownPresenceProfile = (typeof dropdownPresenceProfiles)[number];

export type DropdownPresence = DropdownPresenceProfile | false;

export type PresenceEasing = 'ease-in' | 'ease-out';

export type PresenceProfileTiming = {
  enterDurationMs: number;
  exitDurationMs: number;
  enterEasing: PresenceEasing;
  exitEasing: PresenceEasing;
};

export type FadeTranslatePresenceProfile = PresenceProfileTiming & {
  distancePx: number;
};

export type GrowHeightPresenceProfile = PresenceProfileTiming;

export type PresenceProfiles = Partial<{
  'fade-translate': FadeTranslatePresenceProfile;
  'grow-height': GrowHeightPresenceProfile;
}>;

export type PresenceEffectSchema = {
  profiles: PresenceProfiles;
};

export type DropdownPresenceEffectSchema = {
  profile: DropdownPresenceProfile;
};

export type ResolvedDropdownPresenceEffect = DropdownPresenceEffectSchema & PresenceEffectSchema;
