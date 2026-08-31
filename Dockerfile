# Multi-stage Dockerfile for NGO Connect
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server & client manifests
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY package*.json ./

# Install dependencies
RUN cd server && npm install
RUN cd client && npm install

# Copy source code
COPY server/ ./server/
COPY client/ ./client/

# Build React client
RUN cd client && npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/package*.json ./

EXPOSE 5000

CMD ["node", "server/server.js"]
