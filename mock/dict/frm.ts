import { dictTreeData } from './dictTreeData';

export default {
  url: '/api/mock/dict/tree',
  method: 'get',
  response: () => {
    return dictTreeData;
  }
};
