FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
COPY prisma ./prisma/
RUN npx prisma generate

RUN pnpm build

EXPOSE 4000

ENV NODE_ENV=production

CMD ["pnpm", "start"]