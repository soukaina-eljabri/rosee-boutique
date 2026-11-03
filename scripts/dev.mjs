import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Deux processus, un seul terminal. Fonctionne aussi sous Windows.
const api = spawn(process.execPath, ['--watch', 'server/index.js'], {
  stdio: 'inherit',
  env: process.env,
});
const vite = spawn(
  process.execPath,
  [
    fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url)),
    ...process.argv.slice(2),
  ],
  {
    stdio: 'inherit',
    env: process.env,
  },
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  api.kill('SIGTERM');
  vite.kill('SIGTERM');
  process.exitCode = code;
}
for (const child of [api, vite]) {
  child.on('error', (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on('exit', (code) => {
    if (!stopping) stop(code || 0);
  });
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
