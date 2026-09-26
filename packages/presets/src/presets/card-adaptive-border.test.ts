import {
  isContourReferenceCandidate,
  resolveCardSurfaceSource,
  resolveContourReference,
  validateCardComponentContract
} from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { schema as carbon } from './carbon-ibm/carbon-ibm.schema.ts';
import { schema as elegant } from './elegant/elegant.schema.ts';
import { schema as fluent } from './fluent-2-microsoft/fluent-2-microsoft.schema.ts';
import { schema as ios } from './ios-27-apple/ios-27-apple.schema.ts';
import { schema as material } from './material-3-google/material-3-google.schema.ts';
import { schema as sandbox } from './sandbox/sandbox.schema.ts';
import { schema as sandbox2 } from './sandbox-2/sandbox-2.schema.ts';
import { schema as sandbox3 } from './sandbox-3/sandbox-3.schema.ts';

describe('Card border policy migration', () => {
  it.each([
    ['Carbon', carbon],
    ['Elegant', elegant],
    ['Fluent', fluent],
    ['iOS 27', ios],
    ['Material', material],
    ['Sandbox', sandbox],
    ['Sandbox 2', sandbox2],
    ['Sandbox 3', sandbox3]
  ] as const)('%s publishes a complete adaptive policy', (_name, schema) => {
    const card = resolveCardSurfaceSource(schema).components.card;
    expect(card?.options?.border?.defaultMode).toBe('adaptive');
    expect(validateCardComponentContract(card)).toEqual([]);
  });

  it('keeps borderless Rest defaults while exposing an existing visible manual recipe', () => {
    for (const [schema, intent, emphasis] of [
      [carbon, 'primary', 'highest'],
      [ios, 'primary', 'high'],
      [sandbox, 'neutral', 'medium'],
      [sandbox2, 'primary', 'medium'],
      [sandbox3, 'neutral', 'lowest']
    ] as const) {
      const card = resolveCardSurfaceSource(schema).components.card!;
      const policy = card.options!.border!.adaptive.default!.light!.onSubtle![intent]![emphasis];
      const rest =
        card.elements.e1!.palettes!.default!.light!.onSubtle.borderColor![intent]![emphasis]!.rest;
      expect(policy).toBe(false);
      const color = isContourReferenceCandidate(rest)
        ? resolveContourReference(rest, 'default', schema.global?.contours)
        : rest;
      expect(color).toMatch(/^#[0-9a-f]{6}(?!00$)(?:[0-9a-f]{2})?$/i);
    }
  });
});
