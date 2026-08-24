FROM node:20-alpine AS build
WORKDIR /workspace
ENV HUSKY=0
COPY package.json package-lock.json ./
COPY apps/platform-web/package.json apps/platform-web/package.json
COPY apps/jengabora-web/package.json apps/jengabora-web/package.json
COPY packages packages
RUN npm ci --workspace @propflow/jengabora-web
COPY apps/jengabora-web apps/jengabora-web
RUN npm run build --workspace @propflow/jengabora-web

FROM nginx:1.27-alpine
COPY --from=build /workspace/apps/jengabora-web/dist /usr/share/nginx/html
COPY apps/jengabora-web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
