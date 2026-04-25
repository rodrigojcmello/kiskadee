import type { ReactNode } from 'react';
import './globals.scss';
import '@kiskadee/react-components/style';
import AppHead from '@/components/AppHead/AppHead';
import DesignSystemToolbarWithColorScale from '@/components/DesignSystemToolbar/DesignSystemToolbarWithColorScale';
import ShowcaseShell from './ShowcaseShell';
import style from './layout.module.scss';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Start with .no-transitions to avoid animations on the first paint.
    <html lang="en" className="no-transitions">
      <AppHead />
      <body>
        <Providers>
          <div className={style.layout}>
            <DesignSystemToolbarWithColorScale />
            <ShowcaseShell>{children}</ShowcaseShell>
          </div>
        </Providers>
      </body>
    </html>
  );
}
