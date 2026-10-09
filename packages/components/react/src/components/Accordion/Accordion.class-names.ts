import type { AccordionElementName } from '@kiskadee/core';
import {
  joinClassNames,
  resolveSchemaElementClassName
} from '../../shared/class-resolution/classNames.ts';
import type { AccordionClassesMap } from './Accordion.types.ts';
export function resolveAccordionClassNames(
  map: AccordionClassesMap | undefined,
  supplied: Partial<Record<AccordionElementName, string>> = {}
) {
  return Object.fromEntries(
    (['e1', 'e2', 'e3', 'e4', 'e5', 'e6'] as const).map((slot) => [
      slot,
      joinClassNames(
        `k-acc-${slot}`,
        resolveSchemaElementClassName(map?.[slot], {
          scale: 'md:1',
          intent: undefined,
          emphasis: undefined
        }),
        supplied[slot]
      )
    ])
  ) as Record<AccordionElementName, string>;
}
