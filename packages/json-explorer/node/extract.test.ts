import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { InspectionModel, TypeDefinition } from '../src/model/inspection.ts';
import { extractInspectionModel } from './extract.ts';

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

function inspect(source: string, exportName = 'Example', propertyPath: string[] = []) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'json-explorer-'));
  directories.push(directory);
  const file = path.join(directory, 'source.ts');
  const tsconfig = path.join(directory, 'tsconfig.json');
  writeFileSync(file, source);
  writeFileSync(
    tsconfig,
    JSON.stringify({
      compilerOptions: {
        strict: true,
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'bundler',
        skipLibCheck: true
      }
    })
  );
  return extractInspectionModel({ file, exportName, path: propertyPath, tsconfig });
}

function root(model: InspectionModel) {
  return model.definitions[model.root.typeId];
}
function property(model: InspectionModel, definition: TypeDefinition, key: string) {
  const item = definition.properties?.find((item) => item.key === key);
  expect(item).toBeDefined();
  return { property: item!, definition: model.definitions[item!.typeId] };
}

describe('TypeScript type inspection', () => {
  it('resolves mapped/intersection types without losing optionality or exact keys', () => {
    const model = inspect(
      `export type Example = Partial<Record<'a.b' | 'a/b' | 'a~b', number>> & { required: boolean };`
    );
    expect(root(model).properties?.map((item) => [item.key, item.optional])).toEqual([
      ['a.b', true],
      ['a/b', true],
      ['a~b', true],
      ['required', false]
    ]);
    expect(property(model, root(model), 'required').definition).toMatchObject({
      kind: 'primitive',
      label: 'boolean'
    });
  });

  it('prefers own property comments and preserves @summary separately from full descriptions', () => {
    const model = inspect(`
      /** Alias description. */
      type Child = { value: number };
      export interface Example {
        /** Own description.\n         * @summary Compact label
         */
        own: Child;
        inherited: Child;
      }
    `);
    const own = property(model, root(model), 'own').property;
    const inherited = property(model, root(model), 'inherited').property;
    expect(own.documentation).toMatchObject({
      description: 'Own description.',
      summary: 'Compact label',
      source: { kind: 'property', file: 'source.ts' }
    });
    expect(inherited.documentation).toMatchObject({
      description: 'Alias description.',
      source: { kind: 'type' }
    });
    expect(own.typeId).toBe(inherited.typeId);
  });

  it('does not use TypeScript utility documentation as a property description', () => {
    const model = inspect(
      `export type Example = { items: Partial<Record<'one' | 'two', number>> };`
    );
    expect(property(model, root(model), 'items').property.documentation).toBeUndefined();
  });

  it('inherits one optional type document without applying one union member to every alternative', () => {
    const model = inspect(`
      /** Foo description.
       * @summary Foo label
       */
      type Foo = { foo: string };
      /** Bar description.
       * @summary Bar label
       */
      type Bar = { bar: number };
      export interface Example {
        choice: Foo | Bar;
        optional?: Foo;
        nullable: Foo | null;
        combined: Foo & Bar;
      }
    `);
    expect(property(model, root(model), 'choice').property.documentation).toBeUndefined();
    expect(property(model, root(model), 'choice').definition.documentation).toBeUndefined();
    expect(property(model, root(model), 'nullable').property.documentation).toBeUndefined();
    expect(property(model, root(model), 'combined').property.documentation).toBeUndefined();
    expect(property(model, root(model), 'optional').property.documentation).toMatchObject({
      summary: 'Foo label',
      description: 'Foo description.',
      source: { kind: 'type' }
    });
  });

  it('preserves null and undefined inside unions', () => {
    const model = inspect('export type Example = { value?: string | null };');
    const value = property(model, root(model), 'value');
    expect(value.property.optional).toBe(true);
    expect(value.definition.kind).toBe('union');
    expect(value.definition.alternatives?.map((id) => model.definitions[id].label).sort()).toEqual([
      'null',
      'string',
      'undefined'
    ]);
    const primitiveRoot = inspect('export type Example = string | null;');
    expect(
      root(primitiveRoot)
        .alternatives?.map((id) => primitiveRoot.definitions[id].label)
        .sort()
    ).toEqual(['null', 'string']);
    const selectedRoot = inspect('export type Example = { selected?: string | null };', 'Example', [
      'selected'
    ]);
    expect(
      root(selectedRoot)
        .alternatives?.map((id) => selectedRoot.definitions[id].label)
        .sort()
    ).toEqual(['null', 'string']);
  });

  it('reuses definitions and terminates recursive type extraction', () => {
    const model = inspect(`export interface Example { children: Example[]; sibling?: Example }`);
    const children = property(model, root(model), 'children').definition;
    expect(children.kind).toBe('array');
    expect(children.elementTypeId).toBe(model.root.typeId);
    expect(Object.keys(model.definitions).length).toBeLessThan(8);
  });

  it('preserves array, tuple and index-signature contracts', () => {
    const model = inspect(
      `export interface Example { list: readonly string[]; tuple: [string, number?]; map: Record<string, number> }`
    );
    const list = property(model, root(model), 'list').definition;
    const tuple = property(model, root(model), 'tuple').definition;
    const map = property(model, root(model), 'map').definition;
    expect(list).toMatchObject({ kind: 'array' });
    expect(model.definitions[list.elementTypeId!].label).toBe('string');
    expect(tuple.tupleItems?.map((item) => item.optional)).toEqual([false, true]);
    expect(map.indexSignatures?.[0]).toMatchObject({ keyType: 'string' });
    expect(model.definitions[map.indexSignatures![0].typeId].label).toBe('number');
    expect(map.properties).toEqual([]);
  });

  it('publishes escaped patterns for open template string keys and diagnoses other domains', () => {
    const model = inspect('export type Example = Record<`data.${string}[key]`, number>;');
    const signature = root(model).indexSignatures?.[0];
    expect(signature?.keyType).toBe('`data.${string}[key]`');
    expect(signature?.keyPattern).toBeDefined();
    const pattern = new RegExp(signature!.keyPattern!);
    expect(pattern.test('data.alpha[key]')).toBe(true);
    expect(pattern.test('data.\n[key]')).toBe(true);
    expect(pattern.test('dataXalpha[key]')).toBe(false);
    expect(pattern.test('prefixdata.alpha[key]')).toBe(false);
    expect(pattern.test('data.alpha[key]suffix')).toBe(false);
    expect(model.diagnostics).toEqual([]);

    const unsupported = inspect('export type Example = Record<`data-${number}`, number>;');
    expect(root(unsupported).indexSignatures?.[0].keyPattern).toBeUndefined();
    expect(unsupported.diagnostics[0].message).toContain('Observed JSON keys are not matched');
  });

  it('reads a typed value export without executing the source and names indexed roots by key', () => {
    const model = inspect(
      `throw new Error('must not execute'); export const schema: { components: { button?: { name: string } } } = null as never;`,
      'schema',
      ['components', 'button']
    );
    expect(model.root.name).toBe('button');
    expect(root(model).kind).toBe('object');
    expect(root(model).properties?.map((item) => item.key)).toEqual(['name']);
  });

  it('keeps primitives and unsupported forms explicit', () => {
    const primitive = inspect('export type Example = string;');
    expect(root(primitive)).toMatchObject({ kind: 'primitive', label: 'string' });
    const model = inspect('export type Example = { action: () => void; opaque: any; id: bigint };');
    expect(model.diagnostics).toHaveLength(3);
    expect(root(model).properties?.map((item) => model.definitions[item.typeId].kind)).toEqual([
      'unsupported',
      'unsupported',
      'unsupported'
    ]);
    const variadic = inspect('export type Example = [string, ...number[]];');
    expect(root(variadic).kind).toBe('unsupported');
    expect(variadic.diagnostics[0].message).toContain('Variadic tuple');
  });

  it('fails for unavailable exports, property paths, syntax and unresolved roots', () => {
    expect(() => inspect('export type Another = string;')).toThrow('Export "Example"');
    expect(() =>
      inspect('export type Example = { present: number };', 'Example', ['absent'])
    ).toThrow('property "absent"');
    expect(() => inspect('export type Example = { broken: ; };')).toThrow();
    expect(() =>
      inspect(`import type { Missing } from './unavailable.ts'; export type Example = Missing;`)
    ).toThrow('Type resolution failed');
  });

  it('does not emit an apparently complete object when a base or imported member is unresolved', () => {
    expect(() => inspect('export interface Example extends Missing { visible: string }')).toThrow(
      'Cannot find name'
    );
    expect(() =>
      inspect(
        `import type { Missing } from './unavailable.ts'; export interface Example extends Missing { visible: string }`
      )
    ).toThrow('Cannot find module');
    expect(() => inspect('export interface Example extends string { visible: string }')).toThrow(
      'Type resolution failed'
    );
  });

  it('does not turn unrelated assignment checks into an inspection gate', () => {
    const model = inspect(
      'const unrelated: number = "text"; export interface Example { value: string }'
    );
    expect(root(model).properties?.map((item) => item.key)).toEqual(['value']);
    expect(model.diagnostics).toEqual([]);
  });
});
