export type RuntimeOs = 'macos' | 'ios' | 'android' | 'windows' | 'linux' | 'unknown';
export type RuntimeEngine = 'blink' | 'webkit' | 'gecko' | 'unknown';

export type RuntimePlatformInfo = {
  os: RuntimeOs;
  engine: RuntimeEngine;
};

export type ApplyRuntimePlatformClassesOptions = {
  document?: Document;
  navigator?: NavigatorLike;
  target?: 'html' | 'body';
  classPrefix?: string;
};

type NavigatorUserAgentBrand = {
  brand: string;
  version: string;
};

type NavigatorLike = Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'> & {
  userAgentData?: {
    brands?: NavigatorUserAgentBrand[];
    platform?: string;
  };
};

const runtimeOsValues = ['macos', 'ios', 'android', 'windows', 'linux', 'unknown'] as const;
const runtimeEngineValues = ['blink', 'webkit', 'gecko', 'unknown'] as const;
const legacyRuntimeBrowserValues = ['chrome', 'safari', 'firefox', 'edge', 'opera', 'unknown'] as const;

type RuntimeBrowser = 'chrome' | 'safari' | 'firefox' | 'edge' | 'opera' | 'unknown';

function normalizeBrand(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function includesOneOf(source: string, values: string[]): boolean {
  return values.some((value) => source.includes(value));
}

function detectRuntimeOs(navigatorLike: NavigatorLike): RuntimeOs {
  const userAgent = navigatorLike.userAgent.toLowerCase();
  const platform = normalizeBrand(navigatorLike.userAgentData?.platform ?? navigatorLike.platform);
  const isTouchMac = platform.includes('mac') && navigatorLike.maxTouchPoints > 1;

  if (includesOneOf(userAgent, ['android'])) return 'android';
  if (includesOneOf(userAgent, ['iphone', 'ipad', 'ipod']) || isTouchMac) return 'ios';
  if (includesOneOf(platform, ['win']) || includesOneOf(userAgent, ['windows'])) return 'windows';
  if (includesOneOf(platform, ['mac']) || includesOneOf(userAgent, ['mac os x', 'macintosh'])) {
    return 'macos';
  }
  if (includesOneOf(platform, ['linux']) || includesOneOf(userAgent, ['linux', 'x11'])) return 'linux';

  return 'unknown';
}

function detectRuntimeBrowser(navigatorLike: NavigatorLike): RuntimeBrowser {
  const userAgent = navigatorLike.userAgent.toLowerCase();
  const brands = navigatorLike.userAgentData?.brands?.map((brand) => normalizeBrand(brand.brand)) ?? [];

  if (brands.some((brand) => brand.includes('opera'))) return 'opera';
  if (brands.some((brand) => brand.includes('microsoft edge'))) return 'edge';
  if (brands.some((brand) => brand.includes('firefox'))) return 'firefox';
  if (brands.some((brand) => brand.includes('google chrome'))) return 'chrome';
  if (brands.some((brand) => brand.includes('safari'))) return 'safari';

  if (includesOneOf(userAgent, ['opr/', 'opera'])) return 'opera';
  if (includesOneOf(userAgent, ['edg/', 'edge/'])) return 'edge';
  if (includesOneOf(userAgent, ['firefox/', 'fxios/'])) return 'firefox';
  if (includesOneOf(userAgent, ['crios/', 'chrome/', 'chromium/'])) return 'chrome';
  if (userAgent.includes('safari/') && !includesOneOf(userAgent, ['chrome/', 'chromium/', 'crios/', 'opr/', 'edg/'])) {
    return 'safari';
  }

  return 'unknown';
}

function detectRuntimeEngine(
  navigatorLike: NavigatorLike,
  os: RuntimeOs,
  browser: RuntimeBrowser
): RuntimeEngine {
  const userAgent = navigatorLike.userAgent.toLowerCase();

  if (browser === 'firefox') return 'gecko';
  if (os === 'ios') return 'webkit';
  if (
    browser === 'chrome' ||
    browser === 'edge' ||
    browser === 'opera' ||
    includesOneOf(userAgent, ['chrome/', 'chromium/', 'crios/', 'opr/', 'edg/'])
  ) {
    return 'blink';
  }
  if (includesOneOf(userAgent, ['applewebkit/', 'safari/'])) return 'webkit';

  return 'unknown';
}

export function detectRuntimePlatform(
  navigatorLike: NavigatorLike | undefined = typeof navigator !== 'undefined'
    ? (navigator as NavigatorLike)
    : undefined
): RuntimePlatformInfo {
  if (!navigatorLike) {
    return {
      os: 'unknown',
      engine: 'unknown'
    };
  }

  const os = detectRuntimeOs(navigatorLike);
  const browser = detectRuntimeBrowser(navigatorLike);
  const engine = detectRuntimeEngine(navigatorLike, os, browser);

  return { os, engine };
}

export function resolveRuntimePlatformClasses(
  platform: RuntimePlatformInfo,
  classPrefix = 'k'
): string[] {
  const classes: string[] = [];

  if (platform.os !== 'unknown') {
    classes.push(`${classPrefix}-os-${platform.os}`);
  }

  if (platform.engine !== 'unknown') {
    classes.push(`${classPrefix}-engine-${platform.engine}`);
  }

  return classes;
}

export function clearRuntimePlatformClasses(
  options: Pick<ApplyRuntimePlatformClassesOptions, 'document' | 'target' | 'classPrefix'> = {}
): void {
  const documentRef = options.document ?? (typeof document !== 'undefined' ? document : undefined);
  if (!documentRef) return;

  const classPrefix = options.classPrefix ?? 'k';
  const knownClasses = [
    ...runtimeOsValues.map((value) => `${classPrefix}-os-${value}`),
    ...legacyRuntimeBrowserValues.map((value) => `${classPrefix}-browser-${value}`),
    ...runtimeEngineValues.map((value) => `${classPrefix}-engine-${value}`)
  ];
  const target = options.target ?? 'body';
  const elements: HTMLElement[] = [];

  if (target === 'html') {
    elements.push(documentRef.documentElement);
  }

  if (target === 'body' && documentRef.body) {
    elements.push(documentRef.body);
  }

  for (const element of elements) {
    element.classList.remove(...knownClasses);
  }
}

export function applyRuntimePlatformClasses(
  options: ApplyRuntimePlatformClassesOptions = {}
): RuntimePlatformInfo {
  const platform = detectRuntimePlatform(options.navigator);
  const documentRef = options.document ?? (typeof document !== 'undefined' ? document : undefined);

  if (!documentRef) {
    return platform;
  }

  const target = options.target ?? 'body';
  const classPrefix = options.classPrefix ?? 'k';
  const classes = resolveRuntimePlatformClasses(platform, classPrefix);
  const elements: HTMLElement[] = [];

  if (target === 'html') {
    elements.push(documentRef.documentElement);
  }

  if (target === 'body' && documentRef.body) {
    elements.push(documentRef.body);
  }

  clearRuntimePlatformClasses({
    document: documentRef,
    target,
    classPrefix
  });

  for (const element of elements) {
    if (classes.length > 0) {
      element.classList.add(...classes);
    }
  }

  return platform;
}
