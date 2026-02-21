import type { RippleEffectSchema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { convertElementRippleToStyleKeys } from './convertElementRippleToStyleKeys';

const parseStyleKeyValue = <T>(key: string): T => {
  const index = key.indexOf('__');
  if (index === -1) {
    throw new Error(`Invalid style key format: ${key}`);
  }
  return JSON.parse(key.slice(index + 2)) as T;
};

describe('convertElementRippleToStyleKeys', () => {
  it('generates default surface ripple and pressed ripple keys when config is absent', () => {
    const result = convertElementRippleToStyleKeys({});
    const rest = result.rest ?? [];

    expect(Object.keys(result)).toEqual(['rest']);
    expect(rest).toHaveLength(2);

    const surfaceKey = rest[0];
    const pressedKey = rest[1];

    expect(surfaceKey.startsWith('ripple__')).toBe(true);
    expect(pressedKey.startsWith('ripplePressed__')).toBe(true);

    const surface = parseStyleKeyValue<{ mode: string; profile: { fillToken: string } }>(surfaceKey);
    const pressed = parseStyleKeyValue<{ profile: { fillToken: string } }>(pressedKey);

    expect(surface.mode).toBe('surface');
    expect(surface.profile.fillToken).toBe('surface');
    expect(pressed.profile.fillToken).toBe('surface');
  });

  it('keeps the configured default mode available even when not declared in profiles', () => {
    const config: RippleEffectSchema = {
      mode: 'overflow',
      profiles: {
        surface: {
          size: 111
        },
        overflowStatic: {
          size: 333
        }
      }
    };

    const result = convertElementRippleToStyleKeys({ config });
    const rest = result.rest ?? [];
    const rippleKeys = rest.filter((key) => key.startsWith('ripple__'));
    const modes = rippleKeys.map((key) => parseStyleKeyValue<{ mode: string }>(key).mode);

    expect(modes).toEqual(['overflow', 'surface', 'overflow-static']);
  });

  it('applies configured profile overrides for ripple and pressed variants', () => {
    const config: RippleEffectSchema = {
      mode: 'overflow-static',
      profiles: {
        overflowStatic: {
          size: 321,
          fillToken: 'overflowStatic'
        },
        pressed: {
          fillToken: 'overflow',
          size: 77
        }
      }
    };

    const result = convertElementRippleToStyleKeys({ config });
    const rest = result.rest ?? [];
    const overflowStaticKey = rest.find(
      (key) =>
        key.startsWith('ripple__') &&
        parseStyleKeyValue<{ mode: string }>(key).mode === 'overflow-static'
    );
    const pressedKey = rest.find((key) => key.startsWith('ripplePressed__'));

    expect(overflowStaticKey).toBeTruthy();
    expect(pressedKey).toBeTruthy();

    const overflowStatic = parseStyleKeyValue<{ profile: { size: number; fillToken: string } }>(
      overflowStaticKey!
    );
    const pressed = parseStyleKeyValue<{ profile: { size: number; fillToken: string } }>(pressedKey!);

    expect(overflowStatic.profile.size).toBe(321);
    expect(overflowStatic.profile.fillToken).toBe('overflowStatic');
    expect(pressed.profile.fillToken).toBe('overflow');
    expect(pressed.profile.size).toBe(77);
  });
});
