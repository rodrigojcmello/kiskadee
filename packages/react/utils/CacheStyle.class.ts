type CacheType = { [key: string]: CacheType };

export class CacheStyle {
  private readonly schema: CacheType;

  private dependencies: Record<string, unknown>;

  constructor() {
    this.schema = {};
    this.dependencies = {};
  }

  // update(dependencies: Record<string, unknown>) {
  //   if (JSON.stringify(this.dependencies) !== JSON.stringify(dependencies)) {
  //     this.dependencies = dependencies;
  //     this.cache = {};
  //   }
  // }

  get<T>(key: object): T {
    const [component, type, variant, element, property] = Object.keys(key);

    console.log({ schema: this.schema });

    return this.schema?.[component]?.[type]?.[variant]?.[element]?.[
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
    }, this.schema);
  }
}
