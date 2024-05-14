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
}
