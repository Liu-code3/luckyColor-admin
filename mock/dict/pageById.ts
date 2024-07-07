import { dictTreeData } from './dictTreeData.ts';

interface Query {
  url: string;
  query: {
    page: number;
    size: number;
  };
}

const dictTreeList = dictTreeData.data as Mockm.IDictTree[];

export default {
  url: '/api/mock/dict/page/:id',
  method: 'get',
  response: (req: Query): Mockm.IDictResponse => {
    const page = req.query.page || 1;
    const size = req.query.size || 10;
    const match = req.url.match(/\/api\/mock\/dict\/page\/([^?]+)/);
    const id = match?.length ? match[1] : '';

    const filterData = handleDictTree(dictTreeList, id);
    const records = filterData.slice((page - 1) * size, page * size);

    const successInfo = {
      code: 200,
      msg: 'success',
      data: {
        total: dictTreeList.length,
        size: Number(size),
        current: Number(page),
        records
      }
    };

    const errorInfo = {
      code: 400,
      msg: '请求参数id为空',
      data: {
        total: 0,
        size: Number(size),
        current: Number(page),
        records
      }
    };

    return id === '' ? errorInfo : successInfo;
  }
};

function handleDictTree(dictTreeList: Mockm.IDictTree[], id: string) {
  const records: Mockm.IDictTree[] = [];
  recursion(dictTreeList, id);
  function recursion(dictTreeList: Mockm.IDictTree[], id: string) {
    for (const item of dictTreeList) {
      if (item.children) {
        recursion(item.children, id);
      }
      if (item.id === id) {
        records.push(item);
      }
    }
  }

  return records;
}
