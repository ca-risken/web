FROM node:22-alpine as builder
WORKDIR /app
RUN npm install --global pnpm@10.34.9
COPY ./ ./
RUN pnpm install --frozen-lockfile
RUN NODE_OPTIONS=--openssl-legacy-provider pnpm run build-prd

FROM nginx:stable-alpine as production-stage
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
