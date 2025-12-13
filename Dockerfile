# syntax=docker/dockerfile:1.4
# ============================================
# Social Service - Dockerfile
# OPTIMIZED: BuildKit cache mounts
# ============================================

# Stage 1: Build Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

# Copy source code
COPY . .

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS production

# Set environment
ENV NODE_ENV=production \
    PORT=3002

WORKDIR /app

# Install only production system deps
RUN apk add --no-cache postgresql-client

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --omit=dev

# Copy source from builder
COPY --from=builder --chown=nodejs:nodejs /app/src ./src/

# Copy uploads directory if it exists
RUN mkdir -p ./uploads

# Copy entrypoint script
COPY --chown=nodejs:nodejs scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Create uploads directory with correct permissions
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Switch to non-root user
USER nodejs

# Expose the service port
EXPOSE 3002

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "src/app.js"]
