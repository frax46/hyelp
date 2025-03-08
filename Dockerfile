FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy all project files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Completely disable all ESLint and TypeScript checks during build
ENV NEXT_DISABLE_ESLINT=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_SKIP_TS_CHECK=1

# Add explicit build flags to disable checks
RUN npm run build -- --no-lint --no-typescript

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED=1

# Add a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Use the non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Set host and port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Command to run the application
CMD ["node", "server.js"]