declare namespace App {
  type GlobalMenuOption = import('naive-ui').MenuOption & {
    pid: number;
    id: number;
    title: string;
    type: number;
    path: string;
    icon?: () => import('vue').VNodeChild;
    children?: App.GlobalMenuOption[];
  };
}
