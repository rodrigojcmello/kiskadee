'use client';

import { useShowcase } from '@kiskadee/react-components/resources';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import style from './ShowcaseSidebar.module.scss';
import ShowcaseSidebarIcon from './ShowcaseSidebarIcon';

const navigationGroups = [
  {
    label: 'Foundations',
    entries: [
      { href: '/colors', label: 'Colors' },
      { href: '/typography', label: 'Typography / Text' },
      { href: '/icons', label: 'Icon', icon: 'icons' }
    ]
  },
  {
    label: 'Composition',
    entries: [
      { href: '/layout', label: 'Layout', icon: 'layout' },
      { href: '/card', label: 'Card', icon: 'card' },
      { href: '/separator', label: 'Separator', icon: 'separator' }
    ]
  },
  {
    label: 'Content organization',
    entries: [
      { href: '/accordion', label: 'Accordion', icon: 'accordion' },
      { href: '/tabs', label: 'Tabs', icon: 'tabs' }
    ]
  },
  {
    label: 'Actions',
    entries: [
      { href: '/button', label: 'Button', icon: 'button' },
      { href: '/brand-buttons', label: 'Brand buttons', icon: 'brand-buttons' }
    ]
  },
  {
    label: 'Fields and controls',
    entries: [
      { href: '/text-field', label: 'TextField', icon: 'text-field' },
      { href: '/select', label: 'Select', icon: 'select' },
      { href: '/slider', label: 'Slider', icon: 'slider' },
      { href: '/switch', label: 'Switch', icon: 'switch' }
    ]
  },
  {
    label: 'Menus and panels',
    entries: [
      { href: '/dropdown', label: 'Dropdown', icon: 'dropdown' },
      { href: '/bottom-sheet', label: 'BottomSheet', icon: 'bottom-sheet' }
    ]
  },
  {
    label: 'Labels and indicators',
    entries: [
      { href: '/badge', label: 'Badge', icon: 'badge' },
      { href: '/chip', label: 'Chip', icon: 'chip' },
      { href: '/progress', label: 'Progress', icon: 'progress' }
    ]
  }
] as const;

type ShowcaseSidebarEntry = (typeof navigationGroups)[number]['entries'][number];

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
        <span className={style.linkIcon} aria-hidden="true">
          {'icon' in entry ? <ShowcaseSidebarIcon name={entry.icon} active={isActive} /> : null}
        </span>
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

  return (
    <aside className={style.sidebar} aria-label="Showcase navigation">
      <div className={style.header}>
        <p className={style.eyebrow}>Navigation</p>
        <h2 className={style.title}>Showcase</h2>
      </div>
      {navigationGroups.map((group) => (
        <div key={group.label} className={style.section}>
          <h3 className={style.sectionTitle}>{group.label}</h3>
          <nav className={style.nav} aria-label={group.label}>
            <ShowcaseSidebarLinks
              entries={group.entries.filter(
                (entry) => entry.href !== '/progress' || Boolean(manifest?.components?.progress)
              )}
              onNavigate={onNavigate}
              pathname={pathname}
            />
          </nav>
        </div>
      ))}
    </aside>
  );
}
