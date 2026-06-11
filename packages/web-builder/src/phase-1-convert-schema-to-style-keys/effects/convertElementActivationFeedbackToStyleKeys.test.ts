import type { ActivationFeedbackEffectSchema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { convertElementActivationFeedbackToStyleKeys } from './convertElementActivationFeedbackToStyleKeys.ts';

const parseStyleKeyValue = <T>(key: string): T => {
  const index = key.indexOf('__');
  if (index === -1) {
    throw new Error(`Invalid style key format: ${key}`);
  }
  return JSON.parse(key.slice(index + 2)) as T;
};

describe('convertElementActivationFeedbackToStyleKeys', () => {
  it('generates the base activation feedback key when config is absent', () => {
    const result = convertElementActivationFeedbackToStyleKeys({});
    const rest = result.rest ?? [];

    expect(Object.keys(result)).toEqual(['rest']);
    expect(rest).toHaveLength(1);
    expect(rest[0].startsWith('activationFeedback__')).toBe(true);
    expect(parseStyleKeyValue(rest[0])).toEqual({});
  });

  it('keeps the configured default profile available even when not declared in profiles', () => {
    const config: ActivationFeedbackEffectSchema = {
      profile: 'ripple-overflow',
      profiles: {
        ripple: {
          size: 111
        },
        halo: {
          size: 8
        }
      }
    };

    const result = convertElementActivationFeedbackToStyleKeys({ config });
    const rest = result.rest ?? [];
    const profileKeys = rest.filter((key) => key.startsWith('activationFeedbackProfile__'));
    const profiles = profileKeys.map(
      (key) => parseStyleKeyValue<{ profile: string }>(key).profile
    );

    expect(profiles).toEqual(['ripple-overflow', 'ripple', 'halo']);
  });

  it('applies configured profile overrides and includes pressed profile overrides', () => {
    const config: ActivationFeedbackEffectSchema = {
      profile: 'halo',
      visual: {
        layer: 'underlay',
        paint: 'outline',
        tone: {
          default: 'subtle',
          byEmphasis: {
            low: 'vivid'
          }
        }
      },
      profiles: {
        halo: {
          size: 8
        },
        pressed: {
          size: 'auto'
        }
      }
    };

    const result = convertElementActivationFeedbackToStyleKeys({ config });
    const rest = result.rest ?? [];
    const haloKey = rest.find((key) => {
      return (
        key.startsWith('activationFeedbackProfile__') &&
        parseStyleKeyValue<{ profile: string }>(key).profile === 'halo'
      );
    });
    const pressedKey = rest.find((key) => {
      return (
        key.startsWith('activationFeedbackProfile__') &&
        parseStyleKeyValue<{ profile: string }>(key).profile === 'pressed'
      );
    });

    expect(haloKey).toBeTruthy();
    expect(pressedKey).toBeTruthy();

    const halo = parseStyleKeyValue<{
      profileConfig: { size: number };
      visual: ActivationFeedbackEffectSchema['visual'];
    }>(haloKey!);
    const pressed = parseStyleKeyValue<{ profileConfig: { size: string } }>(pressedKey!);

    expect(halo.profileConfig.size).toBe(8);
    expect(halo.visual?.paint).toBe('outline');
    expect(halo.visual?.tone?.byEmphasis?.low).toBe('vivid');
    expect(pressed.profileConfig.size).toBe('auto');
  });
});
