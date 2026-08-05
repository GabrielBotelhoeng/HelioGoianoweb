import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Prisma 7 tirou a connection string de dentro do schema.prisma.
// Ela mora aqui, e o `env()` lê do .env carregado pelo dotenv acima.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})
