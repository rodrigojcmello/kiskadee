const cacheMap = new Map();

declare global {
  interface ProxyConstructor {
    new <TSource extends object, TTarget extends object>(
      target: TSource,
      handler: ProxyHandler<TSource>
    ): TTarget;
    cache: Map<string, unknown>;
  }
}

export function memoize<T>(
  fn: (arg: (string | undefined)[]) => T
): (arg: (string | undefined)[]) => T {
  return new Proxy(fn, {
    // @ts-ignore
    cache: cacheMap,
    apply(target, thisArg, argsList) {
      const cacheKey = argsList.toString();
      // @ts-ignore
      const result = target.apply(thisArg, argsList);
      // @ts-ignore
      if (!this.cache.has(cacheKey) && result) {
        // @ts-ignore9
        this.cache.set(cacheKey, target.apply(thisArg, argsList));
      }
      // @ts-ignore
      return this.cache.get(cacheKey);
    },
  });
}

export class CacheStyle {
  private dependencies: {
    name: string;
    version: string;
    author: string;
    themeOnly?: string;
  };

  // private cache: Record<string, unknown>;

  private readonly cacheEnabled: boolean;

  constructor() {
    // this.cache = {};

    this.dependencies = {
      name: '',
      version: '',
      author: '',
    };

    this.cacheEnabled = false;
  }

  checkCache(
    name: string,
    version: string,
    author: string,
    themeOnly?: string
  ) {
    if (
      !(
        this.dependencies.name === name &&
        this.dependencies.version === version &&
        this.dependencies.author === author &&
        this.dependencies.themeOnly === themeOnly
      )
    ) {
      this.dependencies.name = name;
      this.dependencies.version = version;
      this.dependencies.author = author;
      this.dependencies.themeOnly = themeOnly;

      cacheMap.clear();
    }
  }

  // get<T>(key: string[]): T {
  //   return this.cache[JSON.stringify(key)] as T;
  // }
  //
  // set(keys: string[], value: unknown) {
  //   if (this.cacheEnabled) {
  //     this.cache[JSON.stringify(keys)] = value;
  //   }
  //   return value;
  // }
}
