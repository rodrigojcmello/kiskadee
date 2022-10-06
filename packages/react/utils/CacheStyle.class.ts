type CacheType = { [key: string]: CacheType };

export class CacheStyle {
  private cache: Record<string, unknown>;

  private readonly schema: CacheType;

  private dependencies: Record<string, unknown>;

  constructor() {
    this.cache = {};
    this.schema = {};
    this.dependencies = {};
  }

  update(dependencies: Record<string, unknown>) {
    if (JSON.stringify(this.dependencies) !== JSON.stringify(dependencies)) {
      this.dependencies = dependencies;
      this.cache = {};
    }
  }

  get<T>(key: object): T {
    const arrayKey = Object.keys(key);

    return this.schema?.[arrayKey[0]]?.[arrayKey[1]]?.[arrayKey[2]]?.[
      arrayKey[3]
    ]?.[arrayKey[4]]?.[arrayKey[5]] as T;

    // return this.cache[JSON.stringify(key)];
  }

  set(objectKey: Record<string, string>, value: unknown) {
    // this.cache[JSON.stringify(objectKey)] = value;

    const arrayKey = Object.keys(objectKey);

    arrayKey.reduce((previousValue, key, index) => {
      if (!previousValue[objectKey[key]]) {
        (previousValue as { [key: string]: CacheType | unknown })[
          objectKey[key]
        ] = index === arrayKey.length - 1 ? value : {};
      }
      return previousValue[objectKey[key]];
    }, this.schema);

    console.log('this.schema', this.schema);
  }
}
