export interface PageQueryParams {
  page?: number;
  size?: number;
}

export interface DataScopeQueryParams {
  dataScopeType?: string;
  dataScopeDeptIds?: string;
  dataScopeUserId?: string;
}

export interface PageResult<T> {
  total: number;
  current: number;
  size: number;
  records: T[];
}
