export function deepUpdate<T>(
  obj: any,
  path: Array<string | number>,
  updater: (prev: T | undefined) => T
): void {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (cur[key] == null || typeof cur[key] !== 'object') {
      cur[key] = {};
    }
    cur = cur[key];
  }
  const last = path[path.length - 1];
  cur[last] = updater(cur[last]);
}
