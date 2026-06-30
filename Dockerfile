FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL is injected at build time via GitHub Actions secret
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# VITE_ADMIN_SECRET must NOT be baked into the image
# It is entered manually by the admin at login time
RUN npm run build

# ---- Production image ----
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1
