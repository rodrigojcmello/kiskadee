import type { InspectionModel } from '../model/inspection.ts';
import { getNodeChildren, type InspectionNode, type NodeSegment } from '../model/navigation.ts';

export interface BranchColumn {
  parent?: InspectionNode;
  nodes: InspectionNode[];
  selectedId?: string;
}

export function getBranchColumns(
  model: InspectionModel,
  root: InspectionNode,
  path: NodeSegment[]
): BranchColumn[] {
  const columns: BranchColumn[] = [{ nodes: [root], selectedId: root.id }];
  let current = root;
  let depth = 0;
  while (true) {
    const children = getNodeChildren(model, current);
    if (!children.length) break;
    const segment = path[depth];
    const selected = segment
      ? children.find((child) => JSON.stringify(child.path.at(-1)) === JSON.stringify(segment))
      : undefined;
    columns.push({
      parent: current,
      nodes: selected
        ? [selected, ...children.filter((node) => node.id !== selected.id)]
        : children,
      selectedId: selected?.id
    });
    if (!selected) break;
    current = selected;
    depth++;
  }
  return columns;
}
