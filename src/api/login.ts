import type { DataScopeType } from '@/constants/data-scope';
import { request } from '@/utils/http';

export interface LoginRequestPayload {
  username: string;
  password: string;
  captchaToken?: string;
}

export interface LoginResponsePayload {
  accessToken: string;
  tokenType: string;
  buttonCodeList?: string[] | null;
  buttonCodes?: string[] | null;
  permissions?: string[] | null;
  permissionCodes?: string[] | null;
  dataScopeType?: DataScopeType | null;
  dataScopeDeptIds?: number[] | null;
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
    dataScopeType?: DataScopeType | null;
    dataScopeDeptIds?: number[] | null;
  };
}

export function loginApi(data: LoginRequestPayload) {
  return request<LoginRequestPayload, LoginResponsePayload>({
    url: '/auth/login',
    method: 'post',
    data
  });
}
