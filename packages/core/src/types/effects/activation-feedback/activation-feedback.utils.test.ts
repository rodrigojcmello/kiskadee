import { describe, expect, it } from 'vitest';
import { mergeActivationFeedbackConfig } from './activation-feedback.utils.ts';

describe('activation feedback config merging', () => {
  it('deep-merges emphasis and Surface Context tone projections independently', () => {
    const merged = mergeActivationFeedbackConfig(
      {
        visual: {
          tone: {
            default: 'subtle',
            byEmphasis: {
              medium: 'subtle'
            },
            bySurfaceContext: {
              onSubtle: 'subtle'
            }
          }
        }
      },
      {
        visual: {
          tone: {
            byEmphasis: {
              low: 'vivid'
            },
            bySurfaceContext: {
              onVivid: 'vivid'
            }
          }
        }
      }
    );

    expect(merged?.visual?.tone).toEqual({
      default: 'subtle',
      byEmphasis: {
        medium: 'subtle',
        low: 'vivid'
      },
      bySurfaceContext: {
        onSubtle: 'subtle',
        onVivid: 'vivid'
      }
    });
  });
});
