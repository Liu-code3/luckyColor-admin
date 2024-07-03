declare namespace LayoutT {
  interface MenuItem {
    pid: number;
    id: number;
    title: string;
    type: number;
    path: string;
    key: string;
    icon: string;
    children?: MenuItem[];
  }

  interface TransformedMenuItem {
    pid: number;
    id: number;
    label: string;
    key: string;
    icon: any;
    children?: TransformedMenuItem[];
  }

  interface ILastMenu {
    pid: number;
    id: number;
    label: string;
    key: string;
  }
}
