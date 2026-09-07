import type { ClassNameByElementJSON, ComponentEmphasis, SurfaceContext } from '@kiskadee/core';
import {
  joinClassNames,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';

export function resolveSeparatorClassName(
  element: ClassNameByElementJSON | undefined,
  consumerClassName?: string,
  emphasis: ComponentEmphasis = 'medium',
  surfaceContext: SurfaceContext = 'onSubtle'
): string {
  return (
    joinClassNames(
      resolveSchemaElementClassName(element, {
        intent: 'neutral',
        emphasis,
        surfaceContext
      }),
      element?.s?.all,
      'k-sep',
      'k-sep-e1',
      consumerClassName
    ) ?? ''
  );
}
