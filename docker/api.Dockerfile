FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/config/package.json packages/config/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --filter @campusqr/api... --frozen-lockfile=false

FROM deps AS runner
COPY packages/config packages/config
COPY apps/api apps/api
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["pnpm", "start"]
