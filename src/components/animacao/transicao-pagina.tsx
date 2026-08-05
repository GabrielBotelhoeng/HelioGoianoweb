'use client'

import { ViewTransition } from 'react'

/**
 * Transição direcional entre páginas.
 *
 * `nav-forward` quando se entra em algo mais específico (listagem → imóvel) e
 * `nav-back` na volta. A direção comunica profundidade: só vale para navegação
 * hierárquica, nunca entre abas irmãs — ali o deslize mentiria sobre a estrutura.
 *
 * `default="none"` é obrigatório aqui: sem ele, TODA transição do React (revalidação,
 * Suspense resolvendo) dispararia o cross-fade do navegador por cima.
 *
 * Fica em componente de página, nunca no layout: transição declarada no layout não
 * dispara enter/exit, porque o layout persiste entre navegações.
 */
export function TransicaoPagina({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
      exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
      default="none"
    >
      {children}
    </ViewTransition>
  )
}
