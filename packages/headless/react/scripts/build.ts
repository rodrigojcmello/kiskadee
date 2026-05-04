import { spawn } from 'node:child_process';
import { buildAllJavaScript } from './build-js.ts';
import { cleanDist } from './clean-dist.ts';
import { rewriteDistExtensions } from './rewrite-dist-extensions.ts';

const args = new Set(process.argv.slice(2));
const skipTypes = args.has('--skip-types');

function buildTypes(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'pnpm',
      ['exec', 'tsc', '-p', 'tsconfig.build.json', '--emitDeclarationOnly'],
      {
        stdio: 'inherit'
      }
    );

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Type declaration build failed with exit code ${code ?? 'unknown'}`));
    });
  });
}

async function build(): Promise<void> {
  if (!skipTypes) {
    await cleanDist();
  }

  await Promise.all(skipTypes ? [buildAllJavaScript()] : [buildAllJavaScript(), buildTypes()]);
  await rewriteDistExtensions();
}

build().catch((error) => {
  console.error('[react-headless] Failed to build:', error);
  process.exitCode = 1;
});
