import { Children, cloneElement, Fragment, isValidElement, type ReactNode } from 'react';

function appendFlattenedChildren(
  children: ReactNode,
  parentKey: string,
  result: ReactNode[]
): void {
  for (const [index, child] of Children.toArray(children).entries()) {
    const localKey =
      isValidElement(child) && child.key !== null ? String(child.key) : String(index);
    const resolvedKey = parentKey.length > 0 ? `${parentKey}/${localKey}` : localKey;

    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
      appendFlattenedChildren(child.props.children, resolvedKey, result);
      continue;
    }

    result.push(isValidElement(child) ? cloneElement(child, { key: resolvedKey }) : child);
  }
}

/** Flattens transparent React Fragments while keeping authored DOM roots intact. */
export function flattenFragmentChildren(children: ReactNode): ReactNode[] {
  const result: ReactNode[] = [];
  appendFlattenedChildren(children, '', result);
  return result;
}
