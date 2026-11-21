# ##############################################################################
# Pollipop — Unified Production Dockerfile (Multi-Stage)
# ##############################################################################
# WHAT THIS FILE DOES
#   Builds ONE container image containing the Express API AND the built React SPA
#   and serves both on port 3000 as a non-root user (node).
#   Google Cloud Run and CI/CD pipelines build and run exactly this image.
#
# STAGES:
#   Stage 1: client-builder -> Builds React SPA (Vite) into client/dist
#   Stage 2: server-builder -> Compiles TypeScript server and generates Prisma client
#   Stage 3: production     -> Minimal runtime image; copies build artifacts and runs as node
# ##############################################################################

# ==============================================================================
# Stage 1: Build Frontend (React + TypeScript + Vite)
# ==============================================================================
FROM node:24-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
# Empty VITE_API_URL ensures the SPA communicates with /api on the same host/port
ENV VITE_API_URL=""
RUN npm run build

# ==============================================================================
# Stage 2: Build Backend (Express + TypeScript + Prisma)
# ==============================================================================
FROM node:24-alpine AS server-builder
WORKDIR /app/server
RUN apk add --no-cache openssl

COPY server/package*.json ./
RUN npm ci

COPY server/ ./
RUN npx prisma generate && npm run build

# ==============================================================================
# Stage 3: Unified Production Runtime (Express API + Static SPA on Port 3000)
# ==============================================================================
FROM node:24-alpine AS production
WORKDIR /app/server
RUN apk add --no-cache openssl

# Copy server runtime dependencies and compiled build
COPY --from=server-builder /app/server/package*.json ./
COPY --from=server-builder /app/server/node_modules ./node_modules
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/src ./src
COPY --from=server-builder /app/server/prisma ./prisma
COPY --from=server-builder /app/server/docker-entrypoint.sh ./docker-entrypoint.sh

# Copy built React frontend to be statically served by Express
COPY --from=client-builder /app/client/dist /app/client/dist

RUN chmod +x ./docker-entrypoint.sh

# Runtime environment settings
ENV NODE_ENV=production
ENV TZ=Asia/Bangkok
ENV PORT=3000
EXPOSE 3000

# Least-privilege: run as non-root user
USER node

# Start command
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
