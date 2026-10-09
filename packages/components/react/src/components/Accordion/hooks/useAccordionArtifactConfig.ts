import { useKiskadee } from '../../../shared/contexts/KiskadeeContext.tsx';
import { useComponentClassMap } from '../../../shared/contexts/useComponentClassMap.ts';
import type { ComponentMetadata } from '../../../shared/contexts/useComponentMetadata.ts';
import { useLoadedComponentArtifact } from '../../../shared/contexts/useLoadedComponentArtifact.ts';

const isAccordion = (value: unknown): value is ComponentMetadata<'accordion'> =>
  Boolean(
    value && typeof value === 'object' && 'component' in value && value.component === 'accordion'
  );

import type { AccordionClassesMap } from '../Accordion.types.ts';
export function useAccordionArtifactConfig() {
  const { classesMap, theme } = useKiskadee();
  const { currentArtifact: metadata } = useLoadedComponentArtifact({
    componentName: 'accordion',
    isArtifact: isAccordion
  });
  const config = metadata;
  const map = useComponentClassMap(
    'accordion',
    classesMap.accordion as AccordionClassesMap | undefined
  );
  return {
    map,
    options: config?.options,
    supported: config?.options?.themes.includes(theme as 'light') === true,
    timing: config?.effects?.presence?.profiles['grow-height']
  };
}
