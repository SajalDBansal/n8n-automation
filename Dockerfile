# syntax=docker/dockerfile:1
FROM oven/bun:1.3.12-alpine AS base

# ---- Prune the monorepo down to just what apps/web needs ----
FROM base AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune web --docker

# ---- Install deps against the pruned lockfile, then build ----
FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG NEXT_PUBLIC_APP_URL
ENV DATABASE_URL=$DATABASE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN bunx turbo run build --filter=web

# ---- Minimal runtime image ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

CMD ["bun", "apps/web/server.js"]
