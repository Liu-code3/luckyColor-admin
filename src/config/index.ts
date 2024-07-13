const DEFAULT_CONFIG = {
  // 首页地址
  DASHBOARD_URL: '/index',

  // 接口地址
  API_URL: import.meta.env.VITE_API_BASEURL,

  // 请求超时
  TIMEOUT: 60000,

  // TokenName // Authorization
  TOKEN_NAME: 'token',

  // Token前缀，注意最后有个空格，如不需要需设置空字符串 // Bearer
  TOKEN_PREFIX: '',

  // 追加其他头
  HEADERS: {},

  // 请求是否开启缓存
  REQUEST_CACHE: true,

  // 布局
  LUCK_LAYOUT: 'normal',

  // 菜单是否折叠
  LUCK_MENU_COLLAPSE: false,

  // 模块坞
  LUCK_MODULE_UNFOLD_OPEN: true,

  // 是否开启多标签
  LUCK_LAYOUT_TAGS_OPEN: true,

  // 是否开启展示面包屑
  LUCK_BREADCRUMD_OPEN: false,

  // 顶栏是否应用主题色
  LUCK_TOP_HEADER_THEME_COLOR_OPEN: true,

  // 顶栏主题色通栏
  LUCK_TOP_HEADER_THEME_COLOR_SPREAD: true,

  // 侧边菜单是否排他展开
  LUCK_SIDE_UNIQUE_OPEN: true,

  // 语言
  LANG: 'zh-cn',

  // 主题颜色
  COLOR: '#1890FF',

  // 默认整体主题
  LUCK_THEME: 'light',

  // 整体表单风格
  LUCK_FORM_STYLE: 'drawer',

  // 成功色
  success: '#52c41a',

  // 警告色
  warning: '#faad14',

  // 错误色
  error: '#f5222f',

  // 系统基础配置，这些是数据库中保存起来的
  SYS_BASE_CONFIG: {
    // 默认logo
    LUCK_SYS_LOGO: '/img/logo.png',
    // 后端接口地址
    LUCK_SYS_API_URL: import.meta.env.VITE_API_BASEURL,
    // 系统名称
    LUCK_SYS_NAME: 'LuckyColor-admin',
    // 版本
    LUCK_SYS_VERSION: '2.0',
    // 版权
    LUCK_SYS_COPYRIGHT: 'LUCK ©2022 Created by xiaonuo.vip',
    // 版权跳转URL
    LUCK_SYS_COPYRIGHT_URL: 'https://www.xiaonuo.vip',
    // 默认文件存储
    LUCK_SYS_DEFAULT_FILE_ENGINE: 'LOCAL',
    // 是否开启验证码
    LUCK_SYS_DEFAULT_CAPTCHA_OPEN: 'false',
    // 默认重置密码
    LUCK_SYS_DEFAULT_PASSWORD: '123456'
  }
};

export const naiveThemeOverrides = {
  common: {
    primaryColor: '#316C72FF',
    primaryColorHover: '#316C72E3',
    primaryColorPressed: '#2B4C59FF',
    primaryColorSuppl: '#316C72E3'
  }
};

export default DEFAULT_CONFIG;
