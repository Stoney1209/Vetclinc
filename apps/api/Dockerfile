FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy monorepo root package files
COPY package.json pnpm-lock.yaml ./

# Copy the api app
COPY apps/api/ ./apps/api/

# Copy Prisma schema from monorepo root
COPY prisma/ ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @vetclinic/api...

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the API
WORKDIR /app/apps/api
RUN pnpm build

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "dist/main"]