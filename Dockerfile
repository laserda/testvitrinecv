# syntax=docker/dockerfile:1
# Build statique (Vite) puis service par nginx (utilisateur non root, port 8080).
# Static build (Vite) then served by unprivileged nginx on port 8080.

FROM node:24.22.3-bookworm-slim AS build
WORKDIR /app
ENV CI=true
COPY package.json package-lock.json .npmrc ./
# --ignore-scripts : pas de hook Git (husky) dans l'image.
RUN npm ci --ignore-scripts
COPY . .
# Variables publiques de build (jamais de secret : elles finissent dans le navigateur).
ARG VITE_SITE_NAME="Cv en Ligne"
ARG VITE_DEFAULT_LOCALE=fr
ENV VITE_SITE_NAME=${VITE_SITE_NAME} \
    VITE_DEFAULT_LOCALE=${VITE_DEFAULT_LOCALE}
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29.8-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
