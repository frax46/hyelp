import { PrismaClient } from '@prisma/client';

// Define the options for Prisma Client
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pooling is handled automatically by Prisma
    // with MongoDB connection string parameters
  });
};

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create and export the prisma client
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

// For development environment, store the client on the global object
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

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