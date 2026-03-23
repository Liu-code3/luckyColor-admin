import { request } from '@/utils/http';

export interface LoginUserProfile {
  id: string;
  username: string;
  nickname?: string | null;
  buttonCodeList?: string[] | null;
  buttonCodes?: string[] | null;
  permissions?: string[] | null;
  permissionCodes?: string[] | null;
}

export function getProfileApi() {
  return request<never, LoginUserProfile>({
    url: '/auth/profile',
    method: 'get'
  });
}
