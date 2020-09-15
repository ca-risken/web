FROM node:lts-alpine as builder
WORKDIR /app
COPY package*.json yarn.lock *.config.js ./
RUN yarn install
COPY src ./src
COPY public ./public
RUN yarn run build

FROM nginx:stable-alpine as production-stage
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
