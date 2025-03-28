# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_ADMIN_EMAILS
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_ADMIN_EMAILS=$NEXT_PUBLIC_ADMIN_EMAILS
# Add a dummy DATABASE_URL for build time only
ENV DATABASE_URL="mongodb://dummy:dummy@localhost:27017/dummy"
COPY package*.json ./
# Install dependencies with platform-specific binaries for tailwindcss
RUN npm install
# Install the specific tailwindcss binary for alpine linux
RUN npm install --platform=linux --arch=x64 @tailwindcss/oxide-linux-x64-musl
COPY . .
RUN npx prisma generate
# Skip actual database connections during build by setting NODE_ENV
ENV NODE_ENV="production"
RUN npm run build
# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
# Install production dependencies
RUN npm install --only=production
# Install the specific tailwindcss binary for alpine linux in production
RUN npm install --platform=linux --arch=x64 @tailwindcss/oxide-linux-x64-musl
RUN npx prisma generate
EXPOSE 3000
# The real DATABASE_URL will be provided at runtime via environment variables
CMD ["npm", "start"]
