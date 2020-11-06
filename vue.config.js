module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    proxy: {
        "/api/v1": {
            target: "http://localhost:8000",
            onProxyReq: (proxyReq)  => {
              proxyReq.setHeader("x-amzn-oidc-identity", "bob");
              // proxyReq.setHeader("x-amzn-oidc-identity", "alice-x");
              // proxyReq.setHeader("X-Amzn-Oidc-Data", "dummy_header.eyJzdWIiOiJhbGljZS14IiwidXNlcm5hbWUiOiJQRVJNQU5fYWxpY2UteCJ9.dummy_signature");
            }
        },
    },
  },
}
