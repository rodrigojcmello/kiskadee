import { createHash } from 'node:crypto';
import Specificity from '@bramus/specificity';
import postcss, { type ChildNode, type Container } from 'postcss';

export type CssPartition = { css: string; consumers: string[]; order: number };

/** Class references are emitted by the builder, never inferred from component DOM. */
export function collectClassReferences(value: unknown, result = new Set<string>()): Set<string> {
  if (typeof value === 'string') {
    for (const name of value.split(/\s+/)) if (name) result.add(name);
  } else if (value && typeof value === 'object') {
    for (const child of Object.values(value)) collectClassReferences(child, result);
  }
  return result;
}

/**
 * Partition ordered rules by their exact consumer set. Contiguous runs preserve cascade order
 * even when two shared utilities target the same property. Ancestor conditions stay intact.
 */
export function partitionComponentCss(css: string, maps: Record<string, unknown>): CssPartition[] {
  const owners = new Map<string, Set<string>>();
  for (const [component, map] of Object.entries(maps)) {
    for (const name of collectClassReferences(map)) {
      const names = owners.get(name) ?? new Set<string>();
      names.add(component);
      owners.set(name, names);
    }
  }
  // References in mutually exclusive size/color branches cannot compete in one instance.
  type Occurrence = { element: string; choices: Record<string, string> };
  const occurrences = new Map<string, Occurrence[]>();
  const index = (value: unknown, path: string[]) => {
    if (typeof value === 'string') {
      const elementIndex = path.findIndex((key) => /^e\d+$/.test(key));
      if (elementIndex < 0) return;
      const bucket = path.slice(elementIndex + 1);
      const choices: Record<string, string> = {};
      if (
        ['s', 'w', 'rr', 'rp', 'rs'].includes(bucket[0] ?? '') &&
        bucket[1] &&
        bucket[1] !== 'all'
      )
        choices.size = bucket[1];
      if (['rr', 'rp', 'rs'].includes(bucket[0] ?? '')) choices.radius = bucket[0]!;
      if (bucket[0] === 'c') {
        if (bucket[1]) choices.surface = bucket[1];
        if (bucket[2]) choices.intent = bucket[2];
        if (bucket[3]) choices.emphasis = bucket[3];
      }
      const occurrence = { element: path.slice(0, elementIndex + 1).join('.'), choices };
      for (const name of value.split(/\s+/)) {
        const entries = occurrences.get(name) ?? [];
        entries.push(occurrence);
        occurrences.set(name, entries);
      }
    } else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) index(child, [...path, key]);
    }
  };
  for (const [component, map] of Object.entries(maps)) index(map, [component]);
  const competing = (left: Set<string>, right: Set<string>) => {
    for (const a of left)
      for (const b of right) {
        const aa = occurrences.get(a),
          bb = occurrences.get(b);
        if (!aa || !bb) return true;
        if (
          aa.some((x) =>
            bb.some(
              (y) =>
                x.element === y.element &&
                Object.entries(x.choices).every(
                  ([axis, choice]) => !y.choices[axis] || y.choices[axis] === choice
                )
            )
          )
        )
          return true;
      }
    return !left.size || !right.size;
  };
  const root = postcss.parse(css);
  const animations = new Map<string, Set<string>>();
  const consumersFor = (selector: string) => {
    const consumers = new Set<string>();
    for (const [, name] of selector.matchAll(/\.([a-zA-Z_][\w-]*)/g))
      for (const owner of owners.get(name) ?? []) consumers.add(owner);
    return [...consumers].sort();
  };
  root.walkRules((rule) => {
    const consumers = consumersFor(rule.selector);
    rule.walkDecls(/^animation(?:-name)?$/, (decl) => {
      for (const name of decl.value.split(/[\s,]+/)) {
        const targets = animations.get(name) ?? new Set<string>();
        for (const consumer of consumers) targets.add(consumer);
        animations.set(name, targets);
      }
    });
  });
  const partitions: CssPartition[] = [];
  const append = (node: ChildNode, parents: Container[], consumers: string[]) => {
    let wrapped = node.clone();
    for (const parent of [...parents].reverse())
      wrapped = parent.clone({ nodes: [wrapped] }) as ChildNode;
    const previous = partitions.at(-1);
    if (previous && previous.consumers.join('|') === consumers.join('|'))
      previous.css += wrapped.toString();
    else partitions.push({ css: wrapped.toString(), consumers, order: partitions.length });
  };
  const visit = (container: Container, parents: Container[]) => {
    for (const node of container.nodes ?? []) {
      if (node.type === 'comment') continue;
      if (node.type === 'atrule' && /keyframes$/.test(node.name)) {
        append(node, parents, [...(animations.get(node.params) ?? [])].sort());
      } else if (
        node.type === 'atrule' &&
        node.nodes &&
        node.nodes.some((child) => child.type !== 'decl')
      ) {
        visit(node, [...parents, node]);
      } else {
        append(node, parents, node.type === 'rule' ? consumersFor(node.selector) : []);
      }
    }
  };
  visit(root, []);
  // Combine separated runs only when moving them cannot change a competing declaration.
  // This avoids one request per utility without changing CSS cascade semantics.
  const compact: Array<
    CssPartition & { properties: Map<string, Set<string>>; classes: Set<string> }
  > = [];
  for (const part of partitions) {
    const properties = new Map<string, Set<string>>();
    const classes = new Set<string>();
    postcss.parse(part.css).walkRules((rule) => {
      for (const [, name] of rule.selector.matchAll(/\.([a-zA-Z_][\w-]*)/g))
        if (owners.has(name)) classes.add(name);
    });
    const propertyFamily = (property: string) =>
      /^(border|background|font|padding|margin|animation|transition|flex|grid|list-style)(?:-|$)/.exec(
        property
      )?.[1] ?? property;
    postcss.parse(part.css).walkRules((rule) => {
      let specificity: string[];
      try {
        specificity = Specificity.calculate(rule.selector).map((value) =>
          JSON.stringify(value.value)
        );
      } catch {
        properties.set('*', classes);
        return;
      }
      const ruleClasses = new Set(
        [...rule.selector.matchAll(/\.([a-zA-Z_][\w-]*)/g)]
          .map((match) => match[1]!)
          .filter((name) => owners.has(name))
      );
      rule.walkDecls((decl) => {
        for (const value of specificity) {
          const key = `${propertyFamily(decl.prop)}|${value}|${Boolean(decl.important)}`;
          const targets = properties.get(key) ?? new Set<string>();
          for (const name of ruleClasses) targets.add(name);
          properties.set(key, targets);
        }
      });
    });

    let target: (typeof compact)[number] | undefined;
    for (let i = compact.length - 1; i >= 0; i--) {
      const previous = compact[i]!;
      if (previous.consumers.join('|') === part.consumers.join('|')) {
        target = previous;
        break;
      }
      const intersect =
        !part.consumers.length ||
        !previous.consumers.length ||
        part.consumers.some((name) => previous.consumers.includes(name));
      const conflict =
        properties.has('*') ||
        previous.properties.has('*') ||
        [...properties].some(
          ([property, targets]) =>
            property.startsWith('all|') ||
            (previous.properties.has(property) &&
              competing(targets, previous.properties.get(property)!))
        ) ||
        [...previous.properties.keys()].some((property) => property.startsWith('all|'));
      if (intersect && conflict) break;
    }
    if (target) {
      target.css += part.css;
      for (const [property, targets] of properties) {
        const combined = target.properties.get(property) ?? new Set<string>();
        for (const name of targets) combined.add(name);
        target.properties.set(property, combined);
      }
      for (const name of classes) target.classes.add(name);
    } else compact.push({ ...part, properties, classes });
  }
  return compact.map(({ css, consumers }, order) => ({ css, consumers, order }));
}

export const artifactHash = (value: string) => createHash('sha256').update(value).digest('hex');
