type CacheType = { [key: string]: CacheType };

export class CacheStyle {
  private cache: CacheType;

  private dependencies: {
    name: string;
    version: string;
    author: string;
    themeOnly?: string;
  };

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
    return this.cache?.[key[0]]?.[key[1]]?.[key[2]]?.[key[3]]?.[key[4]] as T;
  }

  set(keys: string[], value: unknown) {
    keys.reduce((previousValue, key, index) => {
      if (!previousValue[key]) {
        (previousValue as { [key: string]: CacheType | unknown })[key] =
          index === keys.length - 1 ? value : {};
      }
      return previousValue[key];
    }, this.cache);
  }
}
