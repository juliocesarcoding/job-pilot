import { spawn } from 'node:child_process';
import { loadDatabaseEnv } from '../src/env';

loadDatabaseEnv();

const child = spawn('prisma', process.argv.slice(2), {
  shell: true,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
