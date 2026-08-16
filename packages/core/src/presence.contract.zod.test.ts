import { describe, expect, it } from 'vitest';
import {
  validateDropdownPresenceEffectContract,
  validatePresenceEffectContract,
  validateSchemaPresenceContract
} from './presence.contract.zod.ts';

const profiles = {
  'fade-translate': {
    distancePx: 4,
    enterDurationMs: 120,
    exitDurationMs: 60,
    enterEasing: 'ease-out',
    exitEasing: 'ease-in'
  },
  'grow-height': {
    enterDurationMs: 180,
    exitDurationMs: 120,
    enterEasing: 'ease-out',
    exitEasing: 'ease-in'
  }
} as const;

describe('presence effect contract', () => {
  it('accepts the two supported profiles and a resolving Dropdown default', () => {
    const schema = {
      global: { effects: { presence: { profiles } } },
      components: {
        dropdown: { effects: { presence: { profile: 'fade-translate' } } }
      }
    } as const;

    expect(() => validateSchemaPresenceContract(schema)).not.toThrow();
  });

  it('rejects unknown profiles, fields, easing values and invalid numeric values', () => {
    expect(
      validatePresenceEffectContract({
        profiles: {
          'fade-translate': {
            distancePx: 0,
            enterDurationMs: -1,
            exitDurationMs: Number.NaN,
            enterEasing: 'linear',
            exitEasing: 'ease-in',
            height: 'auto'
          },
          zoom: {}
        }
      })
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining('.height: unrecognized key'),
        expect.stringContaining('.distancePx: expected finite number greater than 0'),
        expect.stringContaining('.enterDurationMs: expected finite number'),
        expect.stringContaining('.exitDurationMs: expected finite number'),
        expect.stringContaining('.enterEasing: expected "ease-in" or "ease-out"'),
        expect.stringContaining('.zoom: unsupported profile')
      ])
    );
  });

  it('requires a non-empty profile catalog', () => {
    expect(validatePresenceEffectContract({ profiles: {} })).toEqual([
      'global.effects.presence.profiles: expected at least one profile'
    ]);
  });

  it('requires the Dropdown default to resolve in the global catalog', () => {
    expect(() =>
      validateSchemaPresenceContract({
        global: { effects: { presence: { profiles: { 'grow-height': profiles['grow-height'] } } } },
        components: {
          dropdown: { effects: { presence: { profile: 'fade-translate' } } }
        }
      })
    ).toThrow('references missing profile "fade-translate"');

    expect(() =>
      validateSchemaPresenceContract({
        components: {
          dropdown: { effects: { presence: { profile: 'fade-translate' } } }
        }
      })
    ).toThrow('requires global.effects.presence.profiles');
  });

  it('rejects invalid Dropdown presence objects independently', () => {
    expect(validateDropdownPresenceEffectContract({ profile: 'zoom', duration: 100 })).toEqual([
      'components.dropdown.effects.presence.duration: unrecognized key',
      'components.dropdown.effects.presence.profile: unsupported profile'
    ]);
  });
});
