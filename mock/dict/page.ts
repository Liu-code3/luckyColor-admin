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
  url: '/api/mock/dict/page',
  method: 'get',
  response: (req: Query): Mockm.IDictResponse => {
    const page = req.query.page || 1;
    const size = req.query.size || 10;
    const id = req.query.id || '';
    const searchKey = req.query.searchKey || '';

    if (!id && !searchKey) {
      const recordsAllList = bySortCode(treeToData(dictTreeList));
      const records = recordsAllList.slice((page - 1) * size, page * size);
      return {
        code: 200,
        msg: 'success',
        data: {
          total: recordsAllList.length,
          size: Number(size),
          current: Number(page),
          records
        }
      };
    }

    if (!id) {
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

    if (!searchKey) {
      const filterList = getFlattenedRecordsById(id, dictTreeList);
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

    if (id && searchKey) {
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

    return {
      code: 200,
      msg: 'success',
      data: {
        total: 0,
        size: Number(size),
        current: Number(page),
        records: []
      }
    };
  }
};

function treeToData(dictTreeData: Mockm.IDictTree[]) {
  const arrData: any[] = [];
  recursion(dictTreeData);
  function recursion(dictTreeData: Mockm.IDictTree[]) {
    for (const item of dictTreeData) {
      const newItem = { ...item };
      arrData.push(newItem); // 将当前项追加到结果数组中
      if (newItem.children) {
        recursion(newItem.children);
        delete newItem.children; // 移除 children 属性
      }
    }
  }
  return arrData;
}

function bySortCode(list: Mockm.IDictTree[]) {
  return list.sort((a, b) => {
    if (a.sortCode === b.sortCode) {
      return a.name.localeCompare(b.name, 'zh-CN'); // 次级排序条件，根据 name 属性进行字母顺序排序
    }
    return a.sortCode - b.sortCode;
  });
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

function getFlattenedRecordsById(id: string, dictTreeList: Mockm.IDictTree[]) {
  const result: Mockm.IDictTree[] = [];

  findAndFlatten(dictTreeList, id);
  function findAndFlatten(dictTreeList: Mockm.IDictTree[], id: string) {
    for (const record of dictTreeList) {
      if (record.id === id) {
        const { children, ...rest } = record;
        result.push(rest);
        if (children) {
          for (const child of children) {
            const { children: _, ...childRest } = child; // 去除子元素的children属性
            result.push(childRest);
          }
        }
        return;
      }
      if (record.children) {
        findAndFlatten(record.children, id);
      }
    }
  }

  return result.length ? result : [];
}

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
        item.children && recursion(id, item.children);
      }
    }
  }

  return dataArr;
}
