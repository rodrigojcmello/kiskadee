import { describe, expect, it } from 'vitest';
import { layoutGraph } from './layout-graph.ts';

describe('measured graph layout', () => {
  it('uses real heights without overlap and preserves sibling order', () => {
    const graph = layoutGraph([
      { id: 'root', width: 320, height: 78 },
      { id: 'a', parentId: 'root', width: 350, height: 78 },
      { id: 'b', parentId: 'root', width: 350, height: 164 },
      { id: 'c', parentId: 'root', width: 350, height: 102 }
    ]);
    const { root, a, b, c } = graph.positions;
    expect(a.x).toBeGreaterThan(root.x + root.width);
    expect(a.y + a.height).toBeLessThan(b.y);
    expect(b.y + b.height).toBeLessThan(c.y);
    expect(graph.height).toBeGreaterThan(c.y + c.height);
  });
});
