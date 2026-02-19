FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Use Debian-based image for install/build so Rollup's native optional (linux-x64-gnu) is available
FROM node:22-bookworm-slim AS base-build
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base-build AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

FROM base-build AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @saloonly/server exec prisma generate
RUN pnpm --filter @saloonly/server run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/server/build ./build
COPY --from=builder /app/server/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/prisma ./prisma
EXPOSE 8080
CMD ["node", "build/server.js"]
