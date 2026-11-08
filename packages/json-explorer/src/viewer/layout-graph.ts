import { graphlib, layout } from '@dagrejs/dagre';

export interface MeasuredNode {
  id: string;
  parentId?: string;
  width: number;
  height: number;
}

export function layoutGraph(nodes: MeasuredNode[]) {
  const graph = new graphlib.Graph().setGraph({
    rankdir: 'LR',
    ranksep: 250,
    nodesep: 64,
    marginx: 80,
    marginy: 40
  });
  graph.setDefaultEdgeLabel(() => ({}));
  const siblings = new Map<string, string[]>();
  for (const node of nodes) {
    graph.setNode(node.id, { width: node.width, height: node.height });
    if (node.parentId) {
      graph.setEdge(node.parentId, node.id);
      const group = siblings.get(node.parentId) ?? [];
      group.push(node.id);
      siblings.set(node.parentId, group);
    }
  }
  const constraints = [...siblings.values()].flatMap((group) =>
    group.slice(1).map((right, index) => ({ left: group[index], right }))
  );
  layout(graph, { constraints });
  const positions: Record<string, { x: number; y: number; width: number; height: number }> = {};
  for (const node of nodes) {
    const position = graph.node(node.id);
    positions[node.id] = {
      width: node.width,
      height: node.height,
      x: position.x - node.width / 2,
      y: position.y - node.height / 2
    };
  }
  return { positions, width: graph.graph().width ?? 0, height: graph.graph().height ?? 0 };
}
