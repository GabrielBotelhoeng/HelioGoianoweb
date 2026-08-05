import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../src/generated/prisma/client'

/**
 * Cria (ou atualiza a senha de) o usuário do admin.
 *
 *   npm run admin:criar -- helio@exemplo.com "SenhaForte123" "Hélio Goiano"
 *
 * Existe como script e não como tela de cadastro de propósito: o site tem um usuário
 * só. Uma rota pública de "criar conta" seria uma porta aberta para qualquer pessoa
 * publicar imóvel no site do Hélio.
 */

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function main() {
  const [email, senha, nome] = process.argv.slice(2)

  if (!email || !senha) {
    console.error('Uso: npm run admin:criar -- <email> <senha> [nome]')
    process.exit(1)
  }

  if (senha.length < 8) {
    console.error('Senha muito curta: use pelo menos 8 caracteres.')
    process.exit(1)
  }

  const senhaHash = await bcrypt.hash(senha, 12)
  const emailNormalizado = email.toLowerCase().trim()

  const usuario = await prisma.usuario.upsert({
    where: { email: emailNormalizado },
    update: { senhaHash, ...(nome && { nome }) },
    create: { email: emailNormalizado, senhaHash, nome: nome ?? 'Administrador' },
    select: { id: true, email: true, nome: true },
  })

  console.log(`Usuário pronto: ${usuario.nome} <${usuario.email}>`)
  console.log('Acesse /admin/login para entrar.')
}

main()
  .catch((erro) => {
    console.error('Falhou:', erro)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
