'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import style from './ShowcaseSidebar.module.scss';

const componentEntries = [
  {
    href: '/button',
    label: 'Button'
  },
  {
    href: '/card',
    label: 'Card'
  },
  {
    href: '/icons',
    label: 'Icon'
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

type ShowcaseSidebarEntry = (typeof componentEntries)[number];

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

  return (
    <aside className={style.sidebar} aria-label="Showcase navigation">
      <div className={style.header}>
        <p className={style.eyebrow}>Components</p>
        <h2 className={style.title}>Showcase</h2>
      </div>
      <nav className={style.nav}>
        <ShowcaseSidebarLinks
          entries={componentEntries}
          onNavigate={onNavigate}
          pathname={pathname}
        />
      </nav>
    </aside>
  );
}
