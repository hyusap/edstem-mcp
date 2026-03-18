FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build

WORKDIR /app

COPY tsconfig.json ./
COPY src ./src

RUN bun run build

FROM oven/bun:1 AS runtime

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --from=build /app/dist ./dist

ENV MCP_TRANSPORT=http
ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

CMD ["bun", "dist/index.js"]
