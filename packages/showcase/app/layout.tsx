import type { ReactNode } from 'react';
import './globals.scss';
import '@kiskadee/react-components/style';
import AppHead from '@/components/AppHead/AppHead';
import { Providers } from './providers';
import ShowcaseChrome from './ShowcaseChrome';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Start with .no-transitions to avoid animations on the first paint.
    <html lang="en" className="no-transitions">
      <AppHead />
      <body>
        <Providers>
          <ShowcaseChrome>{children}</ShowcaseChrome>
        </Providers>
      </body>
    </html>
  );
}
