import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(currentFile), '..');
const viteBin = resolve(projectRoot, 'node_modules/vite/bin/vite.js');

function readEnvFilePort() {
  const envPath = resolve(projectRoot, '.env');

  if (!existsSync(envPath))
    return undefined;

  const content = readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#'))
      continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1)
      continue;

    const key = line.slice(0, separatorIndex).trim();
    if (key !== 'VITE_PORT')
      continue;

    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/gu, '');
    const port = Number(value);
    return Number.isInteger(port) && port > 0 ? port : undefined;
  }

  return undefined;
}

function resolvePort() {
  return Number(process.env.VITE_PORT) || readEnvFilePort() || 9900;
}

function runCommand(command, args) {
  return execFileSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: [ 'ignore', 'pipe', 'ignore' ]
  }).trim();
}

function findListeningPid(port) {
  try {
    const output = runCommand('lsof', [ '-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-Fp' ]);
    const pidLine = output.split(/\r?\n/u).find(line => line.startsWith('p'));
    if (!pidLine)
      return undefined;

    return Number(pidLine.slice(1));
  }
  catch {
    return undefined;
  }
}

function readProcessCommand(pid) {
  try {
    return runCommand('ps', [ '-p', String(pid), '-o', 'command=' ]);
  }
  catch {
    return '';
  }
}

function isCurrentProjectSpringBootServer(command) {
  return command.includes(projectRoot)
    && command.includes('vite')
    && command.includes('springboot');
}

function startVite(port) {
  const child = spawn(process.execPath, [ viteBin, '--mode', 'springboot', '--port', String(port), '--strictPort' ], {
    cwd: projectRoot,
    stdio: 'inherit'
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

const port = resolvePort();
const existingPid = findListeningPid(port);

if (existingPid) {
  const command = readProcessCommand(existingPid);
  if (isCurrentProjectSpringBootServer(command)) {
    console.log(`Spring Boot dev server is already running on http://127.0.0.1:${port}/ (pid ${existingPid}).`);
    process.exit(0);
  }

  console.error(`Port ${port} is already in use by pid ${existingPid}.`);
  if (command)
    console.error(command);
  console.error('Stop the conflicting process or change VITE_PORT before starting Spring Boot mode.');
  process.exit(1);
}

startVite(port);
