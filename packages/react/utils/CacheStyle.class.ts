type CacheType = { [key: string]: CacheType };

export class CacheStyle {
  private cache: CacheType;

  private dependencies: { name: string; version: string; author: string };

  constructor() {
    this.cache = {};
    this.dependencies = {
      name: '',
      version: '',
      author: '',
    };
  }

  checkCache(name: string, version: string, author: string) {
    if (
      !(
        this.dependencies.name === name &&
        this.dependencies.version === version &&
        this.dependencies.author === author
      )
    ) {
      this.dependencies.name = name;
      this.dependencies.version = version;
      this.dependencies.author = author;
      this.cache = {};
    }
  }

  get<T>(key: object): T {
    const [component, type, variant, element, property] = Object.keys(key);

    return this.cache?.[component]?.[type]?.[variant]?.[element]?.[
      property
    ] as T;
  }

  set(objectKey: Record<string, string>, value: unknown) {
    const arrayKey = Object.keys(objectKey);

    arrayKey.reduce((previousValue, key, index) => {
      if (!previousValue[objectKey[key]]) {
        (previousValue as { [key: string]: CacheType | unknown })[
          objectKey[key]
        ] = index === arrayKey.length - 1 ? value : {};
      }
      return previousValue[objectKey[key]];
    }, this.cache);
  }
}
