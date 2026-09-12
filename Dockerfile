# Stage 1: Build the frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies for native compilation if needed
RUN apk add --no-cache python3 build-base

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install build tools, compile native better-sqlite3, then clean up build tools
RUN apk add --no-cache python3 build-base libstdc++

COPY package*.json ./
RUN npm ci --omit=dev \
    && apk del python3 build-base \
    && rm -rf /root/.npm /root/.cache

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server ./server

# Ensure data directory exists for database persistence
RUN mkdir -p data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "server/server.js"]
