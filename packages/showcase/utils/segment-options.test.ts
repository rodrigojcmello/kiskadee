import type { SegmentArtifact, SegmentArtifactEntry } from '@kiskadee/web-builder/types';
import { expect, it } from 'vitest';
import { orderSegments } from './segment-options';

const entry = (id: string, sector: string | null, position = 0): SegmentArtifactEntry => ({
  id,
  name: id,
  vivid: {},
  classification: {
    classifier: 'test',
    referenceHex: '#000000',
    sector,
    positionInSector: position
  }
});
it('rotates sectors around default and sorts peers without changing source order', () => {
  const artifact: SegmentArtifact = {
    version: 1,
    defaultSegment: 'default',
    sectorOrder: ['red', 'blue', 'purple'],
    segments: [
      entry('red', 'red'),
      entry('blue2', 'blue', 0.8),
      entry('gray', null),
      entry('purple', 'purple'),
      entry('default', 'blue', 0.5),
      entry('blue1', 'blue', 0.1)
    ]
  };
  expect(orderSegments(artifact).map((x) => x.id)).toEqual([
    'default',
    'blue1',
    'blue2',
    'purple',
    'red',
    'gray'
  ]);
  expect(artifact.segments[0].id).toBe('red');
  artifact.segments.forEach((x) => {
    x.vivid.dark = '#333333';
  });
  expect(orderSegments(artifact).map((x) => x.id)).toEqual([
    'default',
    'blue1',
    'blue2',
    'purple',
    'red',
    'gray'
  ]);
});
it('keeps unclassified segments deterministic, and default first when achromatic', () => {
  const artifact: SegmentArtifact = {
    version: 1,
    defaultSegment: 'default',
    sectorOrder: ['red', 'blue'],
    segments: [entry('z', null), entry('b', 'blue'), entry('default', null), entry('a', null)]
  };
  expect(orderSegments(artifact).map((x) => x.id)).toEqual(['default', 'b', 'a', 'z']);
});
