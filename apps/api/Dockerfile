FROM oven/bun:1.3-alpine

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json bun.lock ./
COPY packages/shared/package.json packages/shared/

# Copy API package files
COPY apps/api/package.json apps/api/

# Install dependencies
RUN bun install --production --frozen-lockfile

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]
