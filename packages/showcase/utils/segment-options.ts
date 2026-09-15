import type { SegmentArtifact, SegmentArtifactEntry } from '@kiskadee/web-builder/types';

/** Viewer policy: rotate the generator's circular order around the default primary. */
export function orderSegments(artifact: SegmentArtifact): SegmentArtifactEntry[] {
  const defaultEntry = artifact.segments.find((entry) => entry.id === artifact.defaultSegment);
  const start = Math.max(
    0,
    artifact.sectorOrder.indexOf(defaultEntry?.classification?.sector ?? '')
  );
  const rank = (entry: SegmentArtifactEntry) => {
    const index = artifact.sectorOrder.indexOf(entry.classification?.sector ?? '');
    return index < 0
      ? artifact.sectorOrder.length
      : (index - start + artifact.sectorOrder.length) % artifact.sectorOrder.length;
  };
  return [...artifact.segments].sort((a, b) => {
    if (a.id === artifact.defaultSegment) return -1;
    if (b.id === artifact.defaultSegment) return 1;
    return (
      rank(a) - rank(b) ||
      (a.classification?.positionInSector ?? 0) - (b.classification?.positionInSector ?? 0) ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    );
  });
}
