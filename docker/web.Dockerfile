FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages packages
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --filter @campusqr/web... --frozen-lockfile=false

FROM deps AS builder
COPY apps/web apps/web
RUN pnpm --filter @campusqr/web build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static apps/web/.next/static
COPY --from=builder /app/apps/web/public apps/web/public
EXPOSE 3001
CMD ["node", "apps/web/server.js"]
