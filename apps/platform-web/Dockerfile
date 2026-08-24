FROM node:20-alpine AS build
WORKDIR /workspace
ENV HUSKY=0
COPY package.json package-lock.json ./
COPY apps/platform-web/package.json apps/platform-web/package.json
COPY apps/jengabora-web/package.json apps/jengabora-web/package.json
COPY packages packages
RUN npm ci --workspace @propflow/platform-web
COPY apps/platform-web apps/platform-web
RUN npm run build --workspace @propflow/platform-web

FROM nginx:1.27-alpine
COPY --from=build /workspace/apps/platform-web/dist /usr/share/nginx/html
COPY apps/platform-web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
