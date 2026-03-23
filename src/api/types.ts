export interface PageQueryParams {
  page?: number;
  size?: number;
}

export interface PageResult<T> {
  total: number;
  current: number;
  size: number;
  records: T[];
}
