# ─── Stage 1: Builder ───────────────────────────────────────────────────────
FROM node:20-slim AS builder

# Install pnpm
RUN npm install -g pnpm@9.15.9

WORKDIR /app

# Copy workspace manifests first (better layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/api/package.json ./apps/api/

# Install all dependencies (including devDeps needed to build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Build the API
RUN pnpm --filter @ralph/api build

# ─── Stage 2: Runner ────────────────────────────────────────────────────────
FROM node:20-slim AS runner

# Install system deps required by Playwright Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@9.15.9

WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/api/package.json ./apps/api/

# Install production deps only
RUN pnpm install --frozen-lockfile --prod

# Install Playwright Chromium browser
RUN npx playwright install chromium

# Copy built output from builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
