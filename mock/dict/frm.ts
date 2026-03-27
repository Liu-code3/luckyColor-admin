import { dictTreeData } from './dictTreeData';

export default {
  url: '/api/dict/tree',
  method: 'get',
  response: () => {
    return dictTreeData;
  }
};
