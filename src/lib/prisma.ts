import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

// Prisma 7 exige um driver adapter explícito — não existe mais engine binária
// resolvendo a conexão sozinha.
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL não definida. Copie .env.example para .env e suba o banco com `docker compose up -d`.',
  )
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Singleton: em dev o hot reload do Next recria os módulos a cada alteração e
// abriria uma conexão nova por reload até estourar o pool do Postgres.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
