import {
  AUTH_STORAGE_KEYS,
  type CurrentUserInfo,
  type LoginSessionPayload,
  type TenantContextInfo
} from '@/constants/auth';
import sysConfig from '@/config';
import tool from '@/utils/tool';

const AUTH_SESSION_CLEARED_EVENT = 'auth:session-cleared';
const TOKEN_EXPIRY_GUARD_MS = 5000;

let accessTokenExpiryTimer: number | null = null;

interface JwtPayloadLike {
  exp?: number;
}

export function setAccessToken(token: LoginSessionPayload['accessToken']) {
  tool.data.set(AUTH_STORAGE_KEYS.accessToken, token);
  scheduleAccessTokenExpiry(token);
}

export function getAccessToken() {
  return tool.data.get<string>(AUTH_STORAGE_KEYS.accessToken);
}

export function removeAccessToken() {
  clearAccessTokenExpiryTimer();
  tool.data.remove(AUTH_STORAGE_KEYS.accessToken);
}

export function setCurrentUserInfo(userInfo: CurrentUserInfo) {
  tool.data.set(AUTH_STORAGE_KEYS.userInfo, userInfo);
}

export function getCurrentUserInfo() {
  return tool.data.get<CurrentUserInfo>(AUTH_STORAGE_KEYS.userInfo);
}

export function setCurrentTenantContext(tenant: TenantContextInfo) {
  tool.data.set(AUTH_STORAGE_KEYS.currentTenant, tenant);
}

export function getCurrentTenantContext() {
  const cachedTenant = tool.data.get<TenantContextInfo>(AUTH_STORAGE_KEYS.currentTenant);

  if (cachedTenant?.tenantId) {
    return cachedTenant;
  }

  if (sysConfig.TENANT_ENABLED && sysConfig.DEFAULT_TENANT_ID) {
    const fallbackTenant = {
      tenantId: sysConfig.DEFAULT_TENANT_ID,
      source: 'env'
    } satisfies TenantContextInfo;

    setCurrentTenantContext(fallbackTenant);
    return fallbackTenant;
  }

  return null;
}

export function removeCurrentTenantContext() {
  tool.data.remove(AUTH_STORAGE_KEYS.currentTenant);
}

export function resolveTenantRequestHeaders() {
  const tenant = getCurrentTenantContext();

  if (!sysConfig.TENANT_ENABLED || !tenant?.tenantId) {
    return {};
  }

  return {
    [sysConfig.TENANT_HEADER_NAME]: tenant.tenantId
  };
}

export function removeCurrentUserInfo() {
  tool.data.remove(AUTH_STORAGE_KEYS.userInfo);
}

export function clearLoginSession(
  reason: 'manual' | 'expired' | 'invalid' = 'manual'
) {
  clearAccessTokenExpiryTimer();
  removeAccessToken();
  removeCurrentUserInfo();
  tool.data.remove(AUTH_STORAGE_KEYS.menuTree);
  tool.data.remove(AUTH_STORAGE_KEYS.lastViewPath);
  tool.data.remove(AUTH_STORAGE_KEYS.lockScreenPassword);
  tool.data.remove(AUTH_STORAGE_KEYS.tabs);
  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_CLEARED_EVENT, {
      detail: {
        reason
      }
    })
  );
}

export function getAccessTokenExpiresAt(token = getAccessToken()) {
  const payload = parseJwtPayload(token);

  if (!payload?.exp) {
    return null;
  }

  return payload.exp * 1000;
}

export function isAccessTokenExpired(bufferMs = 0, token = getAccessToken()) {
  const expiresAt = getAccessTokenExpiresAt(token);

  if (!expiresAt) {
    return false;
  }

  return Date.now() + bufferMs >= expiresAt;
}

export function initializeAuthSession() {
  const token = getAccessToken();

  if (!token) {
    clearAccessTokenExpiryTimer();
    return false;
  }

  const expiresAt = getAccessTokenExpiresAt(token);

  if (!expiresAt) {
    clearLoginSession('invalid');
    return false;
  }

  if (isAccessTokenExpired(TOKEN_EXPIRY_GUARD_MS, token)) {
    clearLoginSession('expired');
    return false;
  }

  scheduleAccessTokenExpiry(token);
  return true;
}

export function getUsableAccessToken() {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  const expiresAt = getAccessTokenExpiresAt(token);

  if (!expiresAt) {
    clearLoginSession('invalid');
    return null;
  }

  if (isAccessTokenExpired(TOKEN_EXPIRY_GUARD_MS, token)) {
    clearLoginSession('expired');
    return null;
  }

  scheduleAccessTokenExpiry(token);
  return token;
}

export function onAccessTokenRemoved(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.storageArea !== localStorage) {
      return;
    }

    if (
      event.key !== AUTH_STORAGE_KEYS.accessToken ||
      event.newValue !== null
    ) {
      return;
    }

    listener();
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
  };
}

function scheduleAccessTokenExpiry(token: string) {
  const expiresAt = getAccessTokenExpiresAt(token);

  clearAccessTokenExpiryTimer();

  if (!expiresAt) {
    return;
  }

  const delay = Math.max(expiresAt - Date.now(), 0);

  if (delay === 0) {
    clearLoginSession('expired');
    return;
  }

  accessTokenExpiryTimer = window.setTimeout(() => {
    clearLoginSession('expired');
  }, delay);
}

function clearAccessTokenExpiryTimer() {
  if (accessTokenExpiryTimer !== null) {
    window.clearTimeout(accessTokenExpiryTimer);
    accessTokenExpiryTimer = null;
  }
}

function parseJwtPayload(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const [, payloadSegment] = token.split('.');

  if (!payloadSegment) {
    return null;
  }

  try {
    const normalizedPayload = normalizeBase64Url(payloadSegment);
    const binary = window.atob(normalizedPayload);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayloadLike;
  } catch {
    return null;
  }
}

function normalizeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const remainder = normalized.length % 4;

  if (remainder === 0) {
    return normalized;
  }

  return normalized.padEnd(normalized.length + (4 - remainder), '=');
}
