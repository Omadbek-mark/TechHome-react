FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json yarn.lock .yarnrc ./
RUN yarn install --frozen-lockfile --non-interactive
COPY index.html tsconfig.json tsconfig.node.json vite.config.mts ./
COPY src ./src
COPY public ./public
ARG VITE_API_URL
RUN node -e 'const url = new URL(process.env.VITE_API_URL); if (url.protocol !== "https:" || url.username || url.password || url.href !== url.origin + "/") throw new Error("VITE_API_URL must be a public HTTPS origin")' \
    && yarn build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=4s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
