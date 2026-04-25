import { HeadlessTabs } from '@kiskadee/react-headless';
import { joinClassNames } from '../Tabs.class-names';
import { useTabsVisualContext } from '../Tabs.context';
import { getTabsSlot } from '../Tabs.structural';
import type { TabsBarProps } from '../Tabs.types';

/**
 * What
 *     Renders segmented tabs with a fixed outer shell and an inner scrolling bar.
 * Why
 *     The segmented chrome should stay visually fixed while the tab row scrolls inside it when
 *     fixed, adaptive, or distributed widths overflow the available inline space.
 */
export function TabsSegmentedBarBase({ className, children, ...props }: TabsBarProps) {
  const { barRef, listClassName, structural, StaticEnhancer } = useTabsVisualContext();
  const content = StaticEnhancer ? <StaticEnhancer>{children}</StaticEnhancer> : children;

  return (
    <div className={joinClassNames(listClassName, className)}>
      <HeadlessTabs.Bar
        ref={barRef}
        {...props}
        className={joinClassNames(getTabsSlot(structural, 'x2'))}
      >
        {content}
      </HeadlessTabs.Bar>
    </div>
  );
}

export default TabsSegmentedBarBase;
