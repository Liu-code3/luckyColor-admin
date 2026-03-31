import axios from 'axios';
import sysConfig from '@/config';
import { clearLoginSession, getAccessToken, setAccessToken } from '@/utils/auth';

const AUTH_TOKEN_EXPIRED = 1011007;
const AUTH_TOKEN_INVALID = 1011008;
const AUTH_REFRESH_TOKEN_EXPIRED = 1011009;
const AUTH_REFRESH_TOKEN_INVALID = 1011010;

const sessionClient = axios.create({
  baseURL: sysConfig.API_URL,
  timeout: sysConfig.TIMEOUT,
  withCredentials: true
});

let refreshPromise: Promise<string | null> | null = null;

export function isAccessTokenRecoverable(code?: number | null) {
  return code === AUTH_TOKEN_EXPIRED || code === AUTH_TOKEN_INVALID;
}

export function isRefreshTokenRejected(code?: number | null) {
  return (
    code === AUTH_REFRESH_TOKEN_EXPIRED || code === AUTH_REFRESH_TOKEN_INVALID
  );
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = sessionClient
      .post('/auth/refresh')
      .then(({ data }) => {
        const accessToken = data?.data?.accessToken;

        if (!accessToken) {
          clearLoginSession('invalid');
          return null;
        }

        setAccessToken(accessToken);
        return accessToken;
      })
      .catch((error) => {
        const code = resolveErrorCode(error);
        clearLoginSession(
          code === AUTH_REFRESH_TOKEN_EXPIRED ? 'expired' : 'invalid'
        );
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function ensureAccessToken() {
  const token = getAccessToken();

  if (token) {
    return token;
  }

  return refreshAccessToken();
}

export async function logoutSession() {
  const token = getAccessToken();
  const headers = token
    ? {
        [sysConfig.TOKEN_NAME]: sysConfig.TOKEN_PREFIX + token
      }
    : undefined;

  try {
    await sessionClient.post('/auth/logout', undefined, {
      headers
    });
  } catch {
    // Local cleanup still runs even if logout request fails.
  } finally {
    clearLoginSession('manual');
  }
}

function resolveErrorCode(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'code' in error.response.data
  ) {
    const code = (error.response.data as { code?: unknown }).code;
    return typeof code === 'number' ? code : null;
  }

  return null;
}
