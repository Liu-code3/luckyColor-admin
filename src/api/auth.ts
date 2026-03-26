import type { DataScopeType } from '@/constants/data-scope';
import { request } from '@/utils/http';

export interface LoginUserProfile {
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
}

export function getProfileApi() {
  return request<never, LoginUserProfile>({
    url: '/auth/profile',
    method: 'get'
  });
}
