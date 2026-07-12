export type CanonicalJsonPrimitive = boolean | null | number | string;

export type CanonicalJsonValue =
  | CanonicalJsonPrimitive
  | readonly CanonicalJsonValue[]
  | { readonly [key: string]: CanonicalJsonValue };

export class CanonicalJsonError extends TypeError {
  constructor(message: string) {
    super(message);
    this.name = 'CanonicalJsonError';
  }
}

function propertyPath(parentPath: string, key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${parentPath}.${key}`
    : `${parentPath}[${JSON.stringify(key)}]`;
}

function describeValue(value: unknown): string {
  if (typeof value !== 'object' || value === null) {
    return typeof value;
  }

  const prototype = Object.getPrototypeOf(value);
  const prototypeConstructor = prototype
    ? Object.getOwnPropertyDescriptor(prototype, 'constructor')?.value
    : undefined;
  const constructorName =
    typeof prototypeConstructor === 'function' ? prototypeConstructor.name : undefined;
  return constructorName && constructorName !== 'Object' ? constructorName : 'non-plain object';
}

function canonicalize(
  value: unknown,
  path: string,
  ancestors: WeakSet<object>
): CanonicalJsonValue {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new CanonicalJsonError(`${path} must contain a finite number.`);
    }

    return Object.is(value, -0) ? 0 : value;
  }

  if (typeof value !== 'object') {
    throw new CanonicalJsonError(`${path} contains an unsupported ${typeof value} value.`);
  }

  if (ancestors.has(value)) {
    throw new CanonicalJsonError(`${path} contains a circular reference.`);
  }

  ancestors.add(value);

  try {
    if (Array.isArray(value)) {
      const ownKeys = Reflect.ownKeys(value);
      if (ownKeys.some((key) => typeof key === 'symbol')) {
        throw new CanonicalJsonError(`${path} contains a symbol property key.`);
      }

      const expectedKeys = new Set<string>([
        'length',
        ...Array.from({ length: value.length }, (_, index) => String(index))
      ]);
      const extraKey = (ownKeys as string[]).find((key) => !expectedKeys.has(key));
      if (extraKey !== undefined) {
        throw new CanonicalJsonError(
          `${propertyPath(path, extraKey)} is an extra array property and cannot be represented in JSON.`
        );
      }

      const result: CanonicalJsonValue[] = [];

      for (let index = 0; index < value.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, index);
        if (!descriptor) {
          throw new CanonicalJsonError(
            `${path}[${index}] is missing; sparse arrays are not supported.`
          );
        }

        if (!('value' in descriptor)) {
          throw new CanonicalJsonError(
            `${path}[${index}] is an accessor and cannot be canonicalized safely.`
          );
        }

        result.push(canonicalize(descriptor.value, `${path}[${index}]`, ancestors));
      }

      return result;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new CanonicalJsonError(`${path} contains an unsupported ${describeValue(value)}.`);
    }

    const ownKeys = Reflect.ownKeys(value);
    const symbolKey = ownKeys.find((key) => typeof key === 'symbol');
    if (symbolKey !== undefined) {
      throw new CanonicalJsonError(`${path} contains a symbol property key.`);
    }

    const stringKeys = ownKeys as string[];
    for (const key of stringKeys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor?.enumerable) {
        throw new CanonicalJsonError(
          `${propertyPath(path, key)} is non-enumerable and cannot be represented in JSON.`
        );
      }

      if (!('value' in descriptor)) {
        throw new CanonicalJsonError(
          `${propertyPath(path, key)} is an accessor and cannot be canonicalized safely.`
        );
      }
    }

    const result: Record<string, CanonicalJsonValue> = Object.create(null);
    for (const key of stringKeys.sort()) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      result[key] = canonicalize(descriptor?.value, propertyPath(path, key), ancestors);
    }

    return result;
  } finally {
    ancestors.delete(value);
  }
}

/**
 * Clones a JSON-like value into a deterministic representation with sorted
 * object keys and normalized numbers. Invalid or lossy JSON values are rejected.
 */
export function canonicalizeJson(value: unknown): CanonicalJsonValue {
  return canonicalize(value, '$', new WeakSet<object>());
}

/** Returns compact canonical JSON for semantic comparisons and hashing. */
export function stringifyCanonicalJson(value: unknown): string {
  return JSON.stringify(canonicalizeJson(value));
}

/** Returns canonical JSON formatted as a checked-in/generated file. */
export function formatCanonicalJsonFile(value: unknown): string {
  return `${JSON.stringify(canonicalizeJson(value), null, 2)}\n`;
}
