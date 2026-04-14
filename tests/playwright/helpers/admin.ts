import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { APIResponse, Page } from '@playwright/test';

export const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:9900';
export const BACKEND_URL = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:3001';
export const LOGIN_USERNAME = process.env.PLAYWRIGHT_LOGIN_USERNAME || 'admin';
export const LOGIN_PASSWORD = process.env.PLAYWRIGHT_LOGIN_PASSWORD || '123456';
export const LOGIN_TENANT_ID = process.env.PLAYWRIGHT_TENANT_ID || 'tenant_001';

const SESSION_CACHE_PATH = path.join(os.tmpdir(), 'luckycolor-playwright-admin-session-v3.json');
const SESSION_LOCK_PATH = `${SESSION_CACHE_PATH}.lock`;
const SESSION_TTL_MS = 10 * 60 * 1000;

interface AdminSessionCache {
  createdAt: number;
  accessToken: string;
  tokenType: string;
  userInfo: {
    id: string;
    tenantId: string;
    tenantName?: string | null;
    username: string;
    displayName: string;
    roleCodes?: string[];
    buttonCodeList: string[];
    dataScopeType?: string;
    dataScopeDeptIds?: number[];
  };
  currentTenant: {
    tenantId: string;
    tenantName?: string | null;
    source: 'login';
  };
  menuTree: unknown[];
}

export interface AdminSessionSnapshot extends AdminSessionCache {}

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
  const session = await getAdminSession(page);

  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        data: {
          accessToken: session.accessToken,
          tokenType: session.tokenType
        },
        msg: 'ok'
      })
    });
  });

  await page.goto(`${FRONTEND_URL}/login`, {
    waitUntil: 'domcontentloaded'
  });
  await page.evaluate(({ userInfo, currentTenant, menuTree }) => {
    window.localStorage.setItem('AUTH_USER_INFO', JSON.stringify(userInfo));
    window.localStorage.setItem('AUTH_CURRENT_TENANT', JSON.stringify(currentTenant));
    window.localStorage.setItem('AUTH_MENU_TREE', JSON.stringify(menuTree));
    window.localStorage.setItem('AUTH_TABS', JSON.stringify([]));
  }, {
    userInfo: session.userInfo,
    currentTenant: session.currentTenant,
    menuTree: session.menuTree
  });

  await page.goto(`${FRONTEND_URL}/index`, {
    waitUntil: 'domcontentloaded'
  });
  await page.waitForURL(
    (url) => !url.pathname.includes('/login'),
    { timeout: 30000 }
  );
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => {
    const rawMenuTree = window.localStorage.getItem('AUTH_MENU_TREE');
    if (!rawMenuTree) {
      return false;
    }

    try {
      const menuTree = JSON.parse(rawMenuTree);
      return Array.isArray(menuTree) && menuTree.length > 0;
    }
    catch {
      return false;
    }
  });
}

export async function getAdminSessionSnapshot(page: Page): Promise<AdminSessionSnapshot> {
  return getAdminSession(page);
}

export function assertNoDiagnostics(diagnostics: PageDiagnostics) {
  if (diagnostics.consoleErrors.length || diagnostics.pageErrors.length || diagnostics.httpErrors.length)
    throw new Error(JSON.stringify(diagnostics, null, 2));
}

async function readSuccessPayload<TData = unknown>(response: {
  ok(): boolean;
  status(): number;
  text(): Promise<string>;
}) {
  const rawText = await response.text();
  const payload = JSON.parse(rawText) as {
    code?: number;
    data?: TData;
    msg?: string;
  };

  if (!response.ok() || payload.code !== 200 || payload.data === undefined) {
    throw new Error(rawText || `request failed with status ${response.status()}`);
  }

  return payload.data;
}

async function syncResponseCookiesToContext(page: Page, response: APIResponse) {
  const backendUrl = new URL(BACKEND_URL);
  const cookies = response
    .headersArray()
    .filter(header => header.name.toLowerCase() === 'set-cookie')
    .map(header => parseSetCookie(header.value, backendUrl))
    .filter((cookie): cookie is Exclude<typeof cookie, null> => Boolean(cookie));

  if (!cookies.length) {
    return;
  }

  await page.context().addCookies(cookies);
}

async function getAdminSession(page: Page) {
  const cachedSession = await readCachedAdminSession();
  if (cachedSession) {
    return cachedSession;
  }

  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    const lock = await tryAcquireSessionLock();
    if (!lock) {
      await wait(250);
      const existingSession = await readCachedAdminSession();
      if (existingSession) {
        return existingSession;
      }
      continue;
    }

    try {
      const existingSession = await readCachedAdminSession();
      if (existingSession) {
        return existingSession;
      }

      const nextSession = await createAdminSession(page);
      await fs.writeFile(SESSION_CACHE_PATH, JSON.stringify(nextSession), 'utf8');
      return nextSession;
    }
    finally {
      await lock.close();
      await fs.unlink(SESSION_LOCK_PATH).catch(() => {});
    }
  }

  throw new Error('timed out waiting for shared admin session');
}

async function createAdminSession(page: Page): Promise<AdminSessionCache> {
  const challenge = await readSuccessPayload<{
    captchaId: string;
    captchaSvg: string;
  }>(await page.request.get(`${BACKEND_URL}/api/auth/captcha/challenge`, {
    headers: {
      'x-tenant-id': LOGIN_TENANT_ID
    }
  }));
  const captchaAnswer = solveArithmeticCaptcha(challenge.captchaSvg);
  const verification = await readSuccessPayload<{
    captchaToken: string;
  }>(await page.request.post(`${BACKEND_URL}/api/auth/captcha/verify`, {
    data: {
      captchaId: challenge.captchaId,
      answer: captchaAnswer
    },
    headers: {
      'x-tenant-id': LOGIN_TENANT_ID
    }
  }));
  const loginResponse = await page.request.post(`${BACKEND_URL}/api/auth/login`, {
    data: {
      username: LOGIN_USERNAME,
      password: LOGIN_PASSWORD,
      captchaToken: verification.captchaToken
    },
    headers: {
      'x-tenant-id': LOGIN_TENANT_ID
    }
  });
  const loginData = await readSuccessPayload<{
    accessToken: string;
    tokenType?: string;
    user: {
      id: string;
      tenantId: string;
      tenantName?: string | null;
      username: string;
      nickname?: string | null;
      roleCodes?: string[] | null;
      buttonCodeList?: string[] | null;
      buttonCodes?: string[] | null;
      permissions?: string[] | null;
      permissionCodes?: string[] | null;
      dataScopeType?: string | null;
      dataScopeDeptIds?: number[] | null;
    };
    buttonCodeList?: string[] | null;
    buttonCodes?: string[] | null;
    permissions?: string[] | null;
    permissionCodes?: string[] | null;
    dataScopeType?: string | null;
    dataScopeDeptIds?: number[] | null;
  }>(loginResponse);
  await syncResponseCookiesToContext(page, loginResponse);
  const menuTree = await readSuccessPayload<unknown[]>(await page.request.get(`${BACKEND_URL}/api/menus/tree`, {
    headers: {
      Authorization: `Bearer ${loginData.accessToken}`,
      'x-tenant-id': loginData.user.tenantId || LOGIN_TENANT_ID
    }
  }));

  return {
    createdAt: Date.now(),
    accessToken: loginData.accessToken,
    tokenType: loginData.tokenType || 'Bearer',
    userInfo: buildCurrentUserInfo(loginData),
    currentTenant: {
      tenantId: loginData.user.tenantId,
      tenantName: loginData.user.tenantName ?? null,
      source: 'login'
    },
    menuTree
  };
}

async function readCachedAdminSession() {
  try {
    const rawSession = await fs.readFile(SESSION_CACHE_PATH, 'utf8');
    const session = JSON.parse(rawSession) as AdminSessionCache;
    if (!session.createdAt || Date.now() - session.createdAt > SESSION_TTL_MS) {
      return null;
    }
    return session;
  }
  catch {
    return null;
  }
}

async function tryAcquireSessionLock() {
  try {
    return await fs.open(SESSION_LOCK_PATH, 'wx');
  }
  catch {
    return null;
  }
}

async function wait(timeoutMs: number) {
  await new Promise(resolve => setTimeout(resolve, timeoutMs));
}

function buildCurrentUserInfo(loginData: {
  user: {
    id: string;
    tenantId: string;
    tenantName?: string | null;
    username: string;
    nickname?: string | null;
    roleCodes?: string[] | null;
    buttonCodeList?: string[] | null;
    buttonCodes?: string[] | null;
    permissions?: string[] | null;
    permissionCodes?: string[] | null;
    dataScopeType?: string | null;
    dataScopeDeptIds?: number[] | null;
  };
  buttonCodeList?: string[] | null;
  buttonCodes?: string[] | null;
  permissions?: string[] | null;
  permissionCodes?: string[] | null;
  dataScopeType?: string | null;
  dataScopeDeptIds?: number[] | null;
}) {
  return {
    id: loginData.user.id,
    tenantId: loginData.user.tenantId,
    tenantName: loginData.user.tenantName ?? null,
    username: loginData.user.username,
    displayName: loginData.user.nickname || loginData.user.username,
    roleCodes: loginData.user.roleCodes || undefined,
    buttonCodeList: resolveButtonCodeList(loginData),
    dataScopeType: loginData.user.dataScopeType || loginData.dataScopeType || undefined,
    dataScopeDeptIds: loginData.user.dataScopeDeptIds || loginData.dataScopeDeptIds || undefined
  };
}

function resolveButtonCodeList(loginData: {
  user: {
    username: string;
  } & Record<string, unknown>;
} & Record<string, unknown>) {
  const permissionCodes = collectPermissionCodes(loginData.user, loginData);
  if (permissionCodes.length) {
    return permissionCodes;
  }

  if (loginData.user.username.trim().toLowerCase() === 'admin') {
    return [
      'system:user:create',
      'system:user:update',
      'system:user:delete',
      'system:user:assign-role',
      'system:role:create',
      'system:role:update',
      'system:role:delete',
      'system:role:authorize',
      'system:menu:create',
      'system:menu:update',
      'system:menu:delete',
      'system:department:create',
      'system:department:update',
      'system:department:delete',
      'tenant:create',
      'tenant:update',
      'tenant:delete',
      'tenant:package:create',
      'tenant:package:update',
      'tenant:package:delete'
    ];
  }

  return [];
}

function collectPermissionCodes(...sources: Array<Record<string, unknown> | null | undefined>) {
  const values = sources.flatMap((source) => {
    if (!source) {
      return [];
    }

    return [
      source.buttonCodeList,
      source.buttonCodes,
      source.permissions,
      source.permissionCodes
    ];
  });

  return [ ...new Set(values.flatMap((value) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean);
  })) ];
}

function parseSetCookie(setCookieHeader: string, backendUrl: URL) {
  const [nameValuePair, ...attributeParts] = setCookieHeader.split(/;\s*/u);
  const separatorIndex = nameValuePair.indexOf('=');
  if (separatorIndex <= 0) {
    return null;
  }

  const cookie = {
    name: nameValuePair.slice(0, separatorIndex),
    value: nameValuePair.slice(separatorIndex + 1),
    domain: backendUrl.hostname,
    path: '/',
    httpOnly: false,
    secure: backendUrl.protocol === 'https:',
    sameSite: 'Lax' as const,
    expires: -1
  };

  attributeParts.forEach((attribute) => {
    const [rawKey, ...rawValueParts] = attribute.split('=');
    const key = rawKey.trim().toLowerCase();
    const value = rawValueParts.join('=').trim();

    if (key === 'path' && value) {
      cookie.path = value;
      return;
    }

    if (key === 'domain' && value) {
      cookie.domain = value.replace(/^\./u, '');
      return;
    }

    if (key === 'httponly') {
      cookie.httpOnly = true;
      return;
    }

    if (key === 'secure') {
      cookie.secure = true;
      return;
    }

    if (key === 'samesite' && value) {
      if (value.toLowerCase() === 'strict') {
        cookie.sameSite = 'Strict';
        return;
      }

      if (value.toLowerCase() === 'none') {
        cookie.sameSite = 'None';
        return;
      }

      cookie.sameSite = 'Lax';
      return;
    }

    if (key === 'max-age' && value) {
      const maxAge = Number.parseInt(value, 10);
      if (!Number.isNaN(maxAge)) {
        cookie.expires = Math.floor(Date.now() / 1000) + maxAge;
      }
      return;
    }

    if (key === 'expires' && value) {
      const expiresAt = Date.parse(value);
      if (!Number.isNaN(expiresAt)) {
        cookie.expires = Math.floor(expiresAt / 1000);
      }
    }
  });

  return cookie;
}

function solveArithmeticCaptcha(captchaSvg: string) {
  const expression = extractCaptchaExpression(captchaSvg);
  const match = expression.match(/(\d+)\s*([+-])\s*(\d+)\s*=\s*\?/u);

  if (!match) {
    throw new Error(`unrecognized captcha expression: ${expression}`);
  }

  const left = Number.parseInt(match[1], 10);
  const operator = match[2];
  const right = Number.parseInt(match[3], 10);

  return String(operator === '+' ? left + right : left - right);
}

function extractCaptchaExpression(captchaSvg: string) {
  const match = captchaSvg.match(/<text[^>]*>([^<]+)<\/text>/iu);
  if (!match?.[1]) {
    throw new Error(`captcha svg does not contain expression: ${captchaSvg}`);
  }

  return match[1].replace(/\s+/gu, ' ').trim();
}
