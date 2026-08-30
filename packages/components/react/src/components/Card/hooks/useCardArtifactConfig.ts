import type { ContentSurfaceContextMap } from '@kiskadee/core';
import type {
  CardCanonicalSurfacesPayload,
  CardComponentArtifactJSON
} from '@kiskadee/web-builder/types';
import { useKiskadee } from '../../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../../shared/contexts/useComponentClassMap.ts';
import { useLoadedComponentArtifact } from '../../../shared/contexts/useLoadedComponentArtifact.ts';
import type { CardClassesMap } from '../Card.types.ts';

type CardGlobalConfig = ReturnType<typeof useKiskadee>['global'];

export type CardArtifactConfig = {
  cardClassesMap: CardClassesMap | undefined;
  contentSurfaceContext: ContentSurfaceContextMap | undefined;
  options: {
    radius: NonNullable<CardGlobalConfig>['radius'] | undefined;
    canonicalSurfaces: CardCanonicalSurfacesPayload | undefined;
  };
};

function isCardComponentArtifact(artifact: unknown): artifact is CardComponentArtifactJSON {
  return (artifact as CardComponentArtifactJSON | undefined)?.component === 'card';
}

export function useCardArtifactConfig(): CardArtifactConfig {
  const { classesMap, global } = useKiskadee();
  const { currentArtifact: cardComponentArtifact } = useLoadedComponentArtifact({
    componentName: 'card',
    isArtifact: isCardComponentArtifact
  });
  const cardClassesMap = useComponentClassMap(
    'card',
    classesMap.card as CardClassesMap | undefined
  );

  return {
    cardClassesMap,
    contentSurfaceContext: global?.components?.card?.contentSurfaceContext,
    options: {
      radius: global?.radius,
      canonicalSurfaces: cardComponentArtifact?.options.canonicalSurfaces
    }
  };
}
