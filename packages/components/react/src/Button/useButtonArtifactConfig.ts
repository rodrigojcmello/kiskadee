import { useKiskadee } from '../contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../contexts/useComponentClassMap.ts';
import type { ButtonClassesMap } from './Button.types.ts';

export type ButtonArtifactConfig = {
  buttonClassesMap: ButtonClassesMap | undefined;
};

export function useButtonArtifactConfig(): ButtonArtifactConfig {
  const { classesMap } = useKiskadee();
  const buttonClassesMap = useComponentClassMap(
    'button',
    classesMap.button as ButtonClassesMap | undefined
  );

  return {
    buttonClassesMap
  };
}
