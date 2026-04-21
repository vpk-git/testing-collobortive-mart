# ── Stage 1: Build ────────────────────────────────────────────────────────────
# Uses Node to run npm install + npm run build
# The VITE_API_BASE_URL is passed in at build time via --build-arg
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (Docker cache layer — only re-runs if deps change)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# VITE_API_BASE_URL is injected at build time
# docker-compose passes it from the .env file
ARG VITE_API_BASE_URL=http://localhost
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build
# dist/ folder is now at /app/dist

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
# Copies only the built files into a lightweight Nginx image
# The Node.js layer is discarded — final image is ~25MB
FROM nginx:alpine

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s \
    CMD wget -q -O /dev/null http://localhost/ || exit 1