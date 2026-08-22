import type { MenuTreeNode, MenuTreeRadioItem } from '@kiskadee/react-headless/menu-tree';
import type { ReactNode } from 'react';

export type MenuTreeIconNode<TIcon> = MenuTreeNode<TIcon> | MenuTreeRadioItem<TIcon>;

export type MenuTreeIconRenderer<TIcon> = (
  icon: TIcon,
  details: {
    placement: 'leading' | 'trailing';
    node: MenuTreeIconNode<TIcon>;
  }
) => ReactNode;

export function renderMenuTreeIcon<TIcon>(
  icon: TIcon | undefined,
  placement: 'leading' | 'trailing',
  node: MenuTreeIconNode<TIcon>,
  renderer: MenuTreeIconRenderer<TIcon> | undefined
): ReactNode {
  if (icon === undefined) return null;
  if (!renderer) {
    throw new Error(
      `Menu tree node "${node.id}" defines a ${placement} icon, but no renderIcon function was provided.`
    );
  }
  return renderer(icon, { placement, node });
}
