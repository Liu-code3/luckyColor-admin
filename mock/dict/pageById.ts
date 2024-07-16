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
  url: '/api/mock/dict/page/id/:id',
  method: 'get',
  response: (req: Query): Mockm.IDictResponse => {
    const page = req.query.page || 1;
    const size = req.query.size || 10;
    const match = req.url.match(/\/api\/mock\/dict\/page\/id\/([^?]+)/);
    const id = match?.length ? match[1] : '';

    const filterData = getFlattenedRecordsById(dictTreeList, id);
    const records = filterData.slice((page - 1) * size, page * size);

    const successInfo = {
      code: 200,
      msg: 'success',
      data: {
        total: filterData.length,
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

function getFlattenedRecordsById(dictTreeList: Mockm.IDictTree[], id: string) {
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
