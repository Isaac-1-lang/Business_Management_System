# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build TypeScript project
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source files AND tsconfig.json explicitly
COPY src ./src
COPY package.json ./package.json

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nodejs

# Copy build outputs and necessary files
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 5000

CMD ["npm", "start"]
