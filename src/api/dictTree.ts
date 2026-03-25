import { request } from '@/utils/http';
import { mergeDataScopeQueryParams } from '@/utils/data-scope';

/**
 * @description 获取树数据
 */
function getDictTreeApi() {
  return request({
    url: '/dict/tree',
    method: 'get',
    params: mergeDataScopeQueryParams()
  });
}

/**
 * @description 获取表格数据
 */
function getTableDataApi(params: IDict.ITbParams) {
  return request({
    url: '/dict/page',
    method: 'get',
    params: mergeDataScopeQueryParams(params)
  });
}

export {
  getDictTreeApi,
  getTableDataApi
};
