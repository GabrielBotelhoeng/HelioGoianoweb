'use client'

import { LazyMotion, domAnimation, m } from 'motion/react'

/**
 * Envelope de entrada ao rolar.
 *
 * Aceita Server Components como `children` — só o envelope vira cliente, o conteúdo
 * (que consulta o banco) continua no servidor. É o padrão que evita transformar a
 * página inteira em client component só para animar.
 *
 * `once: true` de propósito: animação que repete a cada rolagem cansa e atrapalha
 * quem sobe e desce a página comparando dois imóveis.
 *
 * Preferência de movimento reduzido: tratada pelo `MotionConfig` global. Aqui a árvore
 * é sempre a mesma, para o HTML do servidor bater com o do cliente.
 */
export function EntraAoRolar({
  children,
  atraso = 0,
  className = '',
}: {
  children: React.ReactNode
  atraso?: number
  className?: string
}) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: atraso, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}

/**
 * Versão em cascata: os filhos entram em sequência.
 * `staggerChildren` no pai evita repetir `transition` em cada item.
 */
export function CascataAoRolar({
  children,
  className = '',
  intervalo = 0.08,
}: {
  children: React.ReactNode
  className?: string
  intervalo?: number
}) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        initial="oculto"
        whileInView="visivel"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ visivel: { transition: { staggerChildren: intervalo } } }}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}

/** Item da cascata. Precisa estar dentro de `CascataAoRolar`. */
export function ItemCascata({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <m.div
      className={className}
      variants={{
        oculto: { opacity: 0, y: 24 },
        visivel: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </m.div>
  )
}
