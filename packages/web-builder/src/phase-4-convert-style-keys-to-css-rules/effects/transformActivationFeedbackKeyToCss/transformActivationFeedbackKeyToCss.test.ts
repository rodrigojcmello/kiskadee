import type { ActivationFeedbackProfileConfig } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { buildStyleKey } from '../../../utils/index.ts';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';
import { transformActivationFeedbackKeyToCss } from './transformActivationFeedbackKeyToCss.ts';

const className = 'af1';

describe('transformActivationFeedbackKeyToCss', () => {
  it('transforms base activation feedback keys into tone and layer vars', () => {
    const key = buildStyleKey({
      propertyName: 'activationFeedback',
      value: {
        visual: {
          layer: 'underlay',
          tone: {
            default: 'vivid'
          }
        }
      }
    });

    const out = transformActivationFeedbackKeyToCss(key, className);

    expect(out.startsWith('.af1 {')).toBe(true);
    expect(out).toContain('--k-af-current-color: var(--k-af-vivid-color');
    expect(out).toContain('--k-af-current-opacity: var(--k-af-vivid-opacity');
    expect(out).toContain('--k-af-z: -1;');
    expect(out).toContain('--k-af-fill-opacity: 1;');
  });

  it('transforms ripple profile keys into clipped radial CSS vars', () => {
    const profileConfig: ActivationFeedbackProfileConfig = {
      size: 'auto',
      durationToken: 'interaction.fast',
      curveToken: 'motion.emphasized.out'
    };
    const key = buildStyleKey({
      propertyName: 'activationFeedbackProfile',
      value: {
        profile: 'ripple',
        profileConfig
      }
    });

    const out = transformActivationFeedbackKeyToCss(key, className);

    expect(out).toContain('--k-af-profile: ripple;');
    expect(out).toContain('--k-af-overflow: hidden;');
    expect(out).toContain('--k-af-clip: inset(0 round var(--k-bdr, 0px));');
    expect(out).toContain('--k-af-size: auto;');
    expect(out).toContain('--k-af-animate-size: 1;');
    expect(out).toContain('--k-af-duration: 360ms;');
    expect(out).toContain('--k-af-ease: cubic-bezier(0.2, 0, 0.2, 1);');
  });

  it('transforms outline halo profile keys into host-sized border vars', () => {
    const key = buildStyleKey({
      propertyName: 'activationFeedbackProfile',
      value: {
        profile: 'halo',
        profileConfig: {
          animateSize: false,
          size: 8,
          fade: {
            durationToken: 'interaction.fade.long'
          }
        },
        visual: {
          paint: 'outline'
        }
      }
    });

    const out = transformActivationFeedbackKeyToCss(key, className);

    expect(out).toContain('--k-af-profile: halo;');
    expect(out).toContain('--k-af-overflow: visible;');
    expect(out).toContain('--k-af-clip: none;');
    expect(out).toContain('--k-af-animate-size: 0;');
    expect(out).toContain('--k-af-fill-opacity: 0;');
    expect(out).toContain(
      '--k-af-layer-width: calc(var(--k-af-host-width, var(--k-af-end-size)) + (8px * 2));'
    );
    expect(out).toContain(
      '--k-af-layer-radius: var(--k-af-outline-radius, calc(var(--k-af-host-radius, 0px) + 8px));'
    );
    expect(out).toContain('--k-af-border-width: 8px;');
    expect(out).toContain('--k-af-fade-duration: 360ms;');
  });

  it('transforms pressed profile keys using pressed defaults and overrides', () => {
    const key = buildStyleKey({
      propertyName: 'activationFeedbackProfile',
      value: {
        profile: 'pressed',
        profileConfig: {
          durationToken: 'interaction.instant'
        }
      }
    });

    const out = transformActivationFeedbackKeyToCss(key, className);

    expect(out).toContain('--k-af-profile: pressed;');
    expect(out).toContain('--k-af-overflow: hidden;');
    expect(out).toContain('--k-af-duration: 0ms;');
  });

  it('throws when style key does not match activation feedback properties', () => {
    const invalid = 'shadow__[0,0,0,[0,0,0,1]]';

    expect(() => transformActivationFeedbackKeyToCss(invalid, className)).toThrowError(
      UNSUPPORTED_PROPERTY_NAME('activationFeedback', invalid)
    );
  });

  it('throws on invalid activation feedback JSON payload', () => {
    const invalid = 'activationFeedback__not-json';

    expect(() => transformActivationFeedbackKeyToCss(invalid, className)).toThrowError(
      UNSUPPORTED_VALUE('activationFeedback', 'not-json', invalid)
    );
  });

  it('throws on unknown activation feedback profile names', () => {
    const invalid = buildStyleKey({
      propertyName: 'activationFeedbackProfile',
      value: {
        profile: 'hallo'
      }
    });

    expect(() => transformActivationFeedbackKeyToCss(invalid, className)).toThrowError(
      UNSUPPORTED_VALUE('activationFeedback', 'hallo', invalid)
    );
  });
});
