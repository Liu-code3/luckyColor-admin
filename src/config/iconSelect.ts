/**
 * 图标选择器基础数据
 * 推荐前往https://iconify.design/docs/icon-components/vue/ 下载图标的Vue文件，然后放在src/assets/icons文件夹里面
 * 这个网址有118个图标集，包括antd、font awesome、bootstrap、eleme等累计140456个图标
 */
const uiwIconComponentMap = import.meta.glob('../assets/icons/uiw/*.vue'); // 异步方式

const uiwIcons = Object.keys(uiwIconComponentMap).map(key => key.slice(key.lastIndexOf('/') + 1, key.lastIndexOf('.')));

export default {
  icons: [
    // iconify图标
    {
      name: '基础',
      key: 'default',
      iconItem: [
        {
          name: '线框风格',
          key: 'default',
          item: [
            'prime:bullseye',
            'prime:address-book',
            'prime:desktop',
            'material-symbols:10k-outline-rounded'
          ]
        }
      ]
    },
    // 需要单独引入的图标
    {
      name: '扩展',
      key: 'extend',
      iconItem: [
        {
          name: '常用',
          key: 'default',
          item: uiwIcons
        },
        {
          name: '其他',
          key: 'other',
          item: ['UiwGithub']
        }
      ]
    }
  ]
};
