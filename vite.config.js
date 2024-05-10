// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
export const r = (...args) => resolve(__dirname, '.', ...args)

export default defineConfig(({ command, mode }) => {
  const envConfig = loadEnv(mode, './')
  const alias = {
    '~': `${resolve(__dirname, './')}`,
    '@/': `${resolve(__dirname, 'src')}/`,
  }

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: [
          'vue',
          {
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar',
            ],
          },
        ],
      }),
      Components({
        resolvers: [NaiveUiResolver()],
        dirs: [r('src/components')],
        dts: false,
        resolvers: []
      }),
      
    ],
    server: {
      port: envConfig.VITE_PORT,
      proxy: {
        // 代理
        '/api': {
          target: envConfig.VITE_API_BASEURL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
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
