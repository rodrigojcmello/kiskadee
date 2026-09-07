import type { ThemeMode } from '@kiskadee/core';
import { cssPaths } from '@/registry/css.registry';
import type { DesignSystemKey } from '@/registry/registry-utils';

const stylesheetLoads = new Map<string, Promise<HTMLLinkElement>>();

export function prepareStylesheet(href: string): Promise<HTMLLinkElement> {
  const cached = stylesheetLoads.get(href);
  if (cached) return cached;
  const promise = new Promise<HTMLLinkElement>((resolve, reject) => {
    const existing = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    ).find((link) => link.href === new URL(href, document.baseURI).href);
    const link = existing ?? document.createElement('link');
    if (existing?.sheet) {
      resolve(existing);
      return;
    }
    link.rel = 'stylesheet';
    link.href = href;
    if (!existing) link.media = 'not all';
    const cleanup = () => {
      link.removeEventListener('load', onLoad);
      link.removeEventListener('error', onError);
    };
    const onLoad = () => {
      cleanup();
      resolve(link);
    };
    const onError = () => {
      cleanup();
      if (!existing) link.remove();
      reject(new Error(`Failed to load stylesheet: ${href}`));
    };
    link.addEventListener('load', onLoad);
    link.addEventListener('error', onError);
    if (!existing) document.head.append(link);
  });
  stylesheetLoads.set(href, promise);
  void promise.catch(() => stylesheetLoads.delete(href));
  return promise;
}

export async function prepareSelectionStylesheets({
  designSystem,
  segment,
  theme
}: {
  designSystem: DesignSystemKey;
  segment: string;
  theme: ThemeMode;
}): Promise<HTMLLinkElement[]> {
  const entry = cssPaths[designSystem as keyof typeof cssPaths];
  const palettes = entry?.palettes as Record<string, string> | undefined;
  const tokenPalettes = entry?.tokenPalettes as Record<string, string> | undefined;
  const hrefs = [
    entry?.core,
    palettes?.[`${segment}|${theme}`],
    entry?.effects,
    entry?.tokens,
    tokenPalettes?.[`${segment}|${theme}`]
  ].filter((href): href is string => Boolean(href));
  return Promise.all([...new Set(hrefs)].map(prepareStylesheet));
}

export function activateSelectionStylesheets(links: HTMLLinkElement[]) {
  const active = new Set(links);
  for (const link of document.querySelectorAll<HTMLLinkElement>('link[data-k-selection]')) {
    if (!active.has(link)) link.media = 'not all';
  }
  for (const link of links) {
    link.dataset.kSelection = 'true';
    link.media = 'all';
  }
}
