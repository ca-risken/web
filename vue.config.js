module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'RISKEN',
    }
  },
  transpileDependencies: [
    "vuetify"
  ],
  devServer: {
    proxy: {
        "/api/v1": {
            target: "http://localhost:8000",
            onProxyReq: (proxyReq)  => {
              proxyReq.setHeader("x-amzn-oidc-identity", "alice");
            }
        },
    },
  },
}
