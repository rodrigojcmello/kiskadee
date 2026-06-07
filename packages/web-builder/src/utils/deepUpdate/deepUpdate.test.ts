import { describe, expect, it } from 'vitest';
import { deepUpdate } from './deepUpdate.ts';

describe('deepUpdate', () => {
  it('updates a top-level property', () => {
    const obj = { a: 1 };
    deepUpdate<number>(obj, ['a'], (prev) => (prev ?? 0) + 1);
    expect(obj.a).toBe(2);
  });

  it('creates nested objects if they do not exist', () => {
    const obj: any = {};
    deepUpdate<string>(obj, ['foo', 'bar'], () => 'baz');
    expect(obj).toEqual({ foo: { bar: 'baz' } });
  });

  it('overwrites non-object with object along the path', () => {
    const obj: any = { foo: 1 };
    deepUpdate<string>(obj, ['foo', 'bar'], () => 'x');
    expect(obj.foo).toEqual({ bar: 'x' });
  });

  it('updates existing nested property', () => {
    const obj = { foo: { bar: 5 } };
    deepUpdate<number>(obj, ['foo', 'bar'], (prev) => (prev ?? 0) * 2);
    expect(obj.foo.bar).toBe(10);
  });

  it('works with array index paths', () => {
    const obj = { arr: [1, 2, 3] };
    deepUpdate<number>(obj, ['arr', 1], (prev) => (prev ?? 0) + 5);
    expect(obj.arr[1]).toBe(7);
  });

  it('works with mixed object and array paths', () => {
    const obj: any = { a: [] };
    deepUpdate<string>(obj, ['a', 0, 'b'], () => 'x');
    expect(obj.a[0].b).toBe('x');
  });

  it('handles empty path by assigning to undefined key', () => {
    const obj: any = {};
    deepUpdate<number>(obj, [], () => 42);
    expect(obj.undefined).toBe(42);
  });
});
