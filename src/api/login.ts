import { request } from '@/utils/http';

export interface LoginRequestPayload {
  username: string;
  password: string;
}

export interface LoginResponsePayload {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  buttonCodeList?: string[] | null;
  buttonCodes?: string[] | null;
  permissions?: string[] | null;
  permissionCodes?: string[] | null;
  user: {
    id: string;
    username: string;
    nickname?: string | null;
    buttonCodeList?: string[] | null;
    buttonCodes?: string[] | null;
    permissions?: string[] | null;
    permissionCodes?: string[] | null;
  };
}

export function loginApi(data: LoginRequestPayload) {
  return request<LoginRequestPayload, LoginResponsePayload>({
    url: '/auth/login',
    method: 'post',
    data
  });
}
