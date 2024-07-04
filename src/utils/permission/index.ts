import tool from '@/utils/tool';

interface UserInfo {
  buttonCodeList: string[];
}

/**
 * 权限判断是否能看到这个按钮，同时后端也做了校验，前端只是显示与不显示
 * @param {Array|string} data  data 按钮的权限点，可以是单个字符串，也可以是数组
 * @param {string} rlue 'or' 代表或，and代表与
 * 使用方法：
 * 例如 buttonCodeList 的数据为： ['button1', 'button2', 'button3']
 * 想要判断 button1 的权限，可以写成：hasPerm('button1')
 * 想要判断 button1 或 button2 的权限，可以写成：hasPerm(['button1', 'button2' ])
 * 想要判断 button1 与 button2 的权限，可以写成：hasPerm(['button1', 'button2' ], 'and')
 */
export function hasPerm(data: Array<string> | string, rlue = 'or') {
  if (!data) return false;

  const userInfo = tool.data.get('USER_INFO') as UserInfo | null;

  if (!userInfo) return false;

  const { buttonCodeList } = userInfo;

  if (!buttonCodeList) return false;

  if (Array.isArray(data)) {
    const fn = rlue === 'or' ? 'some' : 'every';
    return data[fn](item => buttonCodeList.includes(item));
  }
  return buttonCodeList.includes(data);
}
