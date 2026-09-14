import type { ThemeMode } from '@kiskadee/core';
import { cssPaths } from '@/registry/css.registry';
import type { DesignSystemKey } from '@/registry/registry-utils';

const stylesheetLoads = new Map<string, Promise<HTMLLinkElement>>();

export function prepareStylesheet(href: string, sha256?: string): Promise<HTMLLinkElement> {
  const integrity = sha256
    ? `sha256-${btoa(String.fromCharCode(...sha256.match(/../g)!.map((byte) => parseInt(byte, 16))))}`
    : undefined;
  const key = `${href}|${integrity ?? ''}`;
  const cached = stylesheetLoads.get(key);
  if (cached) return cached;
  const promise = new Promise<HTMLLinkElement>((resolve, reject) => {
    let existing = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    ).find((link) => link.href === new URL(href, document.baseURI).href);
    if (existing && integrity && existing.integrity !== integrity) {
      existing.remove();
      existing = undefined;
    }
    const link = existing ?? document.createElement('link');
    if (existing?.sheet && (!integrity || existing.integrity === integrity)) {
      resolve(existing);
      return;
    }
    link.rel = 'stylesheet';
    if (integrity) {
      link.integrity = integrity;
      link.crossOrigin = 'anonymous';
    }
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
  stylesheetLoads.set(key, promise);
  void promise.catch(() => stylesheetLoads.delete(key));
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
  const tokenPalettes = entry?.tokenPalettes as Record<string, string> | undefined;
  const hrefs = [entry?.tokens, tokenPalettes?.[`${segment}|${theme}`]].filter(
    (href): href is string => Boolean(href)
  );
  return Promise.all([...new Set(hrefs)].map((href) => prepareStylesheet(href)));
}

/** Insert newly encountered resources once; never detach an already ordered stylesheet. */
function positionStylesheets(links: HTMLLinkElement[]) {
  for (const link of [...new Set(links)].sort(
    (a, b) => Number(a.dataset.kOrder ?? -1) - Number(b.dataset.kOrder ?? -1)
  )) {
    if (link.dataset.kPositioned === 'true' || link.dataset.kOrder === undefined) continue;
    const order = Number(link.dataset.kOrder);
    const next = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[data-k-positioned="true"]')
    ).find((other) => Number(other.dataset.kOrder) > order);
    if (next) document.head.insertBefore(link, next);
    else if (link !== document.head.lastElementChild) document.head.append(link);
    link.dataset.kPositioned = 'true';
  }
}

/** Used only for newly mounted consumers, after their resources are ready. */
export function activateComponentStylesheets(links: HTMLLinkElement[]) {
  positionStylesheets(links);
  for (const link of links) {
    if (link.dataset.kSelection !== 'true') link.dataset.kSelection = 'true';
    if (link.media !== 'all') link.media = 'all';
  }
}

export function activateSelectionStylesheets(links: HTMLLinkElement[]) {
  const active = new Set(links);
  // Establish cascade order while new resources are still staged.
  activateComponentStylesheets(links);
  for (const link of document.querySelectorAll<HTMLLinkElement>('link[data-k-selection]')) {
    if (!active.has(link) && link.media !== 'not all') link.media = 'not all';
  }
}
