export type CollectionItem<TKey extends string = string, TData = unknown> = {
  key: TKey;
  disabled?: boolean;
  textValue: string;
  data?: TData;
};

export function getCollectionItem<TKey extends string, TData>(
  items: readonly CollectionItem<TKey, TData>[],
  key: TKey | undefined
): CollectionItem<TKey, TData> | undefined {
  return key === undefined ? undefined : items.find((item) => item.key === key);
}

export function getEnabledCollectionItems<TKey extends string, TData>(
  items: readonly CollectionItem<TKey, TData>[]
): CollectionItem<TKey, TData>[] {
  return items.filter((item) => !item.disabled);
}

export function getFirstEnabledCollectionKey<TKey extends string, TData>(
  items: readonly CollectionItem<TKey, TData>[]
): TKey | undefined {
  return getEnabledCollectionItems(items)[0]?.key;
}

export function getLastEnabledCollectionKey<TKey extends string, TData>(
  items: readonly CollectionItem<TKey, TData>[]
): TKey | undefined {
  return getEnabledCollectionItems(items).at(-1)?.key;
}

export function getAdjacentCollectionKey<TKey extends string, TData>(
  items: readonly CollectionItem<TKey, TData>[],
  activeKey: TKey | undefined,
  direction: -1 | 1,
  wrap: boolean
): TKey | undefined {
  const enabledItems = getEnabledCollectionItems(items);
  if (enabledItems.length === 0) return undefined;

  const activeIndex = enabledItems.findIndex((item) => item.key === activeKey);
  const nextIndex =
    activeIndex < 0 ? (direction === 1 ? 0 : enabledItems.length - 1) : activeIndex + direction;

  if (wrap) {
    return enabledItems[(nextIndex + enabledItems.length) % enabledItems.length]?.key;
  }

  return enabledItems[nextIndex]?.key;
}

export function findCollectionKeyByPrefix<TKey extends string, TData>(
  items: readonly CollectionItem<TKey, TData>[],
  query: string,
  startAfter?: TKey
): TKey | undefined {
  const enabledItems = getEnabledCollectionItems(items);
  if (enabledItems.length === 0) return undefined;

  const startIndex = enabledItems.findIndex((item) => item.key === startAfter);
  const ordered =
    startIndex < 0
      ? enabledItems
      : [...enabledItems.slice(startIndex + 1), ...enabledItems.slice(0, startIndex + 1)];
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return ordered.find((item) => item.textValue.toLocaleLowerCase().startsWith(normalizedQuery))
    ?.key;
}

export function assertUniqueCollectionKeys<TKey extends string, TData>(
  items: readonly CollectionItem<TKey, TData>[],
  componentName: string
): void {
  const environment = (
    globalThis as typeof globalThis & {
      process?: { env?: { NODE_ENV?: string } };
    }
  ).process?.env?.NODE_ENV;
  if (environment === 'production') return;

  const seen = new Set<TKey>();
  for (const item of items) {
    if (seen.has(item.key)) {
      console.error(`[Kiskadee] ${componentName} received duplicate item key "${item.key}".`);
    }
    seen.add(item.key);
  }
}
