'use client';

import { useShowcase } from '@kiskadee/react-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import style from './ShowcaseSidebar.module.scss';

const foundationEntries = [
  {
    href: '/colors',
    label: 'Colors'
  },
  {
    href: '/typography',
    label: 'Typography / Text'
  }
] as const;

const componentEntries = [
  {
    href: '/badge',
    label: 'Badge'
  },
  {
    href: '/button',
    label: 'Button'
  },
  {
    href: '/brand-buttons',
    label: 'Brand buttons'
  },
  {
    href: '/bottom-sheet',
    label: 'BottomSheet'
  },
  {
    href: '/card',
    label: 'Card'
  },
  {
    href: '/chip',
    label: 'Chip'
  },
  {
    href: '/dropdown',
    label: 'Dropdown'
  },
  {
    href: '/icons',
    label: 'Icon'
  },
  {
    href: '/progress',
    label: 'Progress'
  },
  {
    href: '/select',
    label: 'Select'
  },
  {
    href: '/separator',
    label: 'Separator'
  },
  {
    href: '/slider',
    label: 'Slider'
  },
  {
    href: '/tabs',
    label: 'Tabs'
  },
  {
    href: '/switch',
    label: 'Switch'
  },
  {
    href: '/text-field',
    label: 'TextField'
  }
] as const;

type ShowcaseSidebarEntry = (typeof foundationEntries)[number] | (typeof componentEntries)[number];

function ShowcaseSidebarLinks({
  entries,
  onNavigate,
  pathname
}: {
  entries: readonly ShowcaseSidebarEntry[];
  onNavigate?: (href: ShowcaseSidebarEntry['href'], isActive: boolean) => void;
  pathname: string;
}) {
  return entries.map((entry) => {
    const isActive = pathname === entry.href || pathname.startsWith(`${entry.href}/`);

    return (
      <Link
        key={entry.href}
        href={entry.href}
        onClick={() => onNavigate?.(entry.href, isActive)}
        className={`${style.link} ${isActive ? style.active : ''}`.trim()}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className={style.linkLabel}>{entry.label}</span>
      </Link>
    );
  });
}

export default function ShowcaseSidebar({
  onNavigate
}: {
  onNavigate?: (href: ShowcaseSidebarEntry['href'], isActive: boolean) => void;
}) {
  const pathname = usePathname();
  const { manifest } = useShowcase();
  const visibleComponentEntries = componentEntries.filter(
    (entry) => entry.href !== '/progress' || Boolean(manifest?.components?.progress)
  );

  return (
    <aside className={style.sidebar} aria-label="Showcase navigation">
      <div className={style.header}>
        <p className={style.eyebrow}>Navigation</p>
        <h2 className={style.title}>Showcase</h2>
      </div>
      <div className={style.section}>
        <p className={style.sectionTitle}>Foundations</p>
        <nav className={style.nav} aria-label="Foundations">
          <ShowcaseSidebarLinks
            entries={foundationEntries}
            onNavigate={onNavigate}
            pathname={pathname}
          />
        </nav>
      </div>
      <div className={style.section}>
        <p className={style.sectionTitle}>Components</p>
        <nav className={style.nav} aria-label="Components">
          <ShowcaseSidebarLinks
            entries={visibleComponentEntries}
            onNavigate={onNavigate}
            pathname={pathname}
          />
        </nav>
      </div>
    </aside>
  );
}
