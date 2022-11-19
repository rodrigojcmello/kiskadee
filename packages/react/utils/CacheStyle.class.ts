export class CacheStyle {
  private dependencies: {
    name: string;
    version: string;
    author: string;
    themeOnly?: string;
  };

  private cache: Record<string, unknown>;

  private readonly cacheEnabled: boolean;

  constructor() {
    this.cache = {};

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

      this.cache = {};
    }
  }

  get<T>(key: string[]): T {
    return this.cache[JSON.stringify(key)] as T;
  }

  set(keys: string[], value: unknown) {
    if (this.cacheEnabled) {
      this.cache[JSON.stringify(keys)] = value;
    }
    return value;
  }
}
