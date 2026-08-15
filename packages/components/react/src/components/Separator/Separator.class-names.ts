import type { ClassNameByElementJSON } from '@kiskadee/core';
import {
  joinClassNames,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';

export function resolveSeparatorClassName(
  element: ClassNameByElementJSON | undefined,
  consumerClassName?: string
): string {
  return (
    joinClassNames(
      resolveSchemaElementClassName(element, {
        intent: 'neutral',
        emphasis: 'medium'
      }),
      element?.s?.all,
      'k-sep',
      'k-sep-e1',
      consumerClassName
    ) ?? ''
  );
}
