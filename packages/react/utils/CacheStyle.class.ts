type CacheType = { [key: string]: CacheType };

export class CacheStyle {
  private cache: CacheType;

  private dependencies: {
    name: string;
    version: string;
    author: string;
    themeOnly?: string;
  };

  private cache2: WeakMap<Record<string, unknown>, unknown>;

  constructor() {
    this.cache = {};
    this.cache2 = new WeakMap();

    this.dependencies = {
      name: '',
      version: '',
      author: '',
    };
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
      this.cache = {};
    }
  }

  get<T>(key: string[]): T {
    return this.cache?.[key[0]]?.[key[1]]?.[key[2]]?.[key[3]]?.[key[4]] as T;
  }

  get2<T>(key: Record<string, unknown>): T {
    const x = this.cache2.has(key) as T;
    if (x) console.log({ x: this.cache2.get(key) });

    return this.cache2.get(key) as T;
  }

  set(keys: string[], value: unknown) {
    keys.reduce((previousValue, key, index) => {
      if (!previousValue[key]) {
        (previousValue as { [key: string]: CacheType | unknown })[key] =
          index === keys.length - 1 ? value : {};
      }
      return previousValue[key];
    }, this.cache);

    console.log(this.cache);
  }

  set3(keys: Record<string, unknown>, value: unknown) {
    this.cache2.set(keys, value);

    console.log(this.cache2);
  }
}
