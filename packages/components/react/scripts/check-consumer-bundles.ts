import assert from 'node:assert/strict';
import path from 'node:path';
import { build } from 'esbuild';

const packageRoot = path.resolve(import.meta.dirname, '..');
const budgets = { Text: 20000, Badge: 25000, Card: 35000, Button: 90000, Switch: 90000 };
for (const [component, budget] of Object.entries(budgets)) {
  for (const subpath of ['', `/${component.toLowerCase()}`]) {
    const result = await build({
      absWorkingDir: packageRoot,
      stdin: {
        contents: `export { ${component} } from '@kiskadee/react-components${subpath}';`,
        resolveDir: packageRoot
      },
      bundle: true,
      splitting: true,
      format: 'esm',
      platform: 'browser',
      minify: true,
      write: false,
      metafile: true,
      outdir: '/tmp/kiskadee-consumer-check',
      external: ['react', 'react-dom', 'react/*', 'react-dom/*'],
      define: { 'process.env.NODE_ENV': '"production"' }
    });
    const outputs = result.metafile.outputs;
    const entry = Object.keys(outputs).find((key) => outputs[key].entryPoint === '<stdin>');
    assert(entry);
    const initial = new Set<string>();
    function visit(key: string) {
      if (initial.has(key)) return;
      initial.add(key);
      for (const dep of outputs[key].imports) {
        if (!dep.external && dep.kind === 'import-statement') visit(dep.path);
      }
    }
    visit(entry);
    const bytes = [...initial].reduce((sum, key) => sum + outputs[key].bytes, 0);
    const inputs = [...initial].flatMap((key) => Object.keys(outputs[key].inputs));
    assert(
      !inputs.some((input) => /[/\\]zod[/\\]|[/\\]zod@/.test(input)),
      `${component}${subpath} retains Zod`
    );
    assert(bytes <= budget, `${component}${subpath}: ${bytes} exceeds ${budget}`);
    const css = result.outputFiles.filter(
      (file) => path.relative(packageRoot, file.path) === outputs[entry].cssBundle
    );
    if (subpath === '/text')
      assert(
        css.reduce((sum, file) => sum + file.contents.length, 0) < 1000,
        'Text imports unrelated structural CSS'
      );
    console.log(
      `${component}${subpath || ' (root)'}: ${bytes} initial JS bytes; ${css.reduce((sum, file) => sum + file.contents.length, 0)} CSS bytes`
    );
  }
}
