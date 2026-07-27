import { spawn } from 'node:child_process';
import { buildAllJavaScript } from './build-js.ts';
import { cleanDist } from './clean-dist.ts';
import { copyCrossPlatformAssets } from './copy-cross-platform-assets.ts';
import { generateReactComponents } from './generate-react.ts';
import { rewriteDistExtensions } from './rewrite-dist-extensions.ts';

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
  await generateReactComponents();
  await cleanDist();
  await Promise.all([buildAllJavaScript(), buildTypes(), copyCrossPlatformAssets()]);
  await rewriteDistExtensions();
}

build().catch((error) => {
  console.error('[icons] Failed to build:', error);
  process.exitCode = 1;
});
