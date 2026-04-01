import { describe, expect, it } from 'vitest';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from './web-build-policy';
import { buildWebStyleKeyIdentity, resolveWebStyleKeyIdentity } from './web-style-key-identity';

describe('web-style-key-identity', () => {
  describe('buildWebStyleKeyIdentity', () => {
    it('keeps box-model style keys unchanged when the property stays in raw mode', () => {
      expect(
        buildWebStyleKeyIdentity('paddingTop__12', {
          borderRadiusEmission: 'direct',
          borderWidthEmission: 'direct',
          paddingEmission: 'direct',
          shadowEmission: 'direct'
        })
      ).toBe('paddingTop__12');
    });

    it('appends only the compact compensated suffix for padding emission', () => {
      expect(
        buildWebStyleKeyIdentity('paddingTop__12', {
          borderRadiusEmission: 'direct',
          borderWidthEmission: 'direct',
          paddingEmission: 'compensated',
          shadowEmission: 'direct'
        })
      ).toBe('paddingTop__12@@c');
    });

    it('appends only the compact var suffix for border-radius emission', () => {
      expect(
        buildWebStyleKeyIdentity('borderRadius__12', {
          borderRadiusEmission: 'mirrored',
          borderWidthEmission: 'direct',
          paddingEmission: 'direct',
          shadowEmission: 'direct'
        })
      ).toBe('borderRadius__12@@m');
    });

    it('appends the compact token suffix for border-radius token emission', () => {
      expect(
        buildWebStyleKeyIdentity('borderRadius__12', {
          borderRadiusEmission: 'token',
          borderWidthEmission: 'direct',
          paddingEmission: 'direct',
          shadowEmission: 'direct'
        })
      ).toBe('borderRadius__12@@t');
    });

    it('appends only the compact var suffix for border-width emission', () => {
      expect(
        buildWebStyleKeyIdentity('borderWidth__2', {
          borderRadiusEmission: 'direct',
          borderWidthEmission: 'mirrored',
          paddingEmission: 'direct',
          shadowEmission: 'direct'
        })
      ).toBe('borderWidth__2@@m');
    });

    it('keeps shadow keys unchanged when shadow emission stays raw', () => {
      expect(
        buildWebStyleKeyIdentity('shadow__[0,0,4,[0,0,0,0.22]]', {
          borderRadiusEmission: 'mirrored',
          borderWidthEmission: 'mirrored',
          paddingEmission: 'compensated',
          shadowEmission: 'direct'
        })
      ).toBe('shadow__[0,0,4,[0,0,0,0.22]]');
    });

    it('appends the compact var suffix for shadow emission', () => {
      expect(
        buildWebStyleKeyIdentity('shadow__[0,0,4,[0,0,0,0.22]]', {
          borderRadiusEmission: 'direct',
          borderWidthEmission: 'direct',
          paddingEmission: 'direct',
          shadowEmission: 'token'
        })
      ).toBe('shadow__[0,0,4,[0,0,0,0.22]]@@t');
    });
  });

  describe('resolveWebStyleKeyIdentity', () => {
    it('uses the button e1 default policy from the builder config', () => {
      expect(
        resolveWebStyleKeyIdentity(
          'paddingTop__12',
          DEFAULT_WEB_STYLE_EMISSION_POLICY,
          'button',
          'e1'
        )
      ).toBe('paddingTop__12@@c');
    });

    it('uses the tabs e2 policy from the builder config for border-radius', () => {
      expect(
        resolveWebStyleKeyIdentity(
          'borderRadius__12',
          DEFAULT_WEB_STYLE_EMISSION_POLICY,
          'tabs',
          'e2'
        )
      ).toBe('borderRadius__12@@t');
    });

    it('does not append unrelated policy data to raw padding keys', () => {
      expect(
        resolveWebStyleKeyIdentity('paddingTop__12', DEFAULT_WEB_STYLE_EMISSION_POLICY, 'tabs', 'e2')
      ).toBe('paddingTop__12');
    });

    it('reuses the same raw padding identity across different raw elements', () => {
      expect(
        resolveWebStyleKeyIdentity('paddingTop__12', DEFAULT_WEB_STYLE_EMISSION_POLICY, 'tabs', 'e2')
      ).toBe(
        resolveWebStyleKeyIdentity('paddingTop__12', DEFAULT_WEB_STYLE_EMISSION_POLICY, 'tabs', 'e5')
      );
    });

    it('uses the tabs shadow var policy for bridge tabs', () => {
      expect(
        resolveWebStyleKeyIdentity(
          'shadow__[0,0,4,[0,0,0,0.22]]',
          DEFAULT_WEB_STYLE_EMISSION_POLICY,
          'tabs',
          'e2'
        )
      ).toBe('shadow__[0,0,4,[0,0,0,0.22]]@@t');
    });

    it('keeps button border-radius in mirrored emission mode', () => {
      expect(
        resolveWebStyleKeyIdentity(
          'borderRadius__12',
          DEFAULT_WEB_STYLE_EMISSION_POLICY,
          'button',
          'e1'
        )
      ).toBe('borderRadius__12@@m');
    });
  });
});
