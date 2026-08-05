'use client'

import { LazyMotion, domAnimation, m } from 'motion/react'

/**
 * Manchete que sobe palavra por palavra por trás de uma máscara.
 *
 * É a sequência de entrada única do site — a direção pede um momento forte, não
 * micro-movimento espalhado. Por isso só existe no hero.
 *
 * `LazyMotion` + `m` carrega ~6 KB em vez dos ~34 KB do bundle completo do Motion.
 * O público acessa em 4G de cidade pequena; a diferença é real.
 *
 * A preferência de "reduzir movimento" é tratada globalmente pelo `MotionConfig`
 * (ver `provedor-motion.tsx`). NÃO bifurque a árvore aqui com `useReducedMotion`:
 * o servidor não conhece a preferência e o HTML sairia diferente do cliente.
 */
export function TextoRevelado({
  texto,
  destaque,
  className = '',
  classNameDestaque = '',
}: {
  texto: string
  /** Trecho final que recebe tratamento próprio (o dourado da manchete). */
  destaque?: string
  className?: string
  classNameDestaque?: string
}) {
  const palavras = texto.split(' ')
  const palavrasDestaque = destaque ? destaque.split(' ') : []
  const total = palavras.length + palavrasDestaque.length

  return (
    <LazyMotion features={domAnimation}>
      <span className={className}>
        {palavras.map((palavra, indice) => (
          <Palavra key={`base-${indice}`} indice={indice} total={total}>
            {palavra}
          </Palavra>
        ))}
        {palavrasDestaque.map((palavra, indice) => (
          <Palavra
            key={`destaque-${indice}`}
            indice={palavras.length + indice}
            total={total}
            className={classNameDestaque}
          >
            {palavra}
          </Palavra>
        ))}
      </span>
    </LazyMotion>
  )
}

function Palavra({
  children,
  indice,
  total,
  className = '',
}: {
  children: string
  indice: number
  total: number
  className?: string
}) {
  // A cascata inteira dura no máximo ~0.5s: manchete que demora a aparecer atrasa a
  // leitura da promessa, que é justamente o que converte.
  const atraso = (indice / Math.max(total, 1)) * 0.5

  return (
    // `overflow-hidden` é a máscara; o span interno desliza por trás dela.
    <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
      <m.span
        className={`inline-block ${className}`}
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, delay: atraso, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}&nbsp;
      </m.span>
    </span>
  )
}
