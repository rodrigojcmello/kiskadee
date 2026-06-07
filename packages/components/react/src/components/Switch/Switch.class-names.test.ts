import { describe, expect, it } from 'vitest';
import { resolveSwitchThumbShrinkClassNames, resolveVariantElements, hasSwitchActivationFeedbackEffect, resolveSwitchActivationFeedbackEffectClassName, resolveSwitchClassNames } from './Switch.class-names.ts';
import type { SwitchVariantClassesMap } from './Switch.types.ts';

const variantMap: SwitchVariantClassesMap = {
  standard: {
    base: {
      e1: {
        d: 'base-e1',
        s: {
          all: 'size-e1',
          md: 'size-e1-md'
        }
      },
      e2: {
        d: 'base-e2',
        s: {
          all: 'size-e2'
        },
        rr: {
          all: 'radius-e2'
        }
      },
      e3: {
        d: 'base-e3',
        e: {
          af: 'feedback-active',
          ts: 'thumb-shrink'
        }
      },
      e4: {
        d: 'base-e4'
      },
      e5: {
        d: 'base-e5'
      }
    }
  }
};

describe('Switch class-name resolvers', () => {
  it('resolveVariantElements pega variante/modo configurados', () => {
    const noMap: SwitchVariantClassesMap = {};

    expect(resolveVariantElements(variantMap, 'standard', 'base')).toBe(variantMap.standard?.base);
    expect(resolveVariantElements(noMap, 'standard', 'base')).toEqual({});
  });

  it('resolveSwitchClassNames gera fallback estrutural para slots obrigatórios', () => {
    const classes = resolveSwitchClassNames({
      elements: variantMap.standard?.base ?? {},
      classNames: {},
      structuralBranch: 'a',
      scale: 's:md:1',
      intent: 'neutral',
      emphasis: 'medium',
      radius: 'rounded',
      activationMotion: 'standard',
      labelPosition: 'start',
      hasLabel: true,
      hasControlText: false
    });

    expect(classes.e1).toContain('k-swt');
    expect(classes.e1).toContain('k-swt-e1-a');
    expect(classes.e2).toContain('k-swt-e2-a');
    expect(classes.e3).toContain('k-swt-e3-a');
    expect(classes.e4).toContain('k-swt-e4-a');
    expect(classes.e5).toBe('');
  });

  it('resolveSwitchThumbShrinkClassNames reaproveita classes base e gera classe x5', () => {
    const classes = resolveSwitchThumbShrinkClassNames({
      elements: variantMap.standard?.base ?? {},
      classNames: {},
      structuralBranch: 'a',
      scale: 's:md:1',
      intent: 'neutral',
      emphasis: 'medium',
      radius: 'rounded',
      activationMotion: 'standard',
      labelPosition: 'start',
      hasLabel: true,
      hasControlText: false
    });

    expect(classes.e3).toContain('k-swt-e3-a');
    expect(classes.x5).toContain('thumb-shrink');
  });

  it('detecta suporte de activation feedback via classe no elemento e3', () => {
    expect(hasSwitchActivationFeedbackEffect(variantMap.standard?.base?.e3 ?? {})).toBe(true);
    expect(resolveSwitchActivationFeedbackEffectClassName({})).toBe('');
    expect(resolveSwitchActivationFeedbackEffectClassName({ e: { af: 'feedback-a' } })).toBe(
      'feedback-a'
    );
  });
});
