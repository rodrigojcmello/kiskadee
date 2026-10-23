import type { TypographyProfileId } from '@kiskadee/core';
import type { TypographyArtifact } from '@kiskadee/web-builder/types';

export function resolveButtonReferenceProfile(
  artifact: TypographyArtifact | undefined,
  caption: TypographyProfileId
): TypographyProfileId {
  if (!artifact) return caption;
  const current = artifact.profiles[caption];
  if (!current || !Number.isFinite(current.scales.textSize) || current.scales.textSize <= 0) {
    return caption;
  }

  let selected = caption;
  let selectedSize = 0;
  for (const [id, profile] of Object.entries(artifact.profiles)) {
    const size = profile.scales.textSize;
    if (
      !Number.isFinite(size) ||
      size <= 0 ||
      size >= current.scales.textSize ||
      profile.decorations.textFont !== current.decorations.textFont ||
      profile.decorations.textWeight !== current.decorations.textWeight
    ) {
      continue;
    }

    // Equal-size profiles resolve by ID rather than artifact insertion order.
    if (size > selectedSize || (size === selectedSize && id < selected)) {
      selected = id;
      selectedSize = size;
    }
  }
  return selected;
}
