export class CacheStyle {
  private cache: Record<string, unknown>;

  private dependencies: Record<string, unknown>;

  constructor() {
    this.cache = {};
    this.dependencies = {};
  }

  update(dependencies: Record<string, unknown>) {
    if (JSON.stringify(this.dependencies) !== JSON.stringify(dependencies)) {
      this.dependencies = dependencies;
      this.cache = {};
    }
  }

  get(key: object) {
    return this.cache[JSON.stringify(key)];
  }

  set(key: object, value: unknown) {
    this.cache[JSON.stringify(key)] = value;
  }
}
