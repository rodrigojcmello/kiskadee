import { type ChildProcess, spawn } from 'node:child_process';

const commandByPlatform = (command: string): string =>
  process.platform === 'win32' ? `${command}.cmd` : command;
const pnpm = commandByPlatform('pnpm');
const next = commandByPlatform('next');
const children = new Set<ChildProcess>();

let isStopping = false;

function runOnce(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit'
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(`${command} ${args.join(' ')} failed with ${signal ?? `exit code ${code}`}`)
      );
    });
  });
}

function start(command: string, args: string[]): ChildProcess {
  const child = spawn(command, args, {
    stdio: 'inherit'
  });

  children.add(child);

  child.on('exit', (code, signal) => {
    children.delete(child);

    if (!isStopping) {
      process.exitCode = code ?? (signal ? 0 : 1);
      stopChildren('SIGTERM');
    }
  });

  return child;
}

function stopChildren(signal: NodeJS.Signals): void {
  isStopping = true;

  for (const child of children) {
    child.kill(signal);
  }
}

async function main(): Promise<void> {
  await Promise.all([
    runOnce(pnpm, ['--filter', '@kiskadee/react-components', 'run', 'build:dev']),
    runOnce(pnpm, ['--filter', '@kiskadee/web-builder', 'run', 'build-sync-generate'])
  ]);

  start(pnpm, [
    '--filter',
    '@kiskadee/react-components',
    'run',
    'dev:styles',
    '--',
    '--skip-initial'
  ]);
  start(next, ['dev']);
}

process.on('SIGINT', () => {
  stopChildren('SIGINT');
});

process.on('SIGTERM', () => {
  stopChildren('SIGTERM');
});

main().catch((error) => {
  console.error('[showcase] Failed to start dev:', error);
  stopChildren('SIGTERM');
  process.exitCode = 1;
});
