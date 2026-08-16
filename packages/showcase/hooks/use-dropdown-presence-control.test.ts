import type { ResolvedDropdownPresenceEffect } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { resolveDropdownPresenceControl } from './use-dropdown-presence-control';

const fluentPresence: ResolvedDropdownPresenceEffect = {
  profile: 'fade-translate',
  profiles: {
    'fade-translate': {
      distancePx: 12,
      enterDurationMs: 240,
      exitDurationMs: 120,
      enterEasing: 'ease-out',
      exitEasing: 'ease-in'
    },
    'grow-height': {
      enterDurationMs: 180,
      exitDurationMs: 120,
      enterEasing: 'ease-out',
      exitEasing: 'ease-in'
    }
  }
};

describe('useDropdownPresenceControl', () => {
  it('lists only real choices and marks the effective preset default', () => {
    const result = resolveDropdownPresenceControl({ presenceArtifact: fluentPresence });

    expect(result.presenceOptions).toEqual([
      { label: 'Fade + translate (default)', value: 'fade-translate' },
      { label: 'Grow height', value: 'grow-height' },
      { label: 'No animation', value: 'off' }
    ]);
    expect(result.presenceSelection).toBe('fade-translate');
    expect(result.presenceOverride).toBeUndefined();

    const override = resolveDropdownPresenceControl({
      presenceArtifact: fluentPresence,
      selection: 'grow-height'
    });
    expect(override.presenceSelection).toBe('grow-height');
    expect(override.presenceOverride).toBe('grow-height');
  });

  it('shows no animation as the real default when a preset publishes no profiles', () => {
    const result = resolveDropdownPresenceControl({ presenceArtifact: undefined });

    expect(result.presenceOptions).toEqual([{ label: 'No animation (default)', value: 'off' }]);
    expect(result.presenceSelection).toBe('off');
    expect(result.presenceOverride).toBeUndefined();
  });
});
