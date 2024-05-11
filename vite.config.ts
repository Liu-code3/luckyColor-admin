import { defineConfig, loadEnv, ConfigEnv, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

const r = (...args: string[]) => resolve(__dirname, '.', ...args)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, './')
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
      }),
    ],
    server: {
      port: parseInt(env.VITE_PORT),
      proxy: {
        '/api': {
          target: env.VITE_API_BASEURL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias,
    },
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: true,
      __VUE_I18N_PROD_DEVTOOLS__: true,
    },
  }
})
