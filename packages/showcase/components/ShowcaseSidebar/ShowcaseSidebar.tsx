'use client';

import { useShowcase } from '@kiskadee/react-components/resources';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import style from './ShowcaseSidebar.module.scss';
import ShowcaseSidebarIcon from './ShowcaseSidebarIcon';

const showcaseEntries = (
  [
    { href: '/accordion', label: 'Accordion', icon: 'accordion' },
    { href: '/badge', label: 'Badge', icon: 'badge' },
    { href: '/bottom-sheet', label: 'BottomSheet', icon: 'bottom-sheet' },
    { href: '/brand-buttons', label: 'Brand buttons', icon: 'brand-buttons' },
    { href: '/button', label: 'Button', icon: 'button' },
    { href: '/card', label: 'Card', icon: 'card' },
    { href: '/chip', label: 'Chip', icon: 'chip' },
    { href: '/colors', label: 'Colors' },
    { href: '/dropdown', label: 'Dropdown', icon: 'dropdown' },
    { href: '/icons', label: 'Icon', icon: 'icons' },
    { href: '/layout', label: 'Layout', icon: 'layout' },
    { href: '/progress', label: 'Progress', icon: 'progress' },
    { href: '/select', label: 'Select', icon: 'select' },
    { href: '/separator', label: 'Separator', icon: 'separator' },
    { href: '/slider', label: 'Slider', icon: 'slider' },
    { href: '/switch', label: 'Switch', icon: 'switch' },
    { href: '/tabs', label: 'Tabs', icon: 'tabs' },
    { href: '/text-field', label: 'TextField', icon: 'text-field' },
    { href: '/typography', label: 'Typography / Text' }
  ] as const
).toSorted((left, right) => left.label.localeCompare(right.label, 'en'));

const navigationEntries = [
  { href: '/component-audit', label: 'Component audit' },
  ...showcaseEntries
] as const;

type ShowcaseSidebarEntry = (typeof navigationEntries)[number];

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
      <nav className={style.nav} aria-label="Showcase pages">
        <ShowcaseSidebarLinks
          entries={navigationEntries.filter(
            (entry) => entry.href !== '/progress' || Boolean(manifest?.components?.progress)
          )}
          onNavigate={onNavigate}
          pathname={pathname}
        />
      </nav>
    </aside>
  );
}
