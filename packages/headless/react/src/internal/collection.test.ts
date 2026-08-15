import { describe, expect, it, vi } from 'vitest';
import {
  assertUniqueCollectionKeys,
  type CollectionItem,
  findCollectionKeyByPrefix,
  getAdjacentCollectionKey,
  getFirstEnabledCollectionKey,
  getLastEnabledCollectionKey
} from './collection.ts';

const items: CollectionItem[] = [
  { key: 'alpha', textValue: 'Alpha' },
  { key: 'blocked', textValue: 'Blocked', disabled: true },
  { key: 'charlie', textValue: 'Charlie' }
];

describe('shared headless Collection', () => {
  it('keeps bounded and wrapped movement separate while skipping disabled items', () => {
    expect(getFirstEnabledCollectionKey(items)).toBe('alpha');
    expect(getLastEnabledCollectionKey(items)).toBe('charlie');
    expect(getAdjacentCollectionKey(items, 'alpha', 1, false)).toBe('charlie');
    expect(getAdjacentCollectionKey(items, 'charlie', 1, false)).toBeUndefined();
    expect(getAdjacentCollectionKey(items, 'charlie', 1, true)).toBe('alpha');
  });

  it('uses explicit text values and searches after the active key', () => {
    expect(findCollectionKeyByPrefix(items, 'ch', 'alpha')).toBe('charlie');
    expect(findCollectionKeyByPrefix(items, 'al', 'charlie')).toBe('alpha');
    expect(findCollectionKeyByPrefix(items, 'bl')).toBeUndefined();
  });

  it('reports duplicate public keys during development', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    assertUniqueCollectionKeys(
      [
        { key: 'same', textValue: 'One' },
        { key: 'same', textValue: 'Two' }
      ],
      'TestCollection'
    );

    expect(error).toHaveBeenCalledWith(expect.stringContaining('duplicate item key "same"'));
    error.mockRestore();
  });
});
