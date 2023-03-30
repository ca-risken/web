module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'RISKEN',
    },
  },
  transpileDependencies: ['vuetify'],
  devServer: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        logLevel: 'debug',
        onProxyReq: (proxyReq) => {
          proxyReq.setHeader('x-amzn-oidc-identity', 'alice')
          proxyReq.setHeader(
            'X-Amzn-Oidc-Data',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGljZSIsInVzZXJuYW1lIjoiYWxpY2UiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhbGljZSJ9Cg==.iTH5EiE4epl0p7bw-8-x2kpURFZsYibqPQCtrOx52OY'
          )
        },
      },
    },
  },
}
