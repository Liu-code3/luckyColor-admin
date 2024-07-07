import { dictTreeData } from './dictTreeData.ts';

interface Query {
  query: {
    page: number;
    size: number;
  };
}

const dictTreeList = dictTreeData.data as Mockm.IDictTree[];
const recordsAllList = bySortCode(treeToData(dictTreeList));

export default {
  url: '/api/mock/dict/page',
  method: 'get',
  response: (req: Query): Mockm.IDictResponse => {
    const page = req.query.page || 1;
    const size = req.query.size || 10;
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
