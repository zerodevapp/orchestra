FROM oven/bun AS builder

WORKDIR /usr/src/app

COPY package*.json bun.lock* ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun

WORKDIR /usr/src/app

COPY package*.json bun.lock* ./
RUN bun install --production
COPY --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV production

CMD [ "node", "dist/index.js" ]
