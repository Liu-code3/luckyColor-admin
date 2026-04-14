import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(currentFile), '..');
const backendRoot = resolve(projectRoot, '..', 'luckyColor-admin-springboot');
const backendBaseUrl = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:3001';
const backendHealthUrl = `${backendBaseUrl}/api/health`;
const headed = process.argv.includes('--headed');

let backendProcess = null;

try {
  const backendAlreadyRunning = await isBackendReady();

  if (!backendAlreadyRunning) {
    backendProcess = spawn('sh', [ 'mvnw', 'spring-boot:run' ], {
      cwd: backendRoot,
      stdio: 'inherit'
    });
    await waitForBackendReady();
  }

  await runCommand(process.execPath, [ resolve(projectRoot, 'scripts/sync-system-menus.mjs') ]);

  const playwrightArgs = [ 'exec', 'playwright', 'test' ];
  if (headed) {
    playwrightArgs.push('--headed');
  }

  await runCommand('pnpm', playwrightArgs, {
    PLAYWRIGHT_BACKEND_MODE: 'external'
  });
} finally {
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
  }
}

async function isBackendReady() {
  try {
    const response = await fetch(backendHealthUrl);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForBackendReady() {
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    if (await isBackendReady()) {
      return;
    }
    await new Promise(resolvePromise => setTimeout(resolvePromise, 1000));
  }
  throw new Error(`Backend did not become ready: ${backendHealthUrl}`);
}

function runCommand(command, args, extraEnv = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        ...extraEnv
      }
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        rejectPromise(new Error(`${command} exited with signal ${signal}`));
        return;
      }
      if (code !== 0) {
        rejectPromise(new Error(`${command} exited with code ${code}`));
        return;
      }
      resolvePromise();
    });

    child.on('error', rejectPromise);
  });
}
