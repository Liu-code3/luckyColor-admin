import {
  AUTH_STORAGE_KEYS,
  type CurrentUserInfo,
  type LoginSessionPayload
} from '@/constants/auth';
import tool from '@/utils/tool';

export function setAccessToken(token: LoginSessionPayload['accessToken']) {
  tool.data.set(AUTH_STORAGE_KEYS.accessToken, token);
}

export function getAccessToken() {
  return tool.data.get<string>(AUTH_STORAGE_KEYS.accessToken);
}

export function removeAccessToken() {
  tool.data.remove(AUTH_STORAGE_KEYS.accessToken);
}

export function setCurrentUserInfo(userInfo: CurrentUserInfo) {
  tool.data.set(AUTH_STORAGE_KEYS.userInfo, userInfo);
}

export function getCurrentUserInfo() {
  return tool.data.get<CurrentUserInfo>(AUTH_STORAGE_KEYS.userInfo);
}

export function removeCurrentUserInfo() {
  tool.data.remove(AUTH_STORAGE_KEYS.userInfo);
}
