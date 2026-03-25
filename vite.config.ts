import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import VueJSX from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import UnoCSS from 'unocss/vite';
import { defineConfig, loadEnv } from 'vite';
import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import';

export const resolvePath = (...args: string[]) => resolve(__dirname, '.', ...args);

function readBoolean(value: string | undefined, fallback = false) {
  if (value === undefined)
    return fallback;

  return value.trim().toLowerCase() === 'true';
}

function readString(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized?.length ? normalized : fallback;
}

export default defineConfig(({ mode }) => {
  const envConfig = loadEnv(mode, './');
  const alias = {
    '~': `${resolvePath('./')}`,
    '@/': `${resolvePath('src')}/`
  };
  const port = Number(envConfig.VITE_PORT) || 3000;
  const shouldDropDebugger = readBoolean(envConfig.VITE_BUILD_DROP_DEBUGGER, false);
  const shouldDropConsoleLog = readBoolean(envConfig.VITE_BUILD_DROP_CONSOLE, false);
  const enableSourceMap = readBoolean(envConfig.VITE_BUILD_SOURCEMAP, false);
  const buildBase = readString(envConfig.VITE_BUILD_PUBLIC_PATH, '/');
  const buildOutDir = readString(envConfig.VITE_BUILD_OUT_DIR, 'dist');
  const shouldUseTerser = shouldDropDebugger || shouldDropConsoleLog;
  const pureFunctions = shouldDropConsoleLog ? ['console.log'] : undefined;

  return {
    base: buildBase,
    plugins: [
      vue(),
      VueJSX(),
      UnoCSS(),
      lazyImport({
        resolvers: [
          VxeResolver({
            libraryName: 'vxe-table'
          }),
          VxeResolver({
            libraryName: 'vxe-pc-ui'
          })
        ]
      }),
      AutoImport({
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
        dts: resolvePath('src/auto-imports.d.ts')
      }),
      Components({
        resolvers: [
          NaiveUiResolver(),
          IconsResolver()
        ],
        dirs: [resolvePath('src/components')],
        dts: false
      }),
      Icons({
        autoInstall: true,
        compiler: 'vue3'
      })
    ],
    server: {
      port,
      proxy: {
        '/api': {
          target: envConfig.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3001',
          changeOrigin: true
        }
      }
    },
    resolve: {
      alias
    },
    build: {
      minify: shouldUseTerser ? 'terser' : 'oxc',
      sourcemap: enableSourceMap,
      outDir: buildOutDir,
      terserOptions: shouldUseTerser
        ? {
            compress: {
              drop_debugger: shouldDropDebugger,
              pure_funcs: pureFunctions
            },
            format: {
              comments: false
            }
          }
        : undefined
    },
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: true,
      __VUE_I18N_PROD_DEVTOOLS__: true
    }
  };
});
