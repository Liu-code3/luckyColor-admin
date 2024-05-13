// vite.config.ts
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'

export const r = (...args: string[]) => resolve(__dirname, '.', ...args)

export default defineConfig(({ mode }) => {
  const envConfig = loadEnv(mode, './')
  const alias = {
    '~': `${resolve(__dirname, './')}`,
    '@/': `${resolve(__dirname, 'src')}/`,
  }
  // 环境变量在被加载后总是被当作字符串处理。这是因为环境变量本质上是通过操作系统或 Node.js 的环境接口来存储和管理，而这些接口只支持字符串类型。
  // 所有这里需要手动转换为number类型
  const port = Number(envConfig.VITE_PORT) || 3000 // 如果转换失败，使用默认端口 3000

  return {
    plugins: [
      vue(),
      UnoCSS(),
      AutoImport({
        // targets to transform
        include: [
          /\.[tj]sx?$/,
          /\.vue$/,
          /\.vue\?vue/,
          /\.md$/,
        ],
        imports: [
          'vue',
          'pinia',
          {
            'vue-router': [
              'useRouter',
              'useRoute',
            ],
          },
          {
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar',
            ],
          },
        ],
        dts: './auto-imports.d.ts',
      }),
      Components({
        resolvers: [NaiveUiResolver()],
        dirs: [r('src/components')],
        dts: false,
      }),
    ],
    server: {
      port,
      proxy: {
        // 代理
        '/api': {
          target: envConfig.VITE_API_BASEURL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias,
    },
    // 解决警告You are running the esm-bundler build of vue-i18n.
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: true,
      __VUE_I18N_PROD_DEVTOOLS__: true,
    },

  }
})
