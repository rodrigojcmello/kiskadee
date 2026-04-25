import { Children, type ReactNode } from 'react';
import { extractTabValue, joinClassNames } from './Tabs.class-names';
import {
  getTabsSeparatorDimmed,
  getTabsSeparatorHidden
} from './Tabs.structural';
import type { TabsStructuralDescriptor } from './Tabs.structural';

type SeparatorState = {
  hidden?: boolean;
  dimmed?: boolean;
};

/**
 * What
 *     Builds a new children array with separator nodes inserted between adjacent box-like tabs.
 * Why
 *     Box and segmented tabs render separators as runtime-only elements, so this keeps that
 *     injection logic out of those renderers themselves.
 */
export function buildTabsChildrenWithSeparators(options: {
  children?: ReactNode;
  variant: 'line' | 'box' | 'segmented' | 'dot' | 'bridge';
  structural: TabsStructuralDescriptor;
  separator: boolean;
  separatorClassName?: string;
  getSeparatorState?: (leftValue: string, rightValue: string) => SeparatorState;
}): ReactNode[] {
  const items = Children.toArray(options.children);
  if (
    (options.variant !== 'box' && options.variant !== 'segmented') ||
    !options.separator ||
    items.length <= 1
  ) {
    return items;
  }

  const output: ReactNode[] = [];
  let previousTabValue: string | undefined;
  let separatorIndex = 0;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const currentTabValue = extractTabValue(item);

    if (currentTabValue && previousTabValue) {
      const state = options.getSeparatorState?.(previousTabValue, currentTabValue) ?? {};
      output.push(
        <span
          key={`k-tab-separator-${previousTabValue}-${currentTabValue}-${separatorIndex}`}
          aria-hidden="true"
          className={joinClassNames(
            options.separatorClassName,
            state.hidden ? getTabsSeparatorHidden(options.structural) : '',
            state.dimmed ? getTabsSeparatorDimmed(options.structural) : ''
          )}
        />
      );
      separatorIndex += 1;
    }

    output.push(item);
    if (currentTabValue) {
      previousTabValue = currentTabValue;
    }
  }

  return output;
}
