import { useKiskadee } from '../../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../../shared/contexts/useComponentClassMap.ts';
import type { CardClassesMap } from '../Card.types.ts';

type CardGlobalConfig = ReturnType<typeof useKiskadee>['global'];

export type CardArtifactConfig = {
  cardClassesMap: CardClassesMap | undefined;
  options: {
    radius: NonNullable<CardGlobalConfig>['radius'] | undefined;
  };
};

export function useCardArtifactConfig(): CardArtifactConfig {
  const { classesMap, global } = useKiskadee();
  const cardClassesMap = useComponentClassMap(
    'card',
    classesMap.card as CardClassesMap | undefined
  );

  return {
    cardClassesMap,
    options: {
      radius: global?.radius
    }
  };
}
