FROM node:lts-alpine as builder
WORKDIR /app
COPY ./ ./
RUN yarn config set ignore-engines true
RUN yarn install
RUN NODE_OPTIONS=--openssl-legacy-provider yarn run build-prd

FROM nginx:stable-alpine as production-stage
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
