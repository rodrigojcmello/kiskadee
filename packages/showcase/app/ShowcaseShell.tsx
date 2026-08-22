'use client';

import { FamilyResolvedIcon } from '@kiskadee/react-components';
import { usePathname } from 'next/navigation';
import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ShowcaseIconFamilyBoundary,
  ShowcaseSidebarToggleGlyph
} from '@/components/ShowcaseIconFamily/ShowcaseIconFamily';
import ShowcaseSidebar from '@/components/ShowcaseSidebar/ShowcaseSidebar';
import { useCanonicalCardSurfaces } from '@/hooks/use-canonical-card-surfaces';
import style from './layout.module.scss';
import type { ShowcasePanelDetail } from './ShowcasePanelContext';
import { ShowcasePanelContext } from './ShowcasePanelContext';

export default function ShowcaseShell({
  children,
  globalControls,
  isDesktopSidebarVisible,
  onDesktopSidebarVisibilityChange
}: {
  children: ReactNode;
  globalControls?: ReactNode;
  isDesktopSidebarVisible: boolean;
  onDesktopSidebarVisibilityChange: Dispatch<SetStateAction<boolean>>;
}) {
  const pathname = usePathname();
  const canonicalSurfaces = useCanonicalCardSurfaces();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [panelDetail, setPanelDetail] = useState<ShowcasePanelDetail | null>(null);
  const [panelMode, setPanelMode] = useState<'components' | 'detail'>('detail');
  const [panelSlotElement, setPanelSlotElement] = useState<HTMLElement | null>(null);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 960px)');
    const handleChange = () => {
      setIsNarrowViewport(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
    setPanelMode('detail');
  }, [pathname]);

  const registerPanelDetail = useCallback((detail: ShowcasePanelDetail) => {
    setPanelDetail(detail);
  }, []);

  const clearPanelDetail = useCallback((id: string) => {
    setPanelDetail((currentDetail) => (currentDetail?.id === id ? null : currentDetail));
  }, []);

  const showComponentsPanel = useCallback(() => {
    setPanelMode('components');
  }, []);

  const showDetailPanel = useCallback(() => {
    if (panelDetail) {
      setPanelMode('detail');
    }
  }, [panelDetail]);

  const setRoutePanelSlot = useCallback((node: HTMLDivElement | null) => {
    setPanelSlotElement(node);
  }, []);

  const contextValue = useMemo(
    () => ({
      panelDetail,
      panelSlotElement,
      registerPanelDetail,
      clearPanelDetail,
      showComponentsPanel,
      showDetailPanel
    }),
    [
      clearPanelDetail,
      panelDetail,
      panelSlotElement,
      registerPanelDetail,
      showComponentsPanel,
      showDetailPanel
    ]
  );

  const isDetailPanelVisible = Boolean(panelDetail && panelMode === 'detail');
  const shouldShowGlobalControls =
    isDetailPanelVisible && panelDetail?.showGlobalControls !== false && Boolean(globalControls);
  const menuLabel = isDetailPanelVisible ? 'Controls' : 'Navigation';
  const menuAriaLabel = isSidebarOpen
    ? `Close ${menuLabel.toLowerCase()} panel`
    : `Open ${menuLabel.toLowerCase()} panel`;

  const handleSidebarNavigate = useCallback(
    (_href: string, isActive: boolean) => {
      if (isActive && panelDetail) {
        setPanelMode('detail');
        return;
      }

      setIsSidebarOpen(false);
    },
    [panelDetail]
  );

  const sidebarContent = isDetailPanelVisible ? (
    <aside
      className={style.routePanel}
      aria-label={`${panelDetail?.title ?? 'Component'} controls`}
    >
      <div className={style.routePanelTopbar}>
        <button type="button" className={style.backButton} onClick={showComponentsPanel}>
          <span className={style.backButtonIcon}>
            <FamilyResolvedIcon name="chevron-left" />
          </span>
          <span>Navigation</span>
        </button>
      </div>
      <div className={style.routePanelHeader}>
        <p className={style.routePanelEyebrow}>{panelDetail?.eyebrow}</p>
        <h2 className={style.routePanelTitle}>{panelDetail?.title}</h2>
      </div>
      {shouldShowGlobalControls ? (
        <div className={style.routeGlobalControls}>{globalControls}</div>
      ) : null}
      <div ref={setRoutePanelSlot} className={style.routePanelSlot} />
    </aside>
  ) : (
    <ShowcaseSidebar onNavigate={handleSidebarNavigate} />
  );
  const fixedFamilySidebarContent = (
    <ShowcaseIconFamilyBoundary>{sidebarContent}</ShowcaseIconFamilyBoundary>
  );
  const defaultRouteBackground =
    canonicalSurfaces.tones[1]?.resolvedColor ?? canonicalSurfaces.tones[0]?.resolvedColor;
  const shellStyle = defaultRouteBackground
    ? ({ '--showcase-default-route-background': defaultRouteBackground } as CSSProperties)
    : undefined;

  return (
    <ShowcasePanelContext.Provider value={contextValue}>
      <div
        className={`${style.shell} ${
          isDesktopSidebarVisible ? '' : style.shellWithoutSidebar
        }`.trim()}
        style={shellStyle}
      >
        {!isNarrowViewport ? (
          <ShowcaseIconFamilyBoundary>
            <button
              type="button"
              className={style.desktopSidebarToggle}
              aria-controls="showcase-desktop-sidebar"
              aria-expanded={isDesktopSidebarVisible}
              aria-label={isDesktopSidebarVisible ? 'Hide controls panel' : 'Show controls panel'}
              onClick={() => onDesktopSidebarVisibilityChange((value) => !value)}
            >
              <ShowcaseSidebarToggleGlyph expanded={isDesktopSidebarVisible} />
            </button>
          </ShowcaseIconFamilyBoundary>
        ) : null}

        <div className={style.contentColumn}>
          <ShowcaseIconFamilyBoundary>
            <div className={style.mobileHeader}>
              <button
                type="button"
                className={style.menuButton}
                onClick={() => setIsSidebarOpen((value) => !value)}
                aria-expanded={isSidebarOpen}
                aria-controls="showcase-sidebar-drawer"
                aria-label={menuAriaLabel}
              >
                <span className={style.menuButtonIcon}>
                  <FamilyResolvedIcon name="menu" />
                </span>
                <span>{menuLabel}</span>
              </button>
            </div>
          </ShowcaseIconFamilyBoundary>

          <div className={style.content}>
            <div className={style.contentInner}>{children}</div>
          </div>
        </div>

        {!isNarrowViewport ? (
          <div
            id="showcase-desktop-sidebar"
            className={`${style.desktopSidebar} ${
              isDesktopSidebarVisible ? '' : style.desktopSidebarHidden
            }`.trim()}
            aria-hidden={isDesktopSidebarVisible ? undefined : 'true'}
          >
            {fixedFamilySidebarContent}
          </div>
        ) : null}

        {isNarrowViewport ? (
          <>
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
                  aria-label={`Close ${menuLabel.toLowerCase()} panel`}
                >
                  Close
                </button>
              </div>
              <div className={style.mobilePanelContent}>{fixedFamilySidebarContent}</div>
            </div>
          </>
        ) : null}
      </div>
    </ShowcasePanelContext.Provider>
  );
}
