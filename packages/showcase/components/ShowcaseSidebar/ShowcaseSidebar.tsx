'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import style from './ShowcaseSidebar.module.scss';

const entries = [
  {
    href: '/button',
    label: 'Button'
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
    href: '/switch-v2',
    label: 'Switch V2'
  },
  {
    href: '/text-field',
    label: 'TextField'
  }
] as const;

export default function ShowcaseSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={style.sidebar} aria-label="Component navigation">
      <div className={style.header}>
        <p className={style.eyebrow}>Components</p>
        <h2 className={style.title}>Showcase</h2>
      </div>
      <nav className={style.nav}>
        {entries.map((entry) => {
          const isActive = pathname === entry.href || pathname.startsWith(`${entry.href}/`);

          return (
            <Link
              key={entry.href}
              href={entry.href}
              onClick={onNavigate}
              className={`${style.link} ${isActive ? style.active : ''}`.trim()}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={style.linkLabel}>{entry.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
