'use client'

import { useActionState } from 'react'
import { entrar, type EstadoLogin } from '@/app/admin/login/acoes'

export function FormularioLogin() {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrar, {})

  return (
    <form action={acao} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500 uppercase">
          E-mail
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          autoCapitalize="none"
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold tracking-wide text-stone-500 uppercase">
          Senha
        </span>
        <input
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base"
        />
      </label>

      {estado.erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-full bg-marca-700 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-marca-800 disabled:opacity-60"
      >
        {enviando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
