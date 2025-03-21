import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// For build time support - avoid connection errors when DATABASE_URL is invalid
const dummyPrismaClient = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
} as unknown as PrismaClient;

const prisma =
  globalForPrisma.prisma ||
  (() => {
    // During build time or if DATABASE_URL is invalid, return a dummy client
    if (
      process.env.NODE_ENV === 'production' && 
      process.env.DATABASE_URL?.includes('dummy:dummy')
    ) {
      console.log('Using dummy Prisma client for build');
      return dummyPrismaClient;
    }
    
    try {
      return new PrismaClient();
    } catch (e) {
      console.warn('Failed to initialize Prisma Client, using dummy client');
      return dummyPrismaClient;
    }
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// Handle termination signals to properly close database connections
if (process.env.NODE_ENV === 'production') {
  // Properly handle application shutdown to close DB connections
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, closing database connections...`);
      await prisma.$disconnect();
      console.log('Database connections closed, exiting process');
      process.exit(0);
    });
  });
} 