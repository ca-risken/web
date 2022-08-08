FROM node:lts-alpine as builder
WORKDIR /app
COPY ./ ./
RUN yarn install
RUN yarn run build-prd

FROM nginx:stable-alpine as production-stage
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
