import { expect, it, vi } from 'vitest';
import { schemaColors } from '../../../presets/src/presets/material-3-google/material-3-google.colors';
import { buildSegmentArtifact } from './segmentArtifact';

it('publishes primary classification and vivid colors without palette payloads', () => {
  const result = buildSegmentArtifact(schemaColors, {
    default: ['light', 'dark'],
    purple: ['light', 'dark']
  });
  expect(result.defaultSegment).toBe('default');
  expect(result.segments.find((x) => x.id === 'default')).toMatchObject({
    name: 'Blue - Google',
    classification: { sector: 'blue' },
    vivid: { light: '#0b57d0' }
  });
  expect(result.segments.find((x) => x.id === 'purple')).toMatchObject({
    classification: { sector: 'purple-blue' },
    vivid: { light: '#6750a4' }
  });
  expect(JSON.stringify(result)).not.toMatch(/"(?:scales|components|globalSemantics)"/);
});
it('diagnoses invalid upstream classification rather than reclassifying in the builder', () => {
  const colors = structuredClone(schemaColors);
  Object.assign(colors.primitiveColors.blue.v1, {
    classification: {
      classifier: 'invalid',
      referenceHex: '#0b57d0',
      sector: 'blue',
      positionInSector: 0.5
    }
  });
  expect(() => buildSegmentArtifact(colors, {})).toThrow('Invalid primary classification');
});

it('diagnoses missing segment names explicitly', () => {
  const colors = structuredClone(schemaColors);
  Reflect.deleteProperty(colors.globalSemanticsBySegment.default, 'meta');
  expect(() => buildSegmentArtifact(colors, {})).toThrow(
    'Segment default requires a non-empty meta.name'
  );
});

it('publishes dynamic primary segments without invented static swatches', () => {
  const colors = structuredClone(schemaColors);
  Object.assign(colors.primitiveColors.blue.v1, { kind: 'dynamic' });
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const entry = buildSegmentArtifact(colors, { default: ['light', 'dark'] }).segments.find(
      (x) => x.id === 'default'
    );
    expect(entry?.vivid).toEqual({});
    expect(entry?.classification).toBeUndefined();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('dynamic or legacy'));
  } finally {
    warning.mockRestore();
  }
});
