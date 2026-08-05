'use client'

import { useTransition } from 'react'
import { alternarPublicacao } from '@/app/admin/(protegido)/imoveis/acoes'

/**
 * Publica ou tira do ar sem sair da lista.
 *
 * É a ação mais repetida depois do cadastro: imóvel vendido precisa sumir do site no
 * mesmo minuto, senão o Hélio recebe mensagem sobre o que não existe mais.
 */
export function BotaoPublicar({
  imovelId,
  publicado,
}: {
  imovelId: string
  publicado: boolean
}) {
  const [pendente, iniciar] = useTransition()

  return (
    <button
      type="button"
      disabled={pendente}
      onClick={() => iniciar(() => alternarPublicacao(imovelId, !publicado))}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold disabled:opacity-60 ${
        publicado
          ? 'border border-stone-300 text-stone-700 hover:bg-stone-50'
          : 'bg-marca-700 text-white hover:bg-marca-800'
      }`}
    >
      {pendente ? '...' : publicado ? 'Tirar do ar' : 'Publicar'}
    </button>
  )
}
