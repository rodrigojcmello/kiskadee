import { describe, expect, it } from 'vitest';
import {
  CanonicalJsonError,
  canonicalizeJson,
  formatCanonicalJsonFile,
  stringifyCanonicalJson
} from './canonical-json';
import { sha256Hex } from './sha256';

describe('canonical JSON', () => {
  it('sorts object keys recursively while preserving array order', () => {
    const value = {
      zebra: [{ z: 1, a: 2 }, 'last', 'first'],
      alpha: { delta: true, beta: null }
    };

    expect(stringifyCanonicalJson(value)).toBe(
      '{"alpha":{"beta":null,"delta":true},"zebra":[{"a":2,"z":1},"last","first"]}'
    );
  });

  it('normalizes negative zero without mutating the input', () => {
    const input = { values: [-0, 0, 1.5] };

    expect(canonicalizeJson(input)).toEqual({ values: [0, 0, 1.5] });
    expect(Object.is(input.values[0], -0)).toBe(true);
  });

  it('formats files with two spaces, LF line endings, and a final newline', () => {
    expect(formatCanonicalJsonFile({ z: 1, a: { d: 4, b: 2 } })).toBe(
      '{\n  "a": {\n    "b": 2,\n    "d": 4\n  },\n  "z": 1\n}\n'
    );
  });

  it.each([
    ['undefined', undefined],
    ['bigint', 1n],
    ['function', () => undefined],
    ['symbol', Symbol('value')],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['negative Infinity', Number.NEGATIVE_INFINITY],
    ['Date', new Date('2026-07-11T00:00:00.000Z')],
    ['Map', new Map([['key', 'value']])]
  ])('rejects %s values', (_name, value) => {
    expect(() => stringifyCanonicalJson({ value })).toThrow(CanonicalJsonError);
  });

  it('rejects unsupported values inside arrays instead of silently coercing them', () => {
    expect(() => stringifyCanonicalJson([1, undefined, 3])).toThrow(
      '$[1] contains an unsupported undefined value.'
    );
  });

  it('rejects sparse arrays', () => {
    const sparse = [1, 2, 3];
    delete sparse[1];

    expect(() => stringifyCanonicalJson(sparse)).toThrow(
      '$[1] is missing; sparse arrays are not supported.'
    );
  });

  it('rejects array accessors and extra properties', () => {
    const withAccessor = [1];
    Object.defineProperty(withAccessor, 0, {
      enumerable: true,
      get: () => 1
    });
    expect(() => stringifyCanonicalJson(withAccessor)).toThrow('$[0] is an accessor');

    const withExtraProperty = [1] as number[] & { metadata?: string };
    withExtraProperty.metadata = 'not JSON array data';
    expect(() => stringifyCanonicalJson(withExtraProperty)).toThrow(
      '$.metadata is an extra array property'
    );
  });

  it('rejects circular references but permits repeated non-circular references', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    expect(() => stringifyCanonicalJson(circular)).toThrow('$.self contains a circular reference.');

    const shared = { z: 1, a: 2 };
    expect(stringifyCanonicalJson({ left: shared, right: shared })).toBe(
      '{"left":{"a":2,"z":1},"right":{"a":2,"z":1}}'
    );
  });

  it('rejects symbol keys and accessors instead of silently dropping behavior', () => {
    expect(() => stringifyCanonicalJson({ [Symbol('hidden')]: true })).toThrow(
      'contains a symbol property key'
    );

    const withGetter = Object.defineProperty({}, 'value', {
      enumerable: true,
      get: () => 1
    });
    expect(() => stringifyCanonicalJson(withGetter)).toThrow('$.value is an accessor');
  });

  it('supports plain objects with a null prototype and dangerous JSON keys', () => {
    const value = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(value, '__proto__', {
      configurable: true,
      enumerable: true,
      value: { z: 1, a: 2 },
      writable: true
    });
    Object.defineProperty(value, 'constructor', {
      configurable: true,
      enumerable: true,
      value: 'safe',
      writable: true
    });

    expect(stringifyCanonicalJson(value)).toBe('{"__proto__":{"a":2,"z":1},"constructor":"safe"}');
  });

  it('hashes canonical JSON with browser-safe lowercase SHA-256', async () => {
    const canonical = stringifyCanonicalJson({ z: 1, a: 2 });
    const digest = await sha256Hex(canonical);

    expect(digest).toBe('c2985c5ba6f7d2a55e768f92490ca09388e95bc4cccb9fdf11b15f4d42f93e73');
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
  });
});
