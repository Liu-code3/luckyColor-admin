// vite.config.ts
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueJSX from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import UnoCSS from 'unocss/vite';
import { viteMockServe } from 'vite-plugin-mock';

// 以下icon图标的引入也需要使用 unplugin-vue-components/vite
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';

export const r = (...args: string[]) => resolve(__dirname, '.', ...args);

export default defineConfig(({ mode }) => {
  const envConfig = loadEnv(mode, './');
  const alias = {
    '~': `${resolve(__dirname, './')}`,
    '@/': `${resolve(__dirname, 'src')}/`
  };
  // 环境变量在被加载后总是被当作字符串处理。这是因为环境变量本质上是通过操作系统或 Node.js 的环境接口来存储和管理，而这些接口只支持字符串类型。
  // 所有这里需要手动转换为number类型
  const port = Number(envConfig.VITE_PORT) || 3000; // 如果转换失败，使用默认端口 3000

  return {
    plugins: [
      vue(),
      VueJSX(),
      UnoCSS(),
      AutoImport({
        // targets to transform
        include: [
          /\.[tj]sx?$/,
          /\.vue$/,
          /\.vue\?vue/,
          /\.md$/
        ],
        imports: [
          'vue',
          'pinia',
          {
            'vue-router': [
              'useRouter',
              'useRoute'
            ],
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar'
            ]
          }
        ],
        dts: r('src/auto-imports.d.ts')
      }),
      Components({
        resolvers: [
          NaiveUiResolver(),
          IconsResolver({
            // prefix: 'icon', // 自动引入的Icon组件统一前缀，默认为 i，设置 '' 为不需要前缀
            // {prefix}-{collection}-{icon} 使用组件解析器时，您必须遵循名称转换才能正确推断图标。
            // alias: { park: 'icon-park' } 集合的别名
            // enabledCollections: ['ep'] // 这是可选的，默认启用 Iconify 支持的所有集合['mdi']
          })
        ],
        dirs: [r('src/components')],
        dts: false
      }),
      viteMockServe({
        watchFiles: true, // 监视 mockPath文件夹内文件的修改
        enable: mode === 'development', // 开发环境下启用
        logger: true // 是否在控制台显示请求日志
      }),
      Icons({
        // scale: 1, // 缩放
        autoInstall: true,
        compiler: 'vue3' // 编译方式
        // defaultClass: '', // 默认类型
        // defaultStyle: '' // 默认样式
      })
    ],
    server: {
      port,
      proxy: {
        // 代理
        '/api': {
          target: envConfig.VITE_API_BASEURL,
          // 修改请求头中的host为目标地址的host
          changeOrigin: true,
          rewrite: path => path.replace(/\^api/, '')
        }
      }
    },
    resolve: {
      alias
    },
    // 解决警告You are running the esm-bundler build of vue-i18n.
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: true,
      __VUE_I18N_PROD_DEVTOOLS__: true
    }

  };
});
