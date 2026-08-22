export type MenuTreeIntent = 'neutral' | 'destructive';

export type MenuTreeSelectionDetails = {
  id: string;
  type: 'item' | 'link' | 'radio' | 'checkbox';
  value?: string;
  controlState?: boolean;
};

type MenuTreeNodeBase<TIcon> = {
  id: string;
  label: string;
  textValue?: string;
  description?: string;
  endText?: string;
  icon?: TIcon;
  trailingIcon?: TIcon;
  intent?: MenuTreeIntent;
  disabled?: boolean;
};

export type MenuTreeItem<TIcon = unknown> = MenuTreeNodeBase<TIcon> & {
  type: 'item';
  closeOnSelect?: boolean;
  onSelect?: (details: MenuTreeSelectionDetails) => void;
};

export type MenuTreeLink<TIcon = unknown> = MenuTreeNodeBase<TIcon> & {
  type: 'link';
  href: string;
  target?: string;
  rel?: string;
  closeOnSelect?: boolean;
  onSelect?: (details: MenuTreeSelectionDetails) => void;
};

export type MenuTreeRadioItem<TIcon = unknown> = MenuTreeNodeBase<TIcon> & {
  type: 'radio';
  value: string;
};

export type MenuTreeCheckboxItem<TIcon = unknown> = MenuTreeNodeBase<TIcon> & {
  type: 'checkbox';
  controlState?: boolean;
  defaultControlState?: boolean;
  closeOnSelect?: boolean;
  onControlStateChange?: (controlState: boolean, details: MenuTreeSelectionDetails) => void;
};

export type MenuTreeRadioGroup<TIcon = unknown> = {
  type: 'radio-group';
  id: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  items: readonly MenuTreeRadioItem<TIcon>[];
  onValueChange?: (value: string, details: MenuTreeSelectionDetails) => void;
};

export type MenuTreeSeparator = {
  type: 'separator';
  id: string;
};

export type MenuTreeSubmenu<TIcon = unknown> = MenuTreeNodeBase<TIcon> & {
  type: 'submenu';
  title?: string;
  items: readonly MenuTreeNode<TIcon>[];
};

export type MenuTreeGroup<TIcon = unknown> = {
  type: 'group';
  id: string;
  label?: string;
  items: readonly MenuTreeNode<TIcon>[];
};

export type MenuTreeNode<TIcon = unknown> =
  | MenuTreeGroup<TIcon>
  | MenuTreeItem<TIcon>
  | MenuTreeLink<TIcon>
  | MenuTreeCheckboxItem<TIcon>
  | MenuTreeRadioGroup<TIcon>
  | MenuTreeSeparator
  | MenuTreeSubmenu<TIcon>;

export type MenuTree<TIcon = unknown> = {
  id: string;
  title: string;
  items: readonly MenuTreeNode<TIcon>[];
};

function collectNodeIssues<TIcon>(
  nodes: readonly MenuTreeNode<TIcon>[],
  ids: Set<string>,
  path: string,
  issues: string[]
): void {
  nodes.forEach((node, index) => {
    const nodePath = `${path}[${index}]`;
    if (node.id.trim().length === 0) issues.push(`${nodePath}.id: expected non-empty string`);
    else if (ids.has(node.id)) issues.push(`${nodePath}.id: duplicate id "${node.id}"`);
    else ids.add(node.id);

    if ('label' in node && node.label !== undefined && node.label.trim().length === 0) {
      issues.push(`${nodePath}.label: expected non-empty string`);
    }

    if (node.type === 'group' || node.type === 'submenu') {
      collectNodeIssues(node.items, ids, `${nodePath}.items`, issues);
    } else if (node.type === 'radio-group') {
      for (const [radioIndex, item] of node.items.entries()) {
        const radioPath = `${nodePath}.items[${radioIndex}]`;
        if (item.id.trim().length === 0) {
          issues.push(`${radioPath}.id: expected non-empty string`);
        } else if (ids.has(item.id)) {
          issues.push(`${radioPath}.id: duplicate id "${item.id}"`);
        } else {
          ids.add(item.id);
        }
        if (item.label.trim().length === 0) {
          issues.push(`${radioPath}.label: expected non-empty string`);
        }
      }
    }
  });
}

export function validateMenuTree<TIcon>(tree: MenuTree<TIcon>, path = 'menuTree'): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  if (tree.id.trim().length === 0) issues.push(`${path}.id: expected non-empty string`);
  else ids.add(tree.id);
  if (tree.title.trim().length === 0) issues.push(`${path}.title: expected non-empty string`);
  collectNodeIssues(tree.items, ids, `${path}.items`, issues);
  return issues;
}

export function defineMenuTree<TIcon, TTree extends MenuTree<TIcon>>(tree: TTree): TTree {
  const issues = validateMenuTree(tree);
  if (issues.length > 0) {
    throw new Error(`Invalid MenuTree.\n${issues.join('\n')}`);
  }
  return tree;
}
