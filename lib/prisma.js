import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// Only create client if DATABASE_URL exists
export const prisma = globalForPrisma.prisma ?? (process.env.DATABASE_URL ? createPrismaClient() : null)

if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma
}

export default prisma
