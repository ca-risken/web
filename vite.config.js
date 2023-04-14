import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import eslint from 'vite-plugin-eslint'
import Components from 'unplugin-vue-components/vite'
import path from 'path'

export default defineConfig({
    plugins: [
        vue(),
        Components({
            resolvers: [VuetifyResolver()],
        }),
        eslint()
    ],
    resolve: {
        alias: {
          '@': path.resolve(__dirname, './src')
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
  