import {
  AUTH_STORAGE_KEYS,
  type CurrentUserInfo,
  type LoginSessionPayload,
  type TenantContextInfo
} from '@/constants/auth';
import sysConfig from '@/config';
import tool from '@/utils/tool';

const AUTH_SESSION_CLEARED_EVENT = 'auth:session-cleared';
const AUTH_SESSION_SYNC_KEY = 'AUTH_SESSION_SIGNAL';

type SessionClearReason = 'manual' | 'expired' | 'invalid';
type SessionClearSource = 'local' | 'remote';

let accessTokenState: string | null = null;

function clearCachedSessionState() {
  accessTokenState = null;
  removeCurrentUserInfo();
  tool.data.remove(AUTH_STORAGE_KEYS.menuTree);
  tool.data.remove(AUTH_STORAGE_KEYS.lastViewPath);
  tool.data.remove(AUTH_STORAGE_KEYS.lockScreenPassword);
  tool.data.remove(AUTH_STORAGE_KEYS.tabs);
}

function broadcastSessionCleared(reason: SessionClearReason) {
  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_CLEARED_EVENT, {
      detail: {
        reason
      }
    })
  );

  window.localStorage.setItem(
    AUTH_SESSION_SYNC_KEY,
    JSON.stringify({
      reason,
      at: Date.now()
    })
  );
}

export function setAccessToken(token: LoginSessionPayload['accessToken']) {
  accessTokenState = token;
}

export function getAccessToken() {
  return accessTokenState;
}

export function removeAccessToken() {
  accessTokenState = null;
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
  const cachedTenant = tool.data.get<TenantContextInfo>(
    AUTH_STORAGE_KEYS.currentTenant
  );

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
  reason: SessionClearReason = 'manual'
) {
  clearCachedSessionState();
  broadcastSessionCleared(reason);
}

export function initializeAuthSession() {
  return Boolean(accessTokenState);
}

export function getUsableAccessToken() {
  return accessTokenState;
}

export function onAuthSessionCleared(
  listener: (payload: {
    reason: SessionClearReason;
    source: SessionClearSource;
  }) => void
) {
  const handleLocalEvent = (event: Event) => {
    const { detail } = event as CustomEvent<{ reason?: SessionClearReason }>;

    listener({
      reason: detail?.reason || 'manual',
      source: 'local'
    });
  };

  const handleStorage = (event: StorageEvent) => {
    if (
      event.storageArea !== localStorage ||
      event.key !== AUTH_SESSION_SYNC_KEY ||
      !event.newValue
    ) {
      return;
    }

    clearCachedSessionState();

    try {
      const payload = JSON.parse(event.newValue) as {
        reason?: SessionClearReason;
      };

      listener({
        reason: payload.reason || 'manual',
        source: 'remote'
      });
    } catch {
      listener({
        reason: 'manual',
        source: 'remote'
      });
    }
  };

  window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleLocalEvent);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, handleLocalEvent);
    window.removeEventListener('storage', handleStorage);
  };
}
