/**
 * Entrada de blocos ao rolar — CSS scroll-driven, sem JavaScript.
 *
 * SERVER COMPONENTS: nenhum 'use client', nenhum KB no bundle. O navegador liga a
 * animação à posição do elemento na viewport via `animation-timeline: view()`.
 *
 * POR QUE SAIU DO MOTION: com `whileInView`, o conteúdo nasce com `opacity: 0`
 * aplicado por JavaScript. Se o script falhar, demorar, ou a aba estiver em segundo
 * plano, o bloco fica invisível — e aqui dentro moram preço, entrada e parcela.
 * O CSS está sob `@supports`, então onde o recurso não existe o conteúdo aparece
 * normalmente, sem estado intermediário.
 *
 * A API é a mesma de antes; as páginas não precisaram mudar.
 */

export function EntraAoRolar({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`revelar ${className}`}>{children}</div>
}

/**
 * Cascata: os filhos diretos entram em sequência.
 * O escalonamento vem de `--indice` em cada item (ver `ItemCascata`).
 */
export function CascataAoRolar({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`cascata ${className}`}>{children}</div>
}

/**
 * Item da cascata. `indice` controla o atraso; sem ele, todos entram juntos.
 * Precisa ser filho direto de `CascataAoRolar` para o seletor `.cascata > *` pegar.
 */
export function ItemCascata({
  children,
  className = '',
  indice = 0,
}: {
  children: React.ReactNode
  className?: string
  indice?: number
}) {
  return (
    <div className={className} style={{ '--indice': indice } as React.CSSProperties}>
      {children}
    </div>
  )
}
