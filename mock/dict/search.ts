import { dictTreeData } from './dictTreeData.ts';

interface Query {
  query: {
    page: number;
    size: number;
    id: string;
    searchKey: string;
  };
}

const dictTreeList = dictTreeData.data as Mockm.IDictTree[];

export default {
  url: '/api/mock/dict/page/search',
  method: 'get',
  response: (req: Query): Mockm.IDictResponse => {
    const { searchKey } = req.query;
    const page = req.query.page || 1;
    const size = req.query.size || 10;
    const id = req.query.id || '';

    function resultById(): Mockm.IDictResponse {
      const filterList = filterDataById(id, searchKey, dictTreeList);
      const records = filterList.slice((page - 1) * size, page * size);
      return {
        code: 200,
        msg: 'success',
        data: {
          total: filterList.length,
          size: Number(size),
          current: Number(page),
          records
        }
      };
    }

    function resultByKey(): Mockm.IDictResponse {
      const filterList = filterDataByKey(searchKey, dictTreeList);
      const records = filterList.slice((page - 1) * size, page * size);
      return {
        code: 200,
        msg: 'success',
        data: {
          total: filterList.length,
          size: Number(size),
          current: Number(page),
          records
        }
      };
    }

    return id ? resultById() : resultByKey();
  }
};

function filterDataById(id: string, searchKey: string, list: Mockm.IDictTree[]) {
  const dataArr: Mockm.IDictTree[] = [];
  recursion(id, list);
  function recursion(id: string, list: Mockm.IDictTree[]) {
    for (const item of list) {
      if (item.id === id) {
        if (item.dictLabel.includes(searchKey)) {
          const newItem = { ...item };
          newItem.children && delete newItem.children;
          dataArr.push(newItem);
        }

        item.children && item.children.forEach(child => child.dictLabel.includes(searchKey) && dataArr.push(child));
      }
      else {
        if (item.children) {
          recursion(id, item.children);
        }
      }
    }
  }

  return dataArr;
}

function filterDataByKey(searchKey: string, list: Mockm.IDictTree[]) {
  const dataArr: Mockm.IDictTree[] = [];
  recursion(searchKey, list);
  function recursion(searchKey: string, list: Mockm.IDictTree[]) {
    for (const item of list) {
      if (item.dictLabel.includes(searchKey)) {
        dataArr.push(item);
      }
      else {
        if (item.children) {
          recursion(searchKey, item.children);
        }
      }
    }
  }

  return dataArr;
}
