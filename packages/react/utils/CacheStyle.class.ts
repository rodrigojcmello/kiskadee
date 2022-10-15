export class CacheStyle {
  private dependencies: {
    name: string;
    version: string;
    author: string;
    themeOnly?: string;
  };

  private cache: Record<string, unknown>;

  constructor() {
    this.cache = {};

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
    return this.cache[JSON.stringify(key)] as T;
  }

  set(keys: string[], value: unknown) {
    this.cache[JSON.stringify(keys)] = value;
  }
}
