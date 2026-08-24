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

export type MenuTreeSubmenu<TIcon = unknown> = MenuTreeNodeBase<TIcon> & {
  type: 'submenu';
  title?: string;
  items: readonly MenuTreeGroupNode<TIcon>[];
};

export type MenuTreeCommandNode<TIcon = unknown> =
  | MenuTreeItem<TIcon>
  | MenuTreeLink<TIcon>
  | MenuTreeSubmenu<TIcon>;

export type MenuTreeGroup<TIcon = unknown> = {
  type: 'group';
  id: string;
  label?: string;
  items: readonly MenuTreeCommandNode<TIcon>[];
};

export type MenuTreeCheckboxGroup<TIcon = unknown> = {
  type: 'checkbox-group';
  id: string;
  label?: string;
  items: readonly MenuTreeCheckboxItem<TIcon>[];
};

export type MenuTreeGroupNode<TIcon = unknown> =
  | MenuTreeGroup<TIcon>
  | MenuTreeCheckboxGroup<TIcon>
  | MenuTreeRadioGroup<TIcon>;

export type MenuTreeNode<TIcon = unknown> =
  | MenuTreeGroupNode<TIcon>
  | MenuTreeCommandNode<TIcon>
  | MenuTreeCheckboxItem<TIcon>;

export type MenuTree<TIcon = unknown> = {
  id: string;
  title: string;
  items: readonly MenuTreeGroupNode<TIcon>[];
};

function collectIdIssue(id: string, path: string, ids: Set<string>, issues: string[]): void {
  if (id.trim().length === 0) issues.push(`${path}: expected non-empty string`);
  else if (ids.has(id)) issues.push(`${path}: duplicate id "${id}"`);
  else ids.add(id);
}

function collectLabelIssue(label: string | undefined, path: string, issues: string[]): void {
  if (label !== undefined && label.trim().length === 0) {
    issues.push(`${path}: expected non-empty string`);
  }
}

function collectCommandIssues<TIcon>(
  nodes: readonly MenuTreeCommandNode<TIcon>[],
  ids: Set<string>,
  path: string,
  issues: string[]
): void {
  nodes.forEach((node, index) => {
    const nodePath = `${path}[${index}]`;
    if (node.type !== 'item' && node.type !== 'link' && node.type !== 'submenu') {
      issues.push(`${nodePath}.type: expected item, link, or submenu`);
      return;
    }
    collectIdIssue(node.id, `${nodePath}.id`, ids, issues);
    collectLabelIssue(node.label, `${nodePath}.label`, issues);
    if (node.type === 'submenu') {
      collectGroupIssues(node.items, ids, `${nodePath}.items`, issues);
    }
  });
}

function collectCheckboxIssues<TIcon>(
  nodes: readonly MenuTreeCheckboxItem<TIcon>[],
  ids: Set<string>,
  path: string,
  issues: string[]
): void {
  nodes.forEach((node, index) => {
    const nodePath = `${path}[${index}]`;
    if (node.type !== 'checkbox') {
      issues.push(`${nodePath}.type: expected checkbox`);
      return;
    }
    collectIdIssue(node.id, `${nodePath}.id`, ids, issues);
    collectLabelIssue(node.label, `${nodePath}.label`, issues);
  });
}

function collectRadioIssues<TIcon>(
  nodes: readonly MenuTreeRadioItem<TIcon>[],
  ids: Set<string>,
  path: string,
  issues: string[]
): void {
  const values = new Set<string>();
  nodes.forEach((node, index) => {
    const nodePath = `${path}[${index}]`;
    if (node.type !== 'radio') {
      issues.push(`${nodePath}.type: expected radio`);
      return;
    }
    collectIdIssue(node.id, `${nodePath}.id`, ids, issues);
    collectLabelIssue(node.label, `${nodePath}.label`, issues);
    if (node.value.trim().length === 0) {
      issues.push(`${nodePath}.value: expected non-empty string`);
    } else if (values.has(node.value)) {
      issues.push(`${nodePath}.value: duplicate value "${node.value}"`);
    } else {
      values.add(node.value);
    }
  });
}

function collectGroupIssues<TIcon>(
  groups: readonly MenuTreeGroupNode<TIcon>[],
  ids: Set<string>,
  path: string,
  issues: string[]
): void {
  groups.forEach((group, index) => {
    const groupPath = `${path}[${index}]`;
    if (group.type !== 'group' && group.type !== 'checkbox-group' && group.type !== 'radio-group') {
      issues.push(`${groupPath}.type: expected group, checkbox-group, or radio-group`);
      return;
    }
    collectIdIssue(group.id, `${groupPath}.id`, ids, issues);
    collectLabelIssue(group.label, `${groupPath}.label`, issues);
    if (group.items.length === 0) {
      issues.push(`${groupPath}.items: expected at least one item`);
      return;
    }
    if (group.type === 'group') {
      collectCommandIssues(group.items, ids, `${groupPath}.items`, issues);
    } else if (group.type === 'checkbox-group') {
      collectCheckboxIssues(group.items, ids, `${groupPath}.items`, issues);
    } else {
      collectRadioIssues(group.items, ids, `${groupPath}.items`, issues);
    }
  });
}

export function validateMenuTree<TIcon>(tree: MenuTree<TIcon>, path = 'menuTree'): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  collectIdIssue(tree.id, `${path}.id`, ids, issues);
  if (tree.title.trim().length === 0) issues.push(`${path}.title: expected non-empty string`);
  collectGroupIssues(tree.items, ids, `${path}.items`, issues);
  return issues;
}

export function defineMenuTree<TIcon, TTree extends MenuTree<TIcon>>(tree: TTree): TTree {
  const issues = validateMenuTree(tree);
  if (issues.length > 0) {
    throw new Error(`Invalid MenuTree.\n${issues.join('\n')}`);
  }
  return tree;
}
