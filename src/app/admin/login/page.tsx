import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { lerSessao } from '@/lib/auth'
import { FormularioLogin } from '@/components/admin/formulario-login'

export const metadata: Metadata = {
  title: 'Entrar',
  // Página de login não tem por que aparecer na busca.
  robots: { index: false, follow: false },
}

export default async function PaginaLogin() {
  // Já logado não vê tela de login.
  if (await lerSessao()) redirect('/admin')

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-carvao-900">
        Painel do Hélio
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        Entre para cadastrar imóveis e acompanhar os contatos.
      </p>

      <FormularioLogin />
    </div>
  )
}
