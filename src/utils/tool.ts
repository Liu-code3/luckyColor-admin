// Interfaces for structured data handling
// interface DictTree {
//     [key: string]: DictItem[];
// }

import { Icon } from '@iconify/vue';

interface DictItem {
  dictValue: string;
  dictLabel?: string;
  name?: string;
  children?: DictItem[];
}

// Tool module
const tool = {

  data: {
    set<T>(table: string, settings: T): void {
      let _set = '';
      if (typeof settings === 'string') {
        _set = settings;
      }
      else {
        _set = JSON.stringify(settings);
      }
      localStorage.setItem(table, _set);
    },
    get<T>(table: string): T | null {
      const data = localStorage.getItem(table);
      if (data) {
        if (isValidJSON(data)) {
          return JSON.parse(data);
        }
        else {
          return data as T; // 返回原始字符串
        }
      }
      return null;
    },
    remove(table: string): void {
      localStorage.removeItem(table);
    },
    clear(): void {
      localStorage.clear();
    }
  },
  session: {
    set<T>(table: string, settings: T): void {
      let _set = '';
      if (typeof settings === 'string') {
        _set = settings;
      }
      else {
        _set = JSON.stringify(settings);
      }
      sessionStorage.setItem(table, _set);
    },
    get<T>(table: string): T | null {
      const data = sessionStorage.getItem(table);
      if (data) {
        if (isValidJSON(data)) {
          return JSON.parse(data);
        }
        else {
          return data as T; // 返回原始字符串
        }
      }
      return null;
    },
    remove(table: string): void {
      sessionStorage.removeItem(table);
    },
    clear(): void {
      sessionStorage.clear();
    }
  },
  groupSeparator(num: number): string {
    let numStr = num.toString();
    if (!numStr.includes('.'))
      numStr += '.';
    return numStr.replace(/(\d)(?=(\d{3})+\.)/g, '$1,').replace(/\.$/, '');
  },
  iconRender(icon: string) {
    // if(!icon) window.console.warn('需要传入图标名称~')
    return () => h(Icon, { icon });
  },
  dictDataAll(): DictItem[] | null {
    return tool.data.get('DICT_TYPE_TREE_DATA') as DictItem[];
  },
  dictTypeData(dictValue: string, value: string): string {
    const dictTypeTree = tool.dictDataAll();
    if (!dictTypeTree)
      return '需重新登录';
    const tree = dictTypeTree.find(item => item.dictValue === dictValue);
    if (!tree)
      return '无此字典';
    const dict = tree.children?.find(item => item.dictValue === value);
    return dict ? dict.dictLabel ?? '无此字典项' : '无此字典项';
  },
  dictTypeList(dictValue: string): DictItem[] {
    const dictTypeTree = tool.dictDataAll();
    if (!dictTypeTree)
      return [];
    const tree = dictTypeTree.find(item => item.dictValue === dictValue);
    return tree && tree.children ? tree.children : [];
  },
  dictList(dictValue: string): { value: string; label: string }[] {
    const dictTypeTree = tool.dictDataAll();
    if (!dictTypeTree)
      return [];
    const tree = dictTypeTree.find(item => item.dictValue === dictValue);
    if (!tree || !tree.children)
      return [];
    return tree.children.map(item => ({
      value: item.dictValue,
      label: item.name ?? ''
    }));
  },
  translateTree(parentValue: string, value: string): string {
    const dictTypeTree = tool.dictDataAll();
    const tree = dictTypeTree?.find(item => item.dictValue === parentValue);
    if (!tree)
      return '';
    const targetNode = findNodeByValue(tree, value);
    return targetNode ? targetNode.dictLabel ?? '' : '';
  },
  luckUuid(): string {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return `xn${uuid.slice(2)}`;
  }
};

function findNodeByValue(node: DictItem, value: string): DictItem | null {
  if (node.dictValue === value)
    return node;
  for (const child of node.children ?? []) {
    const result = findNodeByValue(child, value);
    if (result)
      return result;
  }
  return null;
}

function isValidJSON(data: string): boolean {
  try {
    JSON.parse(data);
    return true;
  }
  catch (err) {
    return false;
  }
}

export default tool;
