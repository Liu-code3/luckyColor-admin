import { request } from '@/utils/http';

/**
 * @description 获取树数据
 */
function getDictTreeApi() {
  return request({
    url: '/mock/dict/tree',
    method: 'get'
  });
}

/**
 * @description 获取表格数据
 */
function getTableDataApi(params: IDict.ITbParams) {
  return request({
    url: '/mock/dict/page',
    method: 'get',
    params
  });
}

export {
  getDictTreeApi,
  getTableDataApi
};
