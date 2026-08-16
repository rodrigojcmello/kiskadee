import type {
  DropdownPresence,
  DropdownPresenceProfile,
  ResolvedDropdownPresenceEffect
} from '@kiskadee/core';
import { useState } from 'react';

type PresenceSelection = DropdownPresenceProfile | 'off';

const PRESENCE_PROFILE_LABELS: Readonly<Record<DropdownPresenceProfile, string>> = {
  'fade-translate': 'Fade + translate',
  'grow-height': 'Grow height'
};

const PRESENCE_PROFILE_ORDER: ReadonlyArray<DropdownPresenceProfile> = [
  'fade-translate',
  'grow-height'
];

export function resolveDropdownPresenceControl({
  presenceArtifact,
  selection
}: {
  presenceArtifact: ResolvedDropdownPresenceEffect | undefined;
  selection?: PresenceSelection;
}) {
  const defaultSelection: PresenceSelection = presenceArtifact?.profile ?? 'off';
  const availablePresenceProfiles = presenceArtifact?.profiles;
  const presenceSelection: PresenceSelection =
    selection === 'off' || (selection && availablePresenceProfiles?.[selection])
      ? selection
      : defaultSelection;
  const presenceOverride: DropdownPresence | undefined =
    presenceSelection === defaultSelection
      ? undefined
      : presenceSelection === 'off'
        ? false
        : presenceSelection;
  const presenceOptions = [
    ...PRESENCE_PROFILE_ORDER.filter((profile) => availablePresenceProfiles?.[profile]).map(
      (profile) => ({
        label: `${PRESENCE_PROFILE_LABELS[profile]}${profile === defaultSelection ? ' (default)' : ''}`,
        value: profile
      })
    ),
    {
      label: `No animation${defaultSelection === 'off' ? ' (default)' : ''}`,
      value: 'off' as const
    }
  ];

  return { presenceOptions, presenceOverride, presenceSelection };
}

export function useDropdownPresenceControl({
  designSystem,
  presenceArtifact
}: {
  designSystem: string;
  presenceArtifact: ResolvedDropdownPresenceEffect | undefined;
}) {
  const defaultSelection: PresenceSelection = presenceArtifact?.profile ?? 'off';
  const [presenceState, setPresenceState] = useState<{
    designSystem: string;
    value: PresenceSelection;
  }>({ designSystem, value: defaultSelection });
  const storedSelection =
    presenceState.designSystem === designSystem ? presenceState.value : defaultSelection;
  const { presenceOptions, presenceOverride, presenceSelection } = resolveDropdownPresenceControl({
    presenceArtifact,
    selection: storedSelection
  });

  return {
    presenceOptions,
    presenceOverride,
    presenceSelection,
    setPresenceSelection(value: string) {
      setPresenceState({
        designSystem,
        value: value as PresenceSelection
      });
    }
  };
}
