declare namespace Mockm {
  interface Login {
    code: 200;
    data: MenuData[];
  }

  interface MenuData {
    pid: number;
    id: number;
    title: string;
    type: number;
    path: string;
    icon?: string;
    children?: Mockm.MenuData[];
  }

  interface RequestHeaders {
    [header: string]: any;
  }

  interface Root {
    url: string;
    body: Body;
    query: Query;
    headers: Headers;
  }

  interface Body {
    token: string;
  }

  interface Query {
  }

  interface Headers {
    'host': string;
    'connection': string;
    'cache-control': string;
    'sec-ch-ua': string;
    'sec-ch-ua-mobile': string;
    'sec-ch-ua-platform': string;
    'upgrade-insecure-requests': string;
    'user-agent': string;
    'accept': string;
    'sec-fetch-site': string;
    'sec-fetch-mode': string;
    'sec-fetch-user': string;
    'sec-fetch-dest': string;
    'accept-encoding': string;
    'accept-language': string;
    'cookie': string;
  }

  interface IDictTree {
    id: string;
    parentId: string;
    weight: number;
    name: string;
    tenantId: string;
    dictLabel: string;
    dictValue: string;
    category: string;
    sortCode: number;
    deleteFlag: string;
    children?: Mockm.IdictTree[];
  }

  interface IDictResponse {
    code: number;
    msg: string;
    data: {
      total: number;
      size: number;
      current: number;
      records: Mockm.IDictTree[];
    };
  }
}
