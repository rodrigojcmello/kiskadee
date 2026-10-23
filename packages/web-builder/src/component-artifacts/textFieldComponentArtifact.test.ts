import type { Schema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { buildTextFieldComponentArtifact } from './textFieldComponentArtifact.ts';

const contentSurfaceContext = {
  default: { light: { onVivid: { neutral: { medium: { rest: 'onSubtle' } } } } }
};
const schemaWithMode = (mode: object) =>
  ({
    components: { textField: { variants: { standard: { modes: { borderless: mode } } } } }
  }) as unknown as Schema;

describe('TextField mode metadata', () => {
  it('publishes independent region output even when the mode has no other metadata', () => {
    const contentRegionSurfaceContext = {
      default: {
        light: {
          onVivid: { neutral: { lowest: { rest: 'inherit' }, medium: { rest: 'onSubtle' } } }
        }
      }
    };
    const artifact = buildTextFieldComponentArtifact(
      schemaWithMode({ contentRegionSurfaceContext, elements: {} })
    );
    expect(artifact?.variants.standard?.modes?.borderless).toEqual({ contentRegionSurfaceContext });
    expect(artifact?.variants.standard?.modes?.borderless).not.toHaveProperty(
      'contentSurfaceContext'
    );
  });

  it('publishes a context-only mode without requiring presentation options', () => {
    const artifact = buildTextFieldComponentArtifact(
      schemaWithMode({ contentSurfaceContext, elements: {} })
    );
    expect(artifact?.variants.standard?.modes?.borderless).toEqual({ contentSurfaceContext });
    expect(artifact?.variants.standard?.modes?.borderless).not.toHaveProperty('elements');
  });

  it('preserves existing options-only payloads and omits absent context output', () => {
    const options = { labelOffset: { pill: 'input-start' } };
    expect(
      buildTextFieldComponentArtifact(schemaWithMode({ options, elements: {} }))?.variants.standard
        ?.modes?.borderless
    ).toEqual({ options });
  });

  it.each([
    'contentSurfaceContext',
    'contentRegionSurfaceContext'
  ] as const)('rejects malformed %s before publishing metadata', (key) => {
    expect(() =>
      buildTextFieldComponentArtifact(
        schemaWithMode({
          [key]: { default: { light: { unknown: {} } } },
          elements: {}
        })
      )
    ).toThrow('unrecognized surface context');
  });
});
