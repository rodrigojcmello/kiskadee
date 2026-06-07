import type { RippleProfile } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { buildStyleKey } from '../../../utils/index.ts';
import { UNSUPPORTED_PROPERTY_NAME, UNSUPPORTED_VALUE } from '../../errorMessages.ts';
import { transformRippleKeyToCss } from './transformRippleKeyToCss.ts';

const className = 'rk1';

describe('transformRippleKeyToCss', () => {
  it('transforms surface ripple keys into interactive CSS vars', () => {
    const key = buildStyleKey({
      propertyName: 'ripple',
      value: {
        mode: 'surface',
        profile: {
          durationToken: 'interaction.fast',
          curveToken: 'motion.emphasized.out'
        }
      }
    });

    const out = transformRippleKeyToCss(key, className);

    expect(out.startsWith('.rk1.-i {')).toBe(true);
    expect(out).toContain('--k-ripple-overflow: hidden;');
    expect(out).toContain('--k-ripple-clip: inset(0 round var(--k-bdr, 0px));');
    expect(out).toContain('--k-ripple-color: var(--k-ripple-surface-color, #000);');
    expect(out).toContain('--k-ripple-opacity: var(--k-ripple-surface-opacity, 0.12);');
    expect(out).toContain('--k-ripple-duration: 360ms;');
    expect(out).toContain('--k-ripple-ease: cubic-bezier(0.2, 0, 0.2, 1);');
  });

  it('transforms overflow-static ripple keys with border vars', () => {
    const profile: RippleProfile = {
      fillToken: 'overflowStatic',
      border: {
        width: 2,
        colorToken: 'overflowStaticBorder'
      },
      fade: {
        durationToken: 'interaction.fade.long',
        curveToken: 'motion.standard.out'
      }
    };
    const key = buildStyleKey({
      propertyName: 'ripple',
      value: {
        mode: 'overflow-static',
        profile
      }
    });

    const out = transformRippleKeyToCss(key, className);

    expect(out).toContain('--k-ripple-overflow: visible;');
    expect(out).toContain('--k-ripple-clip: none;');
    expect(out).toContain('--k-ripple-border-width: 2px;');
    expect(out).toContain(
      '--k-ripple-border-color: var(--k-ripple-overflow-static-border-color, transparent);'
    );
    expect(out).toContain(
      '--k-ripple-border-opacity: var(--k-ripple-overflow-static-border-opacity, 1);'
    );
    expect(out).toContain('--k-ripple-fade-duration: 180ms;');
  });

  it('transforms ripplePressed keys using pressed profile defaults/overrides', () => {
    const key = buildStyleKey({
      propertyName: 'ripplePressed',
      value: {
        profile: {
          fillToken: 'overflow',
          durationToken: 'interaction.instant',
          curveToken: 'motion.standard.out',
          fade: {
            durationToken: 'interaction.fade.short',
            curveToken: 'motion.standard.out'
          }
        }
      }
    });

    const out = transformRippleKeyToCss(key, className);

    expect(out.startsWith('.rk1.-i {')).toBe(true);
    expect(out).toContain('--k-ripple-overflow: hidden;');
    expect(out).toContain('--k-ripple-clip: inset(0 round var(--k-bdr, 0px));');
    expect(out).toContain('--k-ripple-color: var(--k-ripple-overflow-color, #0481FF);');
    expect(out).toContain('--k-ripple-opacity: var(--k-ripple-overflow-opacity, 0.15);');
    expect(out).toContain('--k-ripple-duration: 0ms;');
  });

  it('throws when style key does not match ripple/ripplePressed property', () => {
    const invalid = 'shadow__[0,0,0,[0,0,0,1]]';

    expect(() => transformRippleKeyToCss(invalid, className)).toThrowError(
      UNSUPPORTED_PROPERTY_NAME('ripple', invalid)
    );
  });

  it('throws on invalid ripple JSON payload', () => {
    const invalid = 'ripple__not-json';

    expect(() => transformRippleKeyToCss(invalid, className)).toThrowError(
      UNSUPPORTED_VALUE('ripple', 'not-json', invalid)
    );
  });
});
