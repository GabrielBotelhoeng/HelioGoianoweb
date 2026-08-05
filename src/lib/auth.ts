import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

/**
 * Autenticação do admin — usuário único (o Hélio).
 *
 * DESVIO DELIBERADO DO PROJETO.md (seção 2, "Auth: NextAuth"):
 * o NextAuth v5 ainda está em beta e o que ele resolve bem — múltiplos provedores
 * OAuth, adapters de banco, vinculação de contas — não existe aqui. Para um login de
 * credenciais com um usuário só, ele adicionaria uma dependência beta no caminho
 * crítico do produto em troca de nada. Sessão assinada em cookie httpOnly resolve o
 * mesmo problema com dois pacotes maduros (`jose` e `bcryptjs`) e ~100 linhas
 * auditáveis. Se algum dia entrar login social ou um segundo corretor, a troca é
 * localizada neste arquivo.
 */

const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 24 * 30 // 30 dias
const NOME_COOKIE = 'hg_sessao'

function segredo(): Uint8Array {
  const valor = process.env.AUTH_SECRET

  if (!valor || valor.length < 32) {
    // Falhar alto: um segredo fraco ou ausente significa sessão forjável — qualquer
    // pessoa poderia assinar um cookie e publicar imóvel no site do Hélio.
    throw new Error(
      'AUTH_SECRET ausente ou curto demais (mínimo 32 caracteres). ' +
        'Gere com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"',
    )
  }

  return new TextEncoder().encode(valor)
}

export type Sessao = {
  usuarioId: string
  nome: string
  email: string
}

export async function criarSessao(sessao: Sessao): Promise<void> {
  const token = await new SignJWT({ ...sessao })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SESSAO_SEGUNDOS}s`)
    .sign(segredo())

  const armazem = await cookies()
  armazem.set(NOME_COOKIE, token, {
    httpOnly: true, // fora do alcance de JavaScript, mesmo com XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // 'lax' permite voltar de um link externo continuando logado
    path: '/',
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  })
}

export async function encerrarSessao(): Promise<void> {
  const armazem = await cookies()
  armazem.delete(NOME_COOKIE)
}

/** Lê e valida a sessão. Devolve null quando não há sessão válida. */
export async function lerSessao(): Promise<Sessao | null> {
  const armazem = await cookies()
  const token = armazem.get(NOME_COOKIE)?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, segredo(), { algorithms: ['HS256'] })

    if (
      typeof payload.usuarioId !== 'string' ||
      typeof payload.nome !== 'string' ||
      typeof payload.email !== 'string'
    ) {
      return null
    }

    return { usuarioId: payload.usuarioId, nome: payload.nome, email: payload.email }
  } catch {
    // Assinatura inválida ou token expirado: trata como deslogado, sem vazar detalhe.
    return null
  }
}

/**
 * Confere e-mail e senha contra o banco.
 *
 * Compara o hash mesmo quando o usuário não existe, para que o tempo de resposta não
 * revele quais e-mails estão cadastrados.
 */
export async function autenticar(email: string, senha: string): Promise<Sessao | null> {
  const usuario = await prisma.usuario.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  const hashComparacao =
    usuario?.senhaHash ?? '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv'

  const confere = await bcrypt.compare(senha, hashComparacao)

  if (!usuario || !confere) return null

  return { usuarioId: usuario.id, nome: usuario.nome, email: usuario.email }
}

/** Custo 12: caro o bastante para forçar ataque lento, rápido o bastante no login. */
export function gerarHashDeSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12)
}
