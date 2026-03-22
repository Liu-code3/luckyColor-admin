import { request } from '@/utils/http';

export interface LoginUserProfile {
  id: string;
  username: string;
  nickname?: string | null;
}

export function getProfileApi() {
  return request<never, LoginUserProfile>({
    url: '/auth/profile',
    method: 'get'
  });
}
