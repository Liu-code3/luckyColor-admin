import { request } from '@/utils/http';

export interface LoginRequestPayload {
  username: string;
  password: string;
}

export interface LoginResponsePayload {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: {
    id: string;
    username: string;
    nickname?: string | null;
  };
}

export function loginApi(data: LoginRequestPayload) {
  return request<LoginRequestPayload, LoginResponsePayload>({
    url: '/auth/login',
    method: 'post',
    data
  });
}
