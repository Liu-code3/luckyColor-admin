declare namespace LayoutT {
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
    children?: MenuItem[];
  }

  interface TransformedMenuItem {
    label: string;
    type: number;
    key: string;
    icon: () => VNode;
    layout: string;
    children?: TransformedMenuItem[];
  }

  interface ITab {
    label: string;
    key: string;
    layout: string;
  }
}
