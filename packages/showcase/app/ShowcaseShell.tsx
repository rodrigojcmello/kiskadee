'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ShowcaseSidebar from '@/components/ShowcaseSidebar/ShowcaseSidebar';
import style from './layout.module.scss';

export default function ShowcaseShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className={style.shell}>
      <div className={style.contentColumn}>
        <div className={style.mobileHeader}>
          <button
            type="button"
            className={style.menuButton}
            onClick={() => setIsSidebarOpen((value) => !value)}
            aria-expanded={isSidebarOpen}
            aria-controls="showcase-sidebar-drawer"
            aria-label={isSidebarOpen ? 'Close component menu' : 'Open component menu'}
          >
            <span className={style.menuButtonIcon} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>Components</span>
          </button>
        </div>

        <div className={style.content}>
          <div className={style.contentInner}>{children}</div>
        </div>
      </div>

      <div className={style.desktopSidebar}>
        <ShowcaseSidebar />
      </div>

      <div
        className={`${style.mobileBackdrop} ${isSidebarOpen ? style.mobileBackdropVisible : ''}`.trim()}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={isSidebarOpen ? 'false' : 'true'}
      />

      <div
        id="showcase-sidebar-drawer"
        className={`${style.mobileSidebar} ${isSidebarOpen ? style.mobileSidebarOpen : ''}`.trim()}
      >
        <div className={style.mobileSidebarHeader}>
          <button
            type="button"
            className={style.closeButton}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close component menu"
          >
            Close
          </button>
        </div>
        <ShowcaseSidebar onNavigate={() => setIsSidebarOpen(false)} />
      </div>
    </div>
  );
}
