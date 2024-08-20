// import { useIconRender } from '@/hooks/iconRender';

// const iconRender = useIconRender();
// 处理菜单数据
export function handlMenuList(menuList: Mockm.MenuData[]) {
  const parent = menuList.filter(item => item.pid === 0) as App.GlobalMenuOption[];
  const children = menuList.filter(item => item.pid !== 0) as App.GlobalMenuOption[];

  dataToTree<App.GlobalMenuOption>(parent, children);

  function dataToTree<T extends App.GlobalMenuOption>(parent: T[], children: T[]) {
    parent.forEach((p: T, i: number) => {
      children.forEach((c: T) => {
        if (p.id === c.pid) {
          // 深拷贝确保_children和原始数组c之间没有引用关系，即修改_children不会影响到c。
          const _children = JSON.parse(JSON.stringify(children));
          // 从_children数组中移除了当前处理的父节点在原数组c中的位置。这一步确保在后续的递归调用中，已经处理过的父节点不会再出现在它的子节点列表中。
          _children.splice(i, 1);
          dataToTree([ c ], _children);
          if (p.children)
            p.children.push(c);
          else
            p.children = [ c ];
        }
      });
    });
  }

  return parent;
}
