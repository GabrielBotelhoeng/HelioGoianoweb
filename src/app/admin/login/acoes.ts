'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { autenticar, criarSessao, encerrarSessao } from '@/lib/auth'

const credenciaisSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

export type EstadoLogin = { erro?: string }

export async function entrar(_anterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const analise = credenciaisSchema.safeParse({
    email: formData.get('email') ?? '',
    senha: formData.get('senha') ?? '',
  })

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? 'Confira os dados informados.' }
  }

  const sessao = await autenticar(analise.data.email, analise.data.senha)

  if (!sessao) {
    // Mensagem única para e-mail inexistente e senha errada: dizer qual dos dois
    // falhou entrega a quem tenta invadir a lista de e-mails válidos.
    return { erro: 'E-mail ou senha incorretos.' }
  }

  await criarSessao(sessao)
  redirect('/admin')
}

export async function sair(): Promise<void> {
  await encerrarSessao()
  redirect('/admin/login')
}
