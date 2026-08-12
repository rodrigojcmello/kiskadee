import type { ReactNode } from 'react';
import './globals.scss';
import '@kiskadee/react-components/style';
import { Providers } from './providers';
import ShowcaseChrome from './ShowcaseChrome';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Start with .no-transitions to avoid animations on the first paint.
    <html lang="en" className="no-transitions">
      <body>
        {process.env.NODE_ENV === 'development' ? (
          // Browser inspection tooling may claim the first body div before
          // React hydrates. Isolate that external mutation from the app root.
          <div hidden aria-hidden="true" suppressHydrationWarning />
        ) : null}
        <Providers>
          <ShowcaseChrome>{children}</ShowcaseChrome>
        </Providers>
      </body>
    </html>
  );
}
