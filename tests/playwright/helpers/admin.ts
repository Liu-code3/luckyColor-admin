import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import type { Page, Response } from '@playwright/test';

export const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:9900';
export const BACKEND_URL = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:3001';
export const LOGIN_USERNAME = process.env.PLAYWRIGHT_LOGIN_USERNAME || 'admin';
export const LOGIN_PASSWORD = process.env.PLAYWRIGHT_LOGIN_PASSWORD || '123456';
export const REDIS_URL = process.env.PLAYWRIGHT_REDIS_URL || 'redis://127.0.0.1:6379';

const BACKEND_ROOT = process.env.PLAYWRIGHT_BACKEND_ROOT
  || resolve(process.cwd(), '..', 'luckyColor-admin-serve');
const backendRequire = createRequire(join(BACKEND_ROOT, 'package.json'));

type RedisClientLike = {
  get: (key: string) => Promise<string | null>;
  disconnect: () => void;
};

const Redis = backendRequire('ioredis') as new (url: string) => RedisClientLike;

export interface PageDiagnostics {
  consoleErrors: string[];
  pageErrors: string[];
  httpErrors: string[];
}

export function createDiagnostics(): PageDiagnostics {
  return {
    consoleErrors: [],
    pageErrors: [],
    httpErrors: []
  };
}

export function attachDiagnostics(page: Page, bucket: PageDiagnostics) {
  page.on('pageerror', (error) => {
    bucket.pageErrors.push(error.message);
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error' && !text.includes('ERR_CONNECTION_CLOSED'))
      bucket.consoleErrors.push(text);
  });

  page.on('response', (response) => {
    const url = response.url();
    const tracked = url.startsWith(FRONTEND_URL) || url.startsWith(BACKEND_URL);
    const ignored = url.includes('favicon.ico');

    if (tracked && !ignored && response.status() >= 400)
      bucket.httpErrors.push(`${response.status()} ${url}`);
  });
}

export async function loginAsAdmin(page: Page) {
  const captchaResponsePromise = page.waitForResponse((response) =>
    isCaptchaChallengeResponse(response)
  );

  await page.goto(`${FRONTEND_URL}/login`, {
    waitUntil: 'networkidle'
  });

  const captchaAnswer = await resolveCaptchaAnswer(captchaResponsePromise);

  await page
    .getByPlaceholder(/\u8bf7\u8f93\u5165\u767b\u5f55\u8d26\u53f7|Enter your username/)
    .fill(LOGIN_USERNAME);
  await page
    .getByPlaceholder(/\u8bf7\u8f93\u5165\u7ed3\u679c|Enter result/)
    .fill(captchaAnswer);
  await page
    .getByPlaceholder(/\u8bf7\u8f93\u5165\u767b\u5f55\u5bc6\u7801|Enter your password/)
    .fill(LOGIN_PASSWORD);
  await page
    .getByRole('button', {
      name: /\u8fdb\u5165\u5de5\u4f5c\u53f0|Enter workspace/
    })
    .click();

  await page.waitForURL(
    (url) => !url.pathname.includes('/login'),
    { timeout: 30000 }
  );
  await page.waitForLoadState('networkidle');
}

export function assertNoDiagnostics(diagnostics: PageDiagnostics) {
  if (diagnostics.consoleErrors.length || diagnostics.pageErrors.length || diagnostics.httpErrors.length)
    throw new Error(JSON.stringify(diagnostics, null, 2));
}

function isCaptchaChallengeResponse(response: Response) {
  return (
    response.request().method() === 'GET'
    && response.url().includes('/api/auth/captcha/challenge')
  );
}

async function resolveCaptchaAnswer(captchaResponsePromise: Promise<Response>) {
  const response = await captchaResponsePromise;
  const payload = await response.json() as {
    data?: {
      captchaId?: string;
    };
  };
  const captchaId = payload.data?.captchaId;

  if (!captchaId) {
    throw new Error(`missing captcha id in response: ${JSON.stringify(payload)}`);
  }

  const redis = new Redis(REDIS_URL);

  try {
    const cachedChallenge = await redis.get(
      `auth:login-captcha:challenge:${captchaId}`
    );

    if (!cachedChallenge) {
      throw new Error(`captcha challenge ${captchaId} not found in redis`);
    }

    const parsed = JSON.parse(cachedChallenge) as {
      answer?: string;
    };

    if (!parsed.answer) {
      throw new Error(`captcha answer missing for challenge ${captchaId}`);
    }

    return parsed.answer;
  } finally {
    redis.disconnect();
  }
}
