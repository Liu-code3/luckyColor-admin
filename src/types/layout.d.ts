declare namespace LayoutT {
  interface MenuRouteMeta {
    type?: 'iframe' | 'link' | 'route';
    url?: string;
    keepAlive?: boolean;
    hidden?: boolean;
    [key: string]: string | number | boolean | undefined;
  }

  interface MenuItem {
    pid: number;
    id: number;
    title: string;
    name: string;
    type: number;
    path: string;
    key: string;
    icon: string;
    layout: string;
    component: string;
    redirect?: string;
    isVisible?: boolean;
    meta?: MenuRouteMeta;
    children?: MenuItem[];
  }

  interface TransformedMenuItem {
    label: string;
    type: number;
    key: string;
    icon: () => VNode;
    layout: string;
    routeType?: MenuRouteMeta['type'];
    url?: string;
    children?: TransformedMenuItem[];
  }

  interface ITab {
    label: string;
    key: string;
    layout: string;
  }
}
