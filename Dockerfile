FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Build the source code
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy all project files
COPY . .

# Set environment variables explicitly
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGVzaXJlZC1kcnVtLTQzLmNsZXJrLmFjY291bnRzLmRldiQ
ENV CLERK_SECRET_KEY=sk_test_NHNUous5KVFL0T6WJGcrKs3NhPeOvfLANqTgs7UnML
ENV NEXT_PUBLIC_ADMIN_EMAILS=annobilfrance@gmail.com,admin2@example.com
ENV DATABASE_URL=mongodb+srv://france:france@cluster0.ohrhflo.mongodb.net/hyelp?retryWrites=true&w=majority

# Generate Prisma client
RUN npx prisma generate

# Use development mode to avoid static generation errors
# This still produces a production build but avoids prerendering issues
RUN NODE_ENV=development npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user to run the app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env.production ./.env.production

# Set runtime environment variables
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGVzaXJlZC1kcnVtLTQzLmNsZXJrLmFjY291bnRzLmRldiQ
ENV CLERK_SECRET_KEY=sk_test_NHNUous5KVFL0T6WJGcrKs3NhPeOvfLANqTgs7UnML
ENV NEXT_PUBLIC_ADMIN_EMAILS=annobilfrance@gmail.com,admin2@example.com
ENV DATABASE_URL=mongodb+srv://france:france@cluster0.ohrhflo.mongodb.net/hyelp?retryWrites=true&w=majority

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Next.js application
CMD ["node", "server.js"]