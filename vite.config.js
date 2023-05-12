import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslint from 'vite-plugin-eslint'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
    plugins: [
      vue({
        template: {
          compilerOptions: {
            compatConfig: {
              MODE: 2
            }
          },
          transformAssetUrls
        }
      }),
        vuetify(),
        eslint()
    ],
    resolve: {
        vue: '@vue/compat',
        alias: {
          "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    },
    server: {
      port: 8080,
      proxy: {
        '/api/v1': {
          target: 'http://localhost:8000',
          configure: (proxy) => proxy.on('proxyReq', function (proxyReq, req, res) {
            proxyReq.setHeader('x-amzn-oidc-identity', 'alice')
            proxyReq.setHeader(
              'X-Amzn-Oidc-Data',
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGljZSIsInVzZXJuYW1lIjoiYWxpY2UiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhbGljZSJ9Cg==.iTH5EiE4epl0p7bw-8-x2kpURFZsYibqPQCtrOx52OY'
            )
          })
        },
      },
    },
  })
  