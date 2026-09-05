import type { ActivationFeedbackEffectSchema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { resolveActivationFeedbackToneClass } from './activationFeedbackProfileAvailability.ts';

const config: ActivationFeedbackEffectSchema = {
  visual: {
    tone: {
      default: 'subtle',
      byEmphasis: {
        low: 'vivid'
      },
      bySurfaceContext: {
        onSubtle: 'subtle',
        onVivid: 'vivid'
      }
    }
  }
};

describe('activation feedback tone resolution', () => {
  it('prioritizes Surface Context over emphasis and default', () => {
    expect(
      resolveActivationFeedbackToneClass({
        config,
        emphasis: 'low',
        surfaceContext: 'onSubtle'
      })
    ).toBe('k-aft-s');
    expect(
      resolveActivationFeedbackToneClass({
        config,
        emphasis: 'medium',
        surfaceContext: 'onVivid'
      })
    ).toBe('k-aft-v');
  });

  it('uses emphasis and then default when Surface Context is absent', () => {
    expect(resolveActivationFeedbackToneClass({ config, emphasis: 'low' })).toBe('k-aft-v');
    expect(resolveActivationFeedbackToneClass({ config, emphasis: 'medium' })).toBe('k-aft-s');
  });
});
