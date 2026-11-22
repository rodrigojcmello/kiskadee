import {
  type Color,
  isButtonDerivedContentSurfaceContext,
  isDerivedContainerComponent,
  type Schema
} from '@kiskadee/core';
import { schema as fluent } from '@kiskadee/presets/src/presets/fluent-2-microsoft/index.ts';
import { describe, expect, it } from 'vitest';
import { buildSurfaceContextsArtifact } from './artifact.ts';
import { resolveButtonContentSurfaceContext } from './derive.ts';

function lightPaint(schema: Schema) {
  return schema.components.button!.elements.e1!.palettes!.default!.light!;
}

describe('Button content surface derivation', () => {
  it('derives every Fluent theme and segment with its supported variants', () => {
    const source = fluent.components.button!.contentSurfaceContext;
    expect(isButtonDerivedContentSurfaceContext(source)).toBe(true);
    if (!isButtonDerivedContentSurfaceContext(source)) throw new Error('Expected binding');
    const output = resolveButtonContentSurfaceContext(fluent)!;
    for (const segment of ['default', 'teams'] as const) {
      const light = output[segment]!.light!;
      expect(light.onSubtle!.standard.primary!.medium).toEqual({ rest: 'onSubtle' });
      expect(light.onSubtle!.standard.primary!.high).toMatchObject({
        rest: 'onVivid',
        pending: 'onSubtle'
      });
      expect(light.onVivid!.standard.primary!.high).toMatchObject({
        rest: 'onSubtle',
        disabled: 'onVivid'
      });
      expect(light.onVivid!.alternative!.primary!.high!.rest).toBe('onSubtle');
      expect(light.onVivid!.alternative!.neutral!.low).toEqual(
        light.onVivid!.standard.neutral!.low
      );
      expect(light.onSubtle!.alternative).toBeUndefined();
      for (const theme of ['dark', 'darker'] as const) {
        const { onSubtle, onVivid } = output[segment]![theme]!;
        // A white High fill is above the fixed black cutoff in both dark themes.
        expect(onVivid!.standard.primary!.high!.rest).toBe('onVivid');
        expect(onVivid!.alternative!.neutral!.low).toEqual(onVivid!.standard.neutral!.low);
        expect(onSubtle!.alternative).toBeUndefined();
      }
    }

    const artifact = buildSurfaceContextsArtifact({
      key: 'fluent-2-microsoft',
      schema: fluent,
      schemaPath: 'fluent-2-microsoft.schema.ts'
    });
    expect(artifact.components.button!.regions!.e1!.output).toEqual(output);
    expect(fluent.components.button!.contentSurfaceContext).toBe(source);
  });

  it('composites Dark and Darker over their own backdrops and measures against absolute black', () => {
    const output = resolveButtonContentSurfaceContext(fluent)!.default!;
    // The same Medium alpha fill composes to #1760a0 in Dark and #244f7c in Darker.
    expect(output.dark!.onVivid!.standard.primary!.medium).toMatchObject({ rest: 'onVivid' });
    expect(output.darker!.onVivid!.standard.primary!.medium).toMatchObject({ rest: 'onSubtle' });
  });

  it('distinguishes colors around the cutoff, transparency, and the two alpha backdrops', () => {
    const schema = structuredClone(fluent);
    const { onSubtle, onVivid } = lightPaint(schema);
    const subtle = onSubtle.standard.boxColor!.primary!;
    const vivid = onVivid!.standard.boxColor!.primary!;
    subtle.high = { rest: '#949494', selected: { rest: '#959595' } };
    subtle.medium = { rest: '#00000005' };
    vivid.medium = { rest: '#00000005' };
    subtle.low = { rest: '#fff0', pending: { ref: undefined } };
    delete subtle.lowest; // The border recipe still declares this coordinate.
    onSubtle.standard.borderColor!.primary!.lowest = { rest: '#ffffff' };

    const output = resolveButtonContentSurfaceContext(schema)!.default!.light!;
    expect(output.onSubtle!.standard.primary).toMatchObject({
      high: { rest: 'onVivid', selected: 'onSubtle' },
      medium: { rest: 'onSubtle' },
      low: { rest: 'inherit' },
      lowest: { rest: 'inherit' }
    });
    expect(output.onVivid!.standard.primary!.medium).toEqual({ rest: 'onVivid' });
  });

  it('inherits the entire Standard recipe but never its states inside an authored Alternative', () => {
    const schema = structuredClone(fluent);
    const { standard, alternative } = lightPaint(schema).onVivid!;
    standard.boxColor!.primary!.high = {
      rest: '#ffffff',
      selected: { rest: '#000000' },
      pending: '#000000',
      disabled: '#000000'
    };
    alternative!.boxColor!.primary!.high = { rest: '#ffffff' };
    delete alternative!.boxColor!.neutral!.high;

    const output = resolveButtonContentSurfaceContext(schema)!.default!.light!.onVivid!;
    expect(output.standard.primary!.high).toEqual({
      rest: 'onSubtle',
      selected: 'onVivid',
      pending: 'onVivid',
      disabled: 'onVivid'
    });
    expect(output.alternative!.primary!.high).toEqual({ rest: 'onSubtle' });
    expect(output.alternative!.neutral!.high).toEqual(output.standard.neutral!.high);
  });

  it('composites over the marked subtle backdrop and measures against absolute white', () => {
    const schema = structuredClone(fluent);
    lightPaint(schema).onSubtle.standard.boxColor!.primary!.high = {
      rest: '#949494',
      pending: '#0000006a'
    };
    const deriveHigh = () =>
      resolveButtonContentSurfaceContext(schema)!.default!.light!.onSubtle!.standard.primary!.high;

    // The translucent fill composes to #959595 over white, just below 3:1.
    expect(deriveHigh()).toEqual({ rest: 'onVivid', pending: 'onSubtle' });
    const catalog = schema.components.container!.options!.canonicalSurfaces!.default!.light!;
    catalog.find((entry) => entry.referenceFor === 'onSubtle')!.referenceFor = undefined;
    catalog.find((entry) => entry.intent === 'neutral' && entry.emphasis === 'low')!.referenceFor =
      'onSubtle';

    // Over #fbfbfb the translucent fill composes to #939393, above 3:1 against white.
    expect(deriveHigh()).toEqual({ rest: 'onVivid' });
  });

  it.each<Color>([
    'var(--unresolved)',
    {
      kind: 'linear',
      angle: 90,
      stops: [
        { color: '#fff', position: 0 },
        { color: '#000', position: 100 }
      ]
    }
  ])('preserves unresolved paint %j as an explicit diagnostic and inherited context', (paint) => {
    const schema = structuredClone(fluent);
    lightPaint(schema).onSubtle.standard.boxColor!.primary!.high!.rest = structuredClone(paint);
    const artifact = buildSurfaceContextsArtifact({ key: 'test', schema, schemaPath: 'test.ts' });
    expect(artifact.diagnostics).toContainEqual({
      path: 'components.button.elements.e1.palettes.default.light.onSubtle.standard.boxColor.primary.high.rest',
      reason: typeof paint === 'string' ? 'runtime-color' : 'mixed-gradient'
    });
    expect(
      artifact.components.button!.regions!.e1!.output!.default!.light!.onSubtle!.standard.primary!
        .high!.rest
    ).toBe('inherit');
  });

  it('requires one opaque reference per context in each derived segment and theme', () => {
    const schema = structuredClone(fluent);
    const container = schema.components.container!;
    if (!isDerivedContainerComponent(container)) throw new Error('Expected derived Container');
    const references = container.options!.canonicalSurfaces!.teams!.darker!;
    container.options!.canonicalSurfaces!.teams!.darker = references.filter(
      ({ referenceFor }) => referenceFor !== 'onVivid'
    );
    expect(() =>
      buildSurfaceContextsArtifact({ key: 'test', schema, schemaPath: 'test.ts' })
    ).toThrow(/canonicalSurfaces\.teams\.darker.*onVivid/);
    container.options!.canonicalSurfaces!.teams!.darker = references;
    container.elements.e1.palettes!.teams!.darker!.onSubtle.standard.boxColor.primary!
      .highest!.rest = '#34386f80';
    expect(() =>
      buildSurfaceContextsArtifact({ key: 'test', schema, schemaPath: 'test.ts' })
    ).toThrow(/canonicalSurfaces\.teams\.darker.*opaque/);
  });
});
