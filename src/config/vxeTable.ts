import {
  VxeButton,

  VxeIcon,
  VxeUI
} from 'vxe-pc-ui';

import {
  VxeTable,
  VxeToolbar
} from 'vxe-table';

// 导入主题变量，也可以重写主题变量
import 'vxe-table/styles/cssvar.scss';
import 'vxe-pc-ui/styles/cssvar.scss';

// 导入默认的语言
import zhCN from 'vxe-pc-ui/lib/language/zh-CN';

VxeUI.setI18n('zh-CN', zhCN);
VxeUI.setLanguage('zh-CN');

// 注册组件
// 如果页面中已经被显性导入了，则可以不用调用注册
// 如果是配置式的，没有在页面中显性导入，则需要逐个注册
VxeUI.component(VxeButton);
VxeUI.component(VxeIcon);

VxeUI.component(VxeTable);
VxeUI.component(VxeToolbar);
